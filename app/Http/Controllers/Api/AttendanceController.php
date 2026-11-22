<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Section;
use App\Models\Setting;
use App\Models\StaffAttendance;
use App\Models\Student;
use App\Models\Teacher;
use App\Services\SmsService;
use App\Support\CsvExport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    /** GET /attendance?section_id=&date= : attendance sheet (all students of the section with status). */
    public function sheet(Request $request): JsonResponse
    {
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'date' => 'nullable|date',
        ]);
        $date = $data['date'] ?? today()->toDateString();

        $students = Student::active()->where('section_id', $data['section_id'])
            ->orderByRaw('CAST(roll_no AS UNSIGNED)')->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'roll_no', 'admission_no', 'photo']);

        $records = Attendance::where('section_id', $data['section_id'])->whereDate('date', $date)
            ->get()->keyBy('student_id');

        return response()->json([
            'section' => Section::with('schoolClass:id,name')->find($data['section_id']),
            'date' => $date,
            'is_marked' => $records->isNotEmpty(),
            'data' => $students->map(fn ($s) => [
                'student_id' => $s->id,
                'name' => $s->full_name,
                'roll_no' => $s->roll_no,
                'admission_no' => $s->admission_no,
                'status' => $records->get($s->id)?->status,
                'remarks' => $records->get($s->id)?->remarks,
            ]),
        ]);
    }

    /**
     * POST /attendance  { section_id, date, records: [{student_id, status, remarks}], notify_absent? }
     * Creates or updates attendance for the whole section in one call.
     */
    public function store(Request $request, SmsService $sms): JsonResponse
    {
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'date' => 'required|date|before_or_equal:today',
            'records' => 'required|array|min:1',
            'records.*.student_id' => 'required|integer',
            'records.*.status' => 'required|in:'.implode(',', Attendance::STATUSES),
            'records.*.remarks' => 'nullable|string|max:255',
            'notify_absent' => 'nullable|boolean',
        ]);

        $validIds = Student::where('section_id', $data['section_id'])->pluck('id')->flip();
        $now = now();
        $rows = collect($data['records'])
            ->filter(fn ($r) => $validIds->has($r['student_id']))
            ->map(fn ($r) => [
                'student_id' => $r['student_id'],
                'section_id' => $data['section_id'],
                'date' => $data['date'],
                'status' => $r['status'],
                'remarks' => $r['remarks'] ?? null,
                'marked_by' => $request->user()->id,
                'created_at' => $now,
                'updated_at' => $now,
            ])->values();

        Attendance::upsert(\App\Support\Tenant::stamp($rows->all()), ['student_id', 'date'], ['section_id', 'status', 'remarks', 'marked_by', 'updated_at']);

        $notified = 0;
        if ($request->boolean('notify_absent', (bool) Setting::get('sms_on_absence'))) {
            $absentIds = $rows->where('status', 'absent')->pluck('student_id');
            $students = Student::with('guardian:id,phone')->whereIn('id', $absentIds)->get();
            $school = Setting::get('school_name');
            foreach ($students as $student) {
                $notified += $sms->send(
                    $student->guardian?->phone,
                    "Dear Parent, {$student->full_name} is absent from school today (".Carbon::parse($data['date'])->format('d-M-Y')."). - {$school}",
                    $request->user()->id,
                    $request->input('channel')
                );
            }
        }

        return response()->json([
            'message' => 'Attendance saved for '.$rows->count().' student(s).',
            'sms_sent' => $notified,
        ]);
    }

    /** GET /attendance/report?section_id=&month=YYYY-MM&export=csv : monthly register with per-student totals. */
    public function monthlyReport(Request $request)
    {
        $data = $request->validate([
            'section_id' => 'required|exists:sections,id',
            'month' => 'required|date_format:Y-m',
        ]);
        $start = Carbon::createFromFormat('Y-m-d', $data['month'].'-01')->startOfDay();
        $end = $start->copy()->endOfMonth();

        $students = Student::active()->where('section_id', $data['section_id'])
            ->orderByRaw('CAST(roll_no AS UNSIGNED)')->orderBy('first_name')->get();

        $records = Attendance::where('section_id', $data['section_id'])
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get()->groupBy('student_id');

        $codes = ['present' => 'P', 'absent' => 'A', 'late' => 'L', 'leave' => 'LV'];

        $rows = $students->map(function ($s) use ($records, $codes) {
            $list = $records->get($s->id, collect());
            $days = [];
            foreach ($list as $r) {
                $days[$r->date->format('j')] = $codes[$r->status];
            }
            $marked = $list->count();
            $present = $list->whereIn('status', ['present', 'late'])->count();

            return [
                'student_id' => $s->id,
                'name' => $s->full_name,
                'roll_no' => $s->roll_no,
                'days' => $days,
                'present' => $list->where('status', 'present')->count(),
                'absent' => $list->where('status', 'absent')->count(),
                'late' => $list->where('status', 'late')->count(),
                'leave' => $list->where('status', 'leave')->count(),
                'percentage' => $marked ? round($present / $marked * 100, 1) : null,
            ];
        });

        if ($request->query('export') === 'csv') {
            return CsvExport::download($rows->map(function ($r) use ($start) {
                $line = ['roll_no' => $r['roll_no'], 'name' => $r['name']];
                for ($d = 1; $d <= $start->daysInMonth; $d++) {
                    $line['day_'.$d] = $r['days'][$d] ?? '';
                }

                return $line + ['present' => $r['present'], 'absent' => $r['absent'], 'late' => $r['late'], 'leave' => $r['leave'], 'percentage' => $r['percentage']];
            }), 'attendance-'.$data['month']);
        }

        return response()->json([
            'month' => $data['month'],
            'days_in_month' => $start->daysInMonth,
            'working_days' => Attendance::where('section_id', $data['section_id'])
                ->whereBetween('date', [$start->toDateString(), $end->toDateString()])->distinct()->count('date'),
            'data' => $rows,
        ]);
    }

    /** GET /attendance/student/{student}?month=YYYY-MM */
    public function student(Request $request, Student $student): JsonResponse
    {
        return response()->json(self::studentSummary($student, $request->query('month')));
    }

    public static function studentSummary(Student $student, ?string $month): array
    {
        $query = Attendance::where('student_id', $student->id);
        if ($month && preg_match('/^\d{4}-\d{2}$/', $month)) {
            $start = Carbon::createFromFormat('Y-m-d', $month.'-01');
            $query->whereBetween('date', [$start->toDateString(), $start->copy()->endOfMonth()->toDateString()]);
        }
        $records = $query->orderBy('date')->get(['date', 'status', 'remarks']);
        $marked = $records->count();
        $present = $records->whereIn('status', ['present', 'late'])->count();

        return [
            'student' => ['id' => $student->id, 'name' => $student->full_name],
            'summary' => [
                'working_days' => $marked,
                'present' => $records->where('status', 'present')->count(),
                'absent' => $records->where('status', 'absent')->count(),
                'late' => $records->where('status', 'late')->count(),
                'leave' => $records->where('status', 'leave')->count(),
                'percentage' => $marked ? round($present / $marked * 100, 1) : null,
            ],
            'data' => $records,
        ];
    }

    /* ---------------- Staff attendance ---------------- */

    /** GET /staff-attendance?date= */
    public function staffSheet(Request $request): JsonResponse
    {
        $date = $request->validate(['date' => 'nullable|date'])['date'] ?? today()->toDateString();
        $records = StaffAttendance::whereDate('date', $date)->get()->keyBy('teacher_id');

        $teachers = Teacher::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_no', 'designation']);

        return response()->json([
            'date' => $date,
            'data' => $teachers->map(fn ($t) => [
                'teacher_id' => $t->id,
                'name' => $t->name,
                'employee_no' => $t->employee_no,
                'designation' => $t->designation,
                'status' => $records->get($t->id)?->status,
                'check_in' => $records->get($t->id)?->check_in,
                'check_out' => $records->get($t->id)?->check_out,
                'remarks' => $records->get($t->id)?->remarks,
            ]),
        ]);
    }

    /** POST /staff-attendance { date, records: [{teacher_id, status, check_in, check_out, remarks}] } */
    public function staffStore(Request $request): JsonResponse
    {
        $data = $request->validate([
            'date' => 'required|date|before_or_equal:today',
            'records' => 'required|array|min:1',
            'records.*.teacher_id' => 'required|exists:teachers,id',
            'records.*.status' => 'required|in:'.implode(',', Attendance::STATUSES),
            'records.*.check_in' => 'nullable|date_format:H:i',
            'records.*.check_out' => 'nullable|date_format:H:i',
            'records.*.remarks' => 'nullable|string|max:255',
        ]);

        $now = now();
        $rows = collect($data['records'])->map(fn ($r) => [
            'teacher_id' => $r['teacher_id'],
            'date' => $data['date'],
            'status' => $r['status'],
            'check_in' => $r['check_in'] ?? null,
            'check_out' => $r['check_out'] ?? null,
            'remarks' => $r['remarks'] ?? null,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::transaction(fn () => StaffAttendance::upsert(\App\Support\Tenant::stamp($rows->all()), ['teacher_id', 'date'], ['status', 'check_in', 'check_out', 'remarks', 'updated_at']));

        return response()->json(['message' => 'Staff attendance saved for '.$rows->count().' teacher(s).']);
    }

    /** GET /staff-attendance/report?month=YYYY-MM */
    public function staffReport(Request $request): JsonResponse
    {
        $month = $request->validate(['month' => 'required|date_format:Y-m'])['month'];
        $start = Carbon::createFromFormat('Y-m-d', $month.'-01');

        $counts = StaffAttendance::whereBetween('date', [$start->toDateString(), $start->copy()->endOfMonth()->toDateString()])
            ->selectRaw('teacher_id, status, COUNT(*) as total')
            ->groupBy('teacher_id', 'status')->get()->groupBy('teacher_id');

        $teachers = Teacher::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_no']);

        return response()->json([
            'month' => $month,
            'data' => $teachers->map(function ($t) use ($counts) {
                $c = $counts->get($t->id, collect())->pluck('total', 'status');

                return [
                    'teacher_id' => $t->id,
                    'name' => $t->name,
                    'employee_no' => $t->employee_no,
                    'present' => (int) ($c['present'] ?? 0),
                    'absent' => (int) ($c['absent'] ?? 0),
                    'late' => (int) ($c['late'] ?? 0),
                    'leave' => (int) ($c['leave'] ?? 0),
                ];
            }),
        ]);
    }
}
