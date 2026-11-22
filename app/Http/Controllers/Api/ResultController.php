<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClassSubject;
use App\Models\Exam;
use App\Models\Mark;
use App\Models\Section;
use App\Models\Student;
use App\Models\SchoolClass;
use App\Services\ResultService;
use App\Support\CsvExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ResultController extends Controller
{
    public function __construct(protected ResultService $results)
    {
    }

    /** GET /marks/sheet?exam_id=&section_id=&subject_id= : marks entry sheet. */
    public function sheet(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
        ]);

        $students = Student::active()->where('section_id', $data['section_id'])
            ->orderByRaw('CAST(roll_no AS UNSIGNED)')->orderBy('first_name')->get();
        $marks = Mark::where('exam_id', $data['exam_id'])->where('subject_id', $data['subject_id'])
            ->whereIn('student_id', $students->pluck('id'))->get()->keyBy('student_id');

        return response()->json([
            'total_marks' => $marks->first()?->total_marks,
            'data' => $students->map(fn ($s) => [
                'student_id' => $s->id,
                'name' => $s->full_name,
                'roll_no' => $s->roll_no,
                'admission_no' => $s->admission_no,
                'obtained_marks' => $marks->get($s->id)?->obtained_marks,
                'is_absent' => (bool) $marks->get($s->id)?->is_absent,
                'remarks' => $marks->get($s->id)?->remarks,
            ]),
        ]);
    }

    /**
     * POST /marks { exam_id, section_id, subject_id, total_marks,
     *               records: [{student_id, obtained_marks, is_absent, remarks}] }
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'total_marks' => 'required|numeric|min:1|max:1000',
            'records' => 'required|array|min:1',
            'records.*.student_id' => 'required|integer',
            'records.*.obtained_marks' => 'nullable|numeric|min:0',
            'records.*.is_absent' => 'nullable|boolean',
            'records.*.remarks' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        if ($user->role === 'teacher') {
            $section = Section::findOrFail($data['section_id']);
            $teaches = ClassSubject::where('school_class_id', $section->school_class_id)
                ->where('subject_id', $data['subject_id'])->where('teacher_id', $user->teacher?->id)->exists();
            if (! $teaches && $section->class_teacher_id != $user->teacher?->id) {
                abort(403, 'You are not assigned to teach this subject in this class.');
            }
        }

        $errors = [];
        foreach ($data['records'] as $i => $r) {
            if (! ($r['is_absent'] ?? false) && isset($r['obtained_marks']) && $r['obtained_marks'] > $data['total_marks']) {
                $errors["records.$i.obtained_marks"] = 'Obtained marks cannot be greater than total marks.';
            }
        }
        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        $validIds = Student::where('section_id', $data['section_id'])->pluck('id')->flip();
        $now = now();
        $rows = collect($data['records'])
            ->filter(fn ($r) => $validIds->has($r['student_id']))
            ->map(fn ($r) => [
                'exam_id' => $data['exam_id'],
                'student_id' => $r['student_id'],
                'subject_id' => $data['subject_id'],
                'total_marks' => $data['total_marks'],
                'obtained_marks' => ($r['is_absent'] ?? false) ? null : ($r['obtained_marks'] ?? null),
                'is_absent' => (bool) ($r['is_absent'] ?? false),
                'remarks' => $r['remarks'] ?? null,
                'entered_by' => $user->id,
                'created_at' => $now,
                'updated_at' => $now,
            ])->values();

        Mark::upsert(\App\Support\Tenant::stamp($rows->all()), ['exam_id', 'student_id', 'subject_id'],
            ['total_marks', 'obtained_marks', 'is_absent', 'remarks', 'entered_by', 'updated_at']);

        return response()->json(['message' => 'Marks saved for '.$rows->count().' student(s).']);
    }

    /** GET /results/section?exam_id=&section_id=&export=csv : tabulation sheet with positions. */
    public function section(Request $request)
    {
        $data = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'section_id' => 'required|exists:sections,id',
        ]);
        $exam = Exam::findOrFail($data['exam_id']);
        $rows = $this->results->sectionResult($exam, (int) $data['section_id'])->values();

        if ($request->query('export') === 'csv') {
            return CsvExport::download($rows->sortBy(fn ($r) => $r['position'] ?? PHP_INT_MAX)->map(function ($r) {
                $line = ['position' => $r['position'], 'roll_no' => $r['student']['roll_no'], 'admission_no' => $r['student']['admission_no'], 'name' => $r['student']['name']];
                foreach ($r['subjects'] as $s) {
                    $line[$s['subject']] = $s['is_absent'] ? 'Absent' : $s['obtained_marks'].'/'.$s['total_marks'];
                }

                return $line + ['total' => $r['obtained_marks'].'/'.$r['total_marks'], 'percentage' => $r['percentage'], 'grade' => $r['grade'], 'result' => $r['result']];
            }), 'result-'.$exam->name);
        }

        return response()->json([
            'exam' => $exam,
            'section' => Section::with('schoolClass:id,name')->find($data['section_id']),
            'summary' => [
                'students' => $rows->count(),
                'passed' => $rows->where('result', 'Pass')->count(),
                'failed' => $rows->where('result', 'Fail')->count(),
                'average_percentage' => round((float) $rows->where('result', '!=', 'N/A')->avg('percentage'), 2),
            ],
            'data' => $rows->sortBy(fn ($r) => $r['position'] ?? PHP_INT_MAX)->values(),
        ]);
    }

    /** GET /results/report-card?exam_id=&student_id=  (add &pdf=1 to download) */
    public function reportCard(Request $request)
    {
        $data = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'student_id' => 'required|exists:students,id',
        ]);

        return self::renderReportCard(
            $this->results,
            Exam::with('academicSession')->findOrFail($data['exam_id']),
            Student::findOrFail($data['student_id']),
            $request->boolean('pdf')
        );
    }

    public static function renderReportCard(ResultService $results, Exam $exam, Student $student, bool $pdf)
    {
        $card = $results->reportCard($exam, $student);

        if ($pdf) {
            return Pdf::loadView('pdf.report-card', ['card' => $card])
                ->setPaper('a4')
                ->download("report-card-{$student->admission_no}-{$exam->id}.pdf");
        }

        return response()->json(['data' => $card]);
    }

    /**
     * GET /results/subject-performance?exam_id=&school_class_id=
     * Class-wise performance per subject: average, highest, lowest, pass %.
     */
    public function subjectPerformance(Request $request): JsonResponse
    {
        $data = $request->validate([
            'exam_id' => 'required|exists:exams,id',
            'school_class_id' => 'required|exists:school_classes,id',
        ]);
        $passPct = (float) \App\Models\Setting::get('pass_percentage', 33);

        $marks = Mark::with('subject:id,name')
            ->where('exam_id', $data['exam_id'])
            ->whereHas('student', fn ($q) => $q->where('school_class_id', $data['school_class_id']))
            ->get();

        $subjects = $marks->groupBy('subject_id')->map(function ($group) use ($passPct) {
            $present = $group->where('is_absent', false);
            $pcts = $present->map(fn ($m) => $m->total_marks > 0 ? $m->obtained_marks / $m->total_marks * 100 : 0);

            return [
                'subject' => $group->first()->subject?->name,
                'students' => $group->count(),
                'absent' => $group->where('is_absent', true)->count(),
                'average_percentage' => round((float) $pcts->avg(), 2),
                'highest' => $present->max('obtained_marks'),
                'lowest' => $present->min('obtained_marks'),
                'pass_percentage' => $present->count() ? round($pcts->filter(fn ($p) => $p >= $passPct)->count() / $group->count() * 100, 1) : 0,
            ];
        })->sortBy('subject')->values();

        return response()->json([
            'exam' => Exam::find($data['exam_id'])->only('id', 'name'),
            'class' => SchoolClass::find($data['school_class_id'])->only('id', 'name'),
            'data' => $subjects,
        ]);
    }

    /**
     * GET /results/student-progress?student_id=
     * Performance across every exam (all sessions) for year-over-year progress tracking.
     */
    public function studentProgress(Request $request): JsonResponse
    {
        $student = Student::findOrFail($request->validate(['student_id' => 'required|exists:students,id'])['student_id']);

        return response()->json(self::progressData($student, false));
    }

    public static function progressData(Student $student, bool $publishedOnly): array
    {
        $marks = Mark::with('exam.academicSession:id,name', 'subject:id,name')
            ->where('student_id', $student->id)
            ->when($publishedOnly, fn ($q) => $q->whereHas('exam', fn ($e) => $e->where('is_published', true)))
            ->get();

        $exams = $marks->groupBy('exam_id')->map(function ($group) {
            $exam = $group->first()->exam;
            $total = $group->sum('total_marks');
            $obtained = $group->sum(fn ($m) => $m->is_absent ? 0 : $m->obtained_marks);
            $pct = $total > 0 ? round($obtained / $total * 100, 2) : 0;

            return [
                'exam_id' => $exam->id,
                'exam' => $exam->name,
                'session' => $exam->academicSession?->name,
                'date' => $exam->start_date?->format('Y-m-d'),
                'percentage' => $pct,
                'grade' => \App\Models\Grade::forPercentage($pct)?->name,
                'subjects' => $group->mapWithKeys(fn ($m) => [$m->subject?->name => $m->total_marks > 0 && ! $m->is_absent ? round($m->obtained_marks / $m->total_marks * 100, 1) : 0]),
            ];
        })->sortBy('date')->values();

        $bySession = $exams->groupBy('session')->map(fn ($g) => round($g->avg('percentage'), 2));

        return [
            'student' => $student->only('id', 'full_name', 'admission_no'),
            'exams' => $exams,
            'session_averages' => $bySession,
            'trend' => $exams->count() >= 2 ? round($exams->last()['percentage'] - $exams->first()['percentage'], 2) : null,
        ];
    }
}
