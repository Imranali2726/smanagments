<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Exam;
use App\Models\Grade;
use App\Models\Mark;
use App\Models\Setting;
use App\Models\Student;
use Illuminate\Support\Collection;

class ResultService
{
    /**
     * Full result of a section for an exam, with class positions.
     * Returns a collection of rows keyed by student id.
     */
    public function sectionResult(Exam $exam, int $sectionId): Collection
    {
        $students = Student::where('section_id', $sectionId)
            ->whereIn('status', ['active', 'graduated'])
            ->orderByRaw('CAST(roll_no AS UNSIGNED)')
            ->orderBy('first_name')
            ->get();

        $marks = Mark::with('subject:id,name,code')
            ->where('exam_id', $exam->id)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->groupBy('student_id');

        $passPct = (float) Setting::get('pass_percentage', 33);

        $rows = $students->map(function (Student $student) use ($marks, $passPct) {
            $studentMarks = $marks->get($student->id, collect());

            $subjects = $studentMarks->map(function (Mark $m) use ($passPct) {
                $obtained = $m->is_absent ? 0 : (float) $m->obtained_marks;
                $pct = $m->total_marks > 0 ? round($obtained / $m->total_marks * 100, 2) : 0;

                return [
                    'subject_id' => $m->subject_id,
                    'subject' => $m->subject?->name,
                    'total_marks' => $m->total_marks,
                    'obtained_marks' => $m->is_absent ? null : $m->obtained_marks,
                    'is_absent' => $m->is_absent,
                    'percentage' => $pct,
                    'grade' => Grade::forPercentage($pct)?->name,
                    'passed' => ! $m->is_absent && $pct >= $passPct,
                    'remarks' => $m->remarks,
                ];
            })->sortBy('subject')->values();

            $total = $subjects->sum('total_marks');
            $obtained = $subjects->sum(fn ($s) => (float) ($s['obtained_marks'] ?? 0));
            $percentage = $total > 0 ? round($obtained / $total * 100, 2) : 0;
            $grade = Grade::forPercentage($percentage);

            return [
                'student' => [
                    'id' => $student->id,
                    'name' => $student->full_name,
                    'admission_no' => $student->admission_no,
                    'roll_no' => $student->roll_no,
                ],
                'subjects' => $subjects,
                'total_marks' => $total,
                'obtained_marks' => $obtained,
                'percentage' => $percentage,
                'grade' => $grade?->name,
                'grade_remarks' => $grade?->remarks,
                'result' => $subjects->isEmpty() ? 'N/A' : ($subjects->every(fn ($s) => $s['passed']) ? 'Pass' : 'Fail'),
                'position' => null,
            ];
        });

        // Competition ranking (1, 2, 2, 4) among students that have marks.
        $position = 0;
        $index = 0;
        $previous = null;
        $ranked = $rows->filter(fn ($r) => $r['subjects']->isNotEmpty())->sortByDesc('percentage');
        $positions = [];
        foreach ($ranked as $row) {
            $index++;
            if ($row['percentage'] !== $previous) {
                $position = $index;
                $previous = $row['percentage'];
            }
            $positions[$row['student']['id']] = $position;
        }

        return $rows->map(function ($row) use ($positions) {
            $row['position'] = $positions[$row['student']['id']] ?? null;

            return $row;
        })->keyBy(fn ($row) => $row['student']['id']);
    }

    public function reportCard(Exam $exam, Student $student): array
    {
        $student->loadMissing('schoolClass', 'section', 'guardian');
        $sectionResult = $this->sectionResult($exam, $student->section_id);
        $row = $sectionResult->get($student->id);

        $attendance = null;
        if ($exam->academicSession) {
            $counts = Attendance::where('student_id', $student->id)
                ->whereBetween('date', [$exam->academicSession->start_date, $exam->end_date ?? now()])
                ->selectRaw('status, COUNT(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');
            $working = (int) $counts->sum();
            $attendance = [
                'working_days' => $working,
                'present' => (int) ($counts['present'] ?? 0) + (int) ($counts['late'] ?? 0),
                'absent' => (int) ($counts['absent'] ?? 0),
                'leave' => (int) ($counts['leave'] ?? 0),
            ];
        }

        return [
            'school' => [
                'name' => Setting::get('school_name'),
                'address' => Setting::get('school_address'),
                'phone' => Setting::get('school_phone'),
            ],
            'exam' => $exam->only('id', 'name', 'start_date', 'end_date'),
            'session' => $exam->academicSession?->name,
            'student' => [
                'id' => $student->id,
                'name' => $student->full_name,
                'admission_no' => $student->admission_no,
                'roll_no' => $student->roll_no,
                'class' => $student->schoolClass?->name,
                'section' => $student->section?->name,
                'father_name' => $student->guardian?->name,
                'date_of_birth' => $student->date_of_birth?->format('Y-m-d'),
            ],
            'subjects' => $row['subjects'] ?? collect(),
            'total_marks' => $row['total_marks'] ?? 0,
            'obtained_marks' => $row['obtained_marks'] ?? 0,
            'percentage' => $row['percentage'] ?? 0,
            'grade' => $row['grade'] ?? null,
            'grade_remarks' => $row['grade_remarks'] ?? null,
            'result' => $row['result'] ?? 'N/A',
            'position' => $row['position'] ?? null,
            'class_strength' => $sectionResult->count(),
            'attendance' => $attendance,
        ];
    }
}
