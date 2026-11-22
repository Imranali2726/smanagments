<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSubject;
use App\Models\ExamSchedule;
use App\Models\HomeworkSubmission;
use App\Models\StudyMaterial;
use App\Models\Exam;
use App\Models\FeeInvoice;
use App\Models\FeePayment;
use App\Models\PaymentSubmission;
use App\Models\Homework;
use App\Models\Section;
use App\Models\Student;
use App\Models\Timetable;
use App\Services\ResultService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Self-service endpoints for students, parents and teachers.
 * A student sees only themself; a parent sees only their own children.
 */
class PortalController extends Controller
{
    protected function authorizeStudent(Request $request, Student $student): void
    {
        $user = $request->user();

        $allowed = match ($user->role) {
            'admin' => true,
            'student' => $student->user_id == $user->id,
            'parent' => $user->guardian && $student->guardian_id == $user->guardian->id,
            default => false,
        };

        abort_unless($allowed, 403, 'You are not allowed to view this student.');
    }

    /** GET /portal/children */
    public function children(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Student::with('schoolClass:id,name', 'section:id,name', 'transportRoute.vehicle:id,vehicle_no,driver_name,driver_phone', 'activeHostelAllocation.room.hostel:id,name');

        $students = match ($user->role) {
            'student' => $query->where('user_id', $user->id)->get(),
            'parent' => $user->guardian ? $query->where('guardian_id', $user->guardian->id)->get() : collect(),
            default => collect(),
        };

        return response()->json(['data' => $students]);
    }

    /** GET /portal/students/{student}/attendance?month=YYYY-MM */
    public function attendance(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(AttendanceController::studentSummary($student, $request->query('month', now()->format('Y-m'))));
    }

    /** GET /portal/students/{student}/fees */
    public function fees(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(FeeController::studentLedger($student));
    }

    /** GET /portal/students/{student}/invoices/{invoice}/voucher */
    public function voucher(Request $request, Student $student, FeeInvoice $invoice)
    {
        $this->authorizeStudent($request, $student);
        abort_unless($invoice->student_id == $student->id, 404);

        return app(FeeController::class)->voucher($invoice);
    }

    /** GET /portal/students/{student}/exams : published exams. */
    public function exams(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(['data' => Exam::where('is_published', true)
            ->whereHas('marks', fn ($q) => $q->where('student_id', $student->id))
            ->orderByDesc('start_date')->get()]);
    }

    /** GET /portal/students/{student}/results/{exam}?pdf=1 */
    public function result(Request $request, Student $student, Exam $exam, ResultService $results)
    {
        $this->authorizeStudent($request, $student);
        abort_unless($exam->is_published || $request->user()->role === 'admin', 403, 'Result has not been published yet.');

        return ResultController::renderReportCard($results, $exam->load('academicSession'), $student, $request->boolean('pdf'));
    }

    /** GET /portal/students/{student}/timetable */
    public function timetable(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(['data' => $this->groupedTimetable(
            Timetable::with('subject:id,name', 'teacher:id,name')->where('section_id', $student->section_id)
        )]);
    }

    /** GET /portal/students/{student}/homework */
    public function homework(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        $page = Homework::with('subject:id,name', 'teacher:id,name')
            ->where('section_id', $student->section_id)
            ->orderByDesc('assigned_date')
            ->paginate(20);

        $subs = HomeworkSubmission::where('student_id', $student->id)
            ->whereIn('homework_id', $page->getCollection()->pluck('id'))->get()->keyBy('homework_id');
        $page->getCollection()->transform(function ($hw) use ($subs) {
            $hw->setAttribute('submission', $subs->get($hw->id));

            return $hw;
        });

        return response()->json($page);
    }

    /** GET /portal/students/{student}/downloads?type= : download center (assignments, syllabus, study material, circulars). */
    public function downloads(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(StudyMaterial::with('subject:id,name', 'uploader:id,name')
            ->where('is_public', true)
            ->where(fn ($q) => $q->whereNull('school_class_id')->orWhere('school_class_id', $student->school_class_id))
            ->where(fn ($q) => $q->whereNull('section_id')->orWhere('section_id', $student->section_id))
            ->when($request->query('type'), fn ($q, $v) => $q->where('type', $v))
            ->latest()
            ->paginate(20));
    }

    /** GET /portal/students/{student}/exam-schedule?exam_id= */
    public function examSchedule(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(['data' => ExamSchedule::with('exam:id,name', 'subject:id,name')
            ->where('school_class_id', $student->school_class_id)
            ->when($request->query('exam_id'), fn ($q, $v) => $q->where('exam_id', $v), fn ($q) => $q->whereDate('exam_date', '>=', today()->subDays(30)))
            ->orderBy('exam_date')->orderBy('start_time')
            ->get()]);
    }

    /** GET /portal/students/{student}/progress : year-over-year result progress (published exams). */
    public function progress(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(ResultController::progressData($student, true));
    }

    /* ---------------- Teacher self-service ---------------- */

    /** GET /teacher/classes : subjects the teacher teaches + sections where they are class teacher. */
    public function teacherClasses(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        abort_unless($teacher, 403, 'No teacher profile linked to this account.');

        $subjects = ClassSubject::with('schoolClass.sections:id,school_class_id,name', 'subject:id,name,code')
            ->where('teacher_id', $teacher->id)->get();

        return response()->json([
            'teacher' => $teacher,
            'class_teacher_of' => Section::with('schoolClass:id,name')->withCount('students')->where('class_teacher_id', $teacher->id)->get(),
            'subjects' => $subjects,
        ]);
    }

    /** GET /teacher/timetable */
    public function teacherTimetable(Request $request): JsonResponse
    {
        $teacher = $request->user()->teacher;
        abort_unless($teacher, 403, 'No teacher profile linked to this account.');

        return response()->json(['data' => $this->groupedTimetable(
            Timetable::with('subject:id,name', 'section.schoolClass:id,name')->where('teacher_id', $teacher->id)
        )]);
    }

    protected function groupedTimetable($query): array
    {
        $periods = $query->orderBy('start_time')->get()->groupBy('day');
        $result = [];
        foreach (Timetable::DAYS as $day) {
            if ($periods->has($day)) {
                $result[$day] = $periods[$day]->values();
            }
        }

        return $result;
    }

    /** GET /portal/students/{student}/payments/{payment}/receipt  (PDF) */
    public function receipt(Request $request, Student $student, FeePayment $payment)
    {
        $this->authorizeStudent($request, $student);
        abort_unless($payment->invoice && $payment->invoice->student_id == $student->id, 404);

        return app(FeeController::class)->receipt($payment);
    }

    /** GET /portal/students/{student}/payment-submissions : online payments and their verification status. */
    public function paymentSubmissions(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(['data' => PaymentSubmission::with('invoice:id,invoice_no,month')
            ->where('student_id', $student->id)->latest()->limit(50)->get()]);
    }

    /** GET /portal/students/{student}/remarks  behaviour remarks shared with parents. */
    public function remarks(Request $request, Student $student): JsonResponse
    {
        $this->authorizeStudent($request, $student);

        return response()->json(['data' => \App\Models\StudentRemark::with('creator:id,name')
            ->where('student_id', $student->id)->where('visible_to_parent', true)
            ->orderByDesc('remark_date')->limit(100)->get()]);
    }
}
