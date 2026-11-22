<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\StaffAttendance;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Leave management for staff (teachers / non-teaching) and students.
 * Staff apply for themselves; parents apply for their children; admin can apply for anyone and approves.
 * Approving a leave marks attendance as "leave" for those dates (Sundays skipped).
 */
class LeaveRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = LeaveRequest::with('leaveType:id,name', 'teacher:id,name,employee_no', 'student:id,first_name,last_name,admission_no,section_id', 'reviewer:id,name')
            ->when($request->query('status'), fn ($q, $v) => $q->where('status', $v))
            ->when($request->query('type') === 'staff', fn ($q) => $q->whereNotNull('teacher_id'))
            ->when($request->query('type') === 'student', fn ($q) => $q->whereNotNull('student_id'))
            ->when($request->query('teacher_id'), fn ($q, $v) => $q->where('teacher_id', $v))
            ->when($request->query('student_id'), fn ($q, $v) => $q->where('student_id', $v))
            ->orderByDesc('from_date');

        // Non-admins only see their own requests (and teachers see their class-teacher sections' students).
        if ($user->role !== 'admin') {
            $query->where(function ($q) use ($user) {
                $q->where('applied_by', $user->id);
                if ($user->teacher) {
                    $q->orWhere('teacher_id', $user->teacher->id)
                        ->orWhereHas('student', fn ($s) => $s->whereIn('section_id', $user->teacher->sections()->pluck('id')));
                }
                if ($user->guardian) {
                    $q->orWhereHas('student', fn ($s) => $s->where('guardian_id', $user->guardian->id));
                }
                if ($user->student) {
                    $q->orWhere('student_id', $user->student->id);
                }
            });
        }

        return response()->json($query->paginate(min((int) $request->query('per_page', 20), 200)));
    }

    /** POST /leave-requests { leave_type_id, from_date, to_date, reason, student_id?, teacher_id?, attachment? } */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validate([
            'leave_type_id' => 'nullable|exists:leave_types,id',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after_or_equal:from_date',
            'reason' => 'required|string|max:2000',
            'student_id' => 'nullable|exists:students,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'attachment' => 'nullable|file|max:5120',
        ]);

        // Work out whose leave this is.
        if ($user->role === 'parent') {
            $student = Student::findOrFail($data['student_id'] ?? 0);
            abort_unless($user->guardian && $student->guardian_id == $user->guardian->id, 403, 'You can only apply for your own child.');
            $data['teacher_id'] = null;
        } elseif ($user->role === 'student') {
            abort_unless($user->student, 403);
            $data['student_id'] = $user->student->id;
            $data['teacher_id'] = null;
        } elseif ($user->role !== 'admin') {
            abort_unless($user->teacher, 403, 'No staff profile is linked to your account.');
            $data['teacher_id'] = $user->teacher->id;
            $data['student_id'] = null;
        } elseif (empty($data['student_id']) === empty($data['teacher_id'])) {
            throw ValidationException::withMessages(['teacher_id' => 'Select either a staff member or a student.']);
        }

        $from = Carbon::parse($data['from_date']);
        $to = Carbon::parse($data['to_date']);
        $days = $this->countDays($from, $to);

        // Leave balance check
        if (! empty($data['leave_type_id'])) {
            $type = LeaveType::find($data['leave_type_id']);
            if ($type->days_allowed > 0) {
                $used = LeaveRequest::where('leave_type_id', $type->id)->where('status', 'approved')
                    ->where($data['teacher_id'] ? 'teacher_id' : 'student_id', $data['teacher_id'] ?: $data['student_id'])
                    ->whereYear('from_date', $from->year)->sum('days');
                if ($used + $days > $type->days_allowed) {
                    throw ValidationException::withMessages(['leave_type_id' => "Only ".max(0, $type->days_allowed - $used)." day(s) of {$type->name} remaining this year."]);
                }
            }
        }

        $overlap = LeaveRequest::whereIn('status', ['pending', 'approved'])
            ->where($data['teacher_id'] ? 'teacher_id' : 'student_id', $data['teacher_id'] ?: $data['student_id'])
            ->where('from_date', '<=', $to->toDateString())->where('to_date', '>=', $from->toDateString())->exists();
        if ($overlap) {
            throw ValidationException::withMessages(['from_date' => 'A leave request already exists for these dates.']);
        }

        if ($request->hasFile('attachment')) {
            $data['attachment'] = $request->file('attachment')->store('leaves', 'public');
        }

        $leave = LeaveRequest::create($data + ['days' => $days, 'applied_by' => $user->id, 'status' => 'pending']);

        return response()->json(['message' => 'Leave request submitted.', 'data' => $leave->load('leaveType:id,name')], 201);
    }

    /** POST /leave-requests/{id}/approve | /reject  { remarks? } */
    public function approve(Request $request, int $id): JsonResponse
    {
        return $this->review($request, $id, 'approved');
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        return $this->review($request, $id, 'rejected');
    }

    protected function review(Request $request, int $id, string $status): JsonResponse
    {
        $leave = LeaveRequest::findOrFail($id);
        if ($leave->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'This request has already been '.$leave->status.'.']);
        }
        $remarks = $request->validate(['remarks' => 'nullable|string|max:255'])['remarks'] ?? null;

        DB::transaction(function () use ($leave, $status, $remarks, $request) {
            $leave->update(['status' => $status, 'reviewed_by' => $request->user()->id, 'reviewed_at' => now(), 'remarks' => $remarks]);
            if ($status === 'approved') {
                $this->markAttendance($leave, $request->user()->id);
            }
        });

        return response()->json(['message' => 'Leave '.$status.'.', 'data' => $leave->fresh()]);
    }

    /** POST /leave-requests/{id}/cancel — by the applicant while still pending. */
    public function cancel(Request $request, int $id): JsonResponse
    {
        $leave = LeaveRequest::findOrFail($id);
        abort_unless($leave->applied_by == $request->user()->id || $request->user()->role === 'admin', 403);
        if ($leave->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'Only pending requests can be cancelled.']);
        }
        $leave->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Leave request cancelled.']);
    }

    protected function countDays(Carbon $from, Carbon $to): int
    {
        $days = 0;
        for ($d = $from->copy(); $d->lte($to); $d->addDay()) {
            if (! $d->isSunday()) {
                $days++;
            }
        }

        return max(1, $days);
    }

    protected function markAttendance(LeaveRequest $leave, int $userId): void
    {
        $rows = [];
        $now = now();
        $student = $leave->student_id ? Student::find($leave->student_id) : null;
        for ($d = $leave->from_date->copy(); $d->lte($leave->to_date); $d->addDay()) {
            if ($d->isSunday()) {
                continue;
            }
            $rows[] = $student
                ? ['student_id' => $student->id, 'section_id' => $student->section_id, 'date' => $d->toDateString(), 'status' => 'leave', 'remarks' => 'Approved leave', 'marked_by' => $userId, 'created_at' => $now, 'updated_at' => $now]
                : ['teacher_id' => $leave->teacher_id, 'date' => $d->toDateString(), 'status' => 'leave', 'remarks' => 'Approved leave', 'created_at' => $now, 'updated_at' => $now];
        }
        if (! $rows) {
            return;
        }
        $student
            ? Attendance::upsert(\App\Support\Tenant::stamp($rows), ['student_id', 'date'], ['status', 'remarks', 'updated_at'])
            : StaffAttendance::upsert(\App\Support\Tenant::stamp($rows), ['teacher_id', 'date'], ['status', 'remarks', 'updated_at']);
    }
}
