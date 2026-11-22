<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Homework;
use App\Models\HomeworkSubmission;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class HomeworkSubmissionController extends Controller
{
    /** GET /homework/{homework}/submissions : every student of the section with submission status (teacher view). */
    public function index(Request $request, Homework $homework): JsonResponse
    {
        $this->authorizeTeacher($request, $homework);

        $students = Student::active()->where('section_id', $homework->section_id)
            ->orderByRaw('CAST(roll_no AS UNSIGNED)')->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'roll_no', 'admission_no']);
        $subs = HomeworkSubmission::where('homework_id', $homework->id)->get()->keyBy('student_id');

        $rows = $students->map(fn ($s) => [
            'student_id' => $s->id,
            'name' => $s->full_name,
            'roll_no' => $s->roll_no,
            'submission' => $subs->get($s->id),
            'status' => $subs->get($s->id)?->status ?? 'pending',
        ]);

        return response()->json([
            'homework' => $homework->load('subject:id,name', 'section.schoolClass:id,name'),
            'summary' => [
                'students' => $rows->count(),
                'submitted' => $subs->count(),
                'pending' => $rows->count() - $subs->count(),
                'late' => $subs->where('status', 'late')->count(),
                'evaluated' => $subs->where('status', 'evaluated')->count(),
            ],
            'data' => $rows,
        ]);
    }

    /**
     * POST /portal/students/{student}/homework/{homework}/submit  (student or parent)
     * { content?, attachment? (file) } — resubmitting replaces the previous submission until evaluated.
     */
    public function submit(Request $request, Student $student, Homework $homework): JsonResponse
    {
        $user = $request->user();
        $allowed = ($user->role === 'student' && $student->user_id == $user->id)
            || ($user->role === 'parent' && $user->guardian && $student->guardian_id == $user->guardian->id)
            || $user->role === 'admin';
        abort_unless($allowed, 403);
        abort_unless($homework->section_id == $student->section_id, 404, 'Homework not found for this student.');

        $data = $request->validate([
            'content' => 'nullable|required_without:attachment|string|max:10000',
            'attachment' => 'nullable|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,txt,zip',
        ]);

        $sub = HomeworkSubmission::firstOrNew(['homework_id' => $homework->id, 'student_id' => $student->id]);
        if ($sub->exists && $sub->status === 'evaluated') {
            throw ValidationException::withMessages(['content' => 'This homework has already been evaluated.']);
        }
        if ($request->hasFile('attachment')) {
            if ($sub->attachment) {
                Storage::disk('public')->delete($sub->attachment);
            }
            $sub->attachment = $request->file('attachment')->store('homework-submissions', 'public');
        }
        $sub->content = $data['content'] ?? $sub->content;
        $sub->submitted_at = now();
        $sub->status = $homework->due_date && now()->startOfDay()->gt($homework->due_date) ? 'late' : 'submitted';
        $sub->save();

        return response()->json(['message' => 'Homework submitted.', 'data' => $sub], 201);
    }

    /** POST /homework-submissions/{submission}/evaluate { marks?, feedback? } */
    public function evaluate(Request $request, HomeworkSubmission $submission): JsonResponse
    {
        $this->authorizeTeacher($request, $submission->homework);
        $data = $request->validate([
            'marks' => 'nullable|numeric|min:0|max:1000',
            'feedback' => 'nullable|string|max:5000',
        ]);
        $submission->update($data + ['status' => 'evaluated', 'evaluated_by' => $request->user()->id, 'evaluated_at' => now()]);

        return response()->json(['message' => 'Submission evaluated.', 'data' => $submission]);
    }

    protected function authorizeTeacher(Request $request, Homework $homework): void
    {
        $user = $request->user();
        if ($user->role === 'teacher') {
            abort_unless($homework->teacher_id == $user->teacher?->id, 403, 'This homework belongs to another teacher.');
        }
    }
}
