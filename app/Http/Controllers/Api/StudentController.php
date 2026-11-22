<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\CreatesLoginAccount;
use App\Models\AcademicSession;
use App\Models\Attendance;
use App\Models\FeeInvoice;
use App\Models\Section;
use App\Models\Guardian;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentHistory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class StudentController extends CrudController
{
    use CreatesLoginAccount;

    protected string $model = Student::class;

    protected array $with = ['schoolClass:id,name', 'section:id,name', 'guardian:id,name,phone,relation', 'transportRoute:id,name,fare', 'user:id,email,is_active'];

    protected array $searchable = ['first_name', 'last_name', 'admission_no', 'roll_no', 'b_form', 'phone'];

    protected array $filterable = ['school_class_id', 'section_id', 'guardian_id', 'academic_session_id', 'transport_route_id', 'status', 'gender'];

    protected ?string $dateColumn = 'admission_date';

    protected string $orderBy = 'first_name';

    protected string $orderDirection = 'asc';

    protected array $nonColumns = ['create_login', 'login_email', 'password'];

    protected array $fileFields = ['photo' => 'students'];

    protected function rules(Request $request, ?int $id = null): array
    {
        $userId = $id ? Student::find($id)?->user_id : null;

        return array_merge([
            'admission_no' => ['nullable', 'string', 'max:30', Rule::unique('students')->ignore($id)],
            'roll_no' => 'nullable|string|max:20',
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'b_form' => 'nullable|string|max:20',
            'blood_group' => 'nullable|string|max:5',
            'religion' => 'nullable|string|max:30',
            'nationality' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:30',
            'address' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:2048',
            'previous_school' => 'nullable|string|max:255',
            'admission_date' => 'nullable|date',
            'school_class_id' => 'required|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'guardian_id' => 'nullable|exists:guardians,id',
            'transport_route_id' => 'nullable|exists:transport_routes,id',
            'monthly_discount' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,left,graduated,suspended',
            'notes' => 'nullable|string|max:2000',
        ], $this->loginRules($userId));
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        $classId = $data['school_class_id'] ?? $item?->school_class_id;
        $sectionId = $data['section_id'] ?? $item?->section_id;
        if ($sectionId && ! Section::where('id', $sectionId)->where('school_class_id', $classId)->exists()) {
            throw ValidationException::withMessages(['section_id' => 'The selected section does not belong to the selected class.']);
        }

        if (! $item) {
            $data['admission_no'] = $data['admission_no'] ?? Student::nextAdmissionNo();
            $data['admission_date'] = $data['admission_date'] ?? today()->toDateString();
            $data['academic_session_id'] = $data['academic_session_id'] ?? AcademicSession::current()?->id;
        }

        return $data;
    }

    protected function afterSave(Model $item, Request $request, bool $created): void
    {
        $this->syncLoginAccount($item, $request, 'student', $item->full_name);

        if ($created) {
            StudentHistory::record($item, 'admitted', 'Admitted to '.$item->schoolClass?->name.' - '.$item->section?->name);
        } else {
            if ($item->wasChanged(['school_class_id', 'section_id'])) {
                $item->load('schoolClass', 'section');
                StudentHistory::record($item, 'transferred', 'Moved to '.$item->schoolClass?->name.' - '.$item->section?->name);
            }
            if ($item->wasChanged('status')) {
                StudentHistory::record($item, 'status_changed', 'Status changed to '.$item->status);
            }
        }

        if ($item->user_id && $request->has('status')) {
            $item->user()->update(['is_active' => $item->status === 'active']);
        }
    }

    /** Full profile: details + attendance summary + fee summary. */
    public function show(int $id): JsonResponse
    {
        $student = Student::with($this->with)->findOrFail($id);

        $attendance = Attendance::where('student_id', $id)
            ->selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        $fees = FeeInvoice::where('student_id', $id)->where('status', '!=', 'cancelled')
            ->selectRaw('COALESCE(SUM(total),0) as billed, COALESCE(SUM(paid),0) as paid')->first();

        return response()->json([
            'data' => $student,
            'summary' => [
                'attendance' => $attendance,
                'fees' => [
                    'billed' => (float) $fees->billed,
                    'paid' => (float) $fees->paid,
                    'balance' => round((float) $fees->billed - (float) $fees->paid, 2),
                ],
            ],
        ]);
    }

    /**
     * Promote students to the next class / session.
     * Body: student_ids[] (or from_section_id), to_class_id, to_section_id, to_session_id?, mark_graduated?
     */
    public function promote(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_ids' => 'required_without:from_section_id|array',
            'student_ids.*' => 'integer|exists:students,id',
            'from_section_id' => 'required_without:student_ids|exists:sections,id',
            'mark_graduated' => 'nullable|boolean',
            'to_class_id' => 'required_unless:mark_graduated,1,true|nullable|exists:school_classes,id',
            'to_section_id' => 'required_unless:mark_graduated,1,true|nullable|exists:sections,id',
            'to_session_id' => 'nullable|exists:academic_sessions,id',
        ]);

        $query = Student::active()
            ->when($data['student_ids'] ?? null, fn ($q, $ids) => $q->whereIn('id', $ids))
            ->when($data['from_section_id'] ?? null, fn ($q, $s) => $q->where('section_id', $s));

        $ids = (clone $query)->pluck('id');

        if ($request->boolean('mark_graduated')) {
            $count = $query->update(['status' => 'graduated']);
            Student::whereIn('id', $ids)->get()->each(fn ($s) => StudentHistory::record($s, 'graduated', 'Marked as graduated'));

            return response()->json(['message' => "{$count} student(s) marked as graduated."]);
        }

        if (! Section::where('id', $data['to_section_id'])->where('school_class_id', $data['to_class_id'])->exists()) {
            throw ValidationException::withMessages(['to_section_id' => 'The section does not belong to the target class.']);
        }

        $count = $query->update(array_filter([
            'school_class_id' => $data['to_class_id'],
            'section_id' => $data['to_section_id'],
            'academic_session_id' => $data['to_session_id'] ?? null,
        ]));
        Student::with('schoolClass', 'section')->whereIn('id', $ids)->get()
            ->each(fn ($s) => StudentHistory::record($s, 'promoted', 'Promoted to '.$s->schoolClass?->name.' - '.$s->section?->name));

        return response()->json(['message' => "{$count} student(s) promoted successfully."]);
    }

    /** GET /students/{id}/history : class, section, session and status changes. */
    public function history(int $id): JsonResponse
    {
        $student = Student::findOrFail($id);

        return response()->json([
            'student' => $student->only('id', 'full_name', 'admission_no'),
            'data' => $student->histories()->with('academicSession:id,name', 'schoolClass:id,name', 'section:id,name', 'changer:id,name')->get(),
        ]);
    }

    /**
     * PATCH /students/bulk  { student_ids[], section_id?, school_class_id?, status?, transport_route_id?, monthly_discount? }
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'student_ids' => 'required|array|min:1',
            'student_ids.*' => 'integer|exists:students,id',
            'school_class_id' => 'nullable|required_with:section_id|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'status' => 'nullable|in:active,left,graduated,suspended',
            'transport_route_id' => 'nullable|exists:transport_routes,id',
            'monthly_discount' => 'nullable|numeric|min:0',
        ]);

        $changes = collect($data)->except('student_ids')->filter(fn ($v) => $v !== null)->all();
        if (! $changes) {
            throw ValidationException::withMessages(['student_ids' => 'Nothing to update.']);
        }
        if (isset($changes['section_id']) && ! Section::where('id', $changes['section_id'])->where('school_class_id', $changes['school_class_id'])->exists()) {
            throw ValidationException::withMessages(['section_id' => 'The section does not belong to the selected class.']);
        }

        DB::transaction(function () use ($data, $changes) {
            Student::whereIn('id', $data['student_ids'])->get()->each(function (Student $s) use ($changes) {
                $s->update($changes);
                if ($s->wasChanged(['school_class_id', 'section_id'])) {
                    StudentHistory::record($s, 'transferred', 'Bulk move');
                }
                if ($s->wasChanged('status')) {
                    StudentHistory::record($s, 'status_changed', 'Status changed to '.$s->status);
                }
            });
        });

        return response()->json(['message' => count($data['student_ids']).' student(s) updated.']);
    }

    /**
     * POST /students/import (multipart, field "file" = CSV)
     * Columns (header row, any order): first_name, last_name, gender, date_of_birth, b_form, class, section,
     * roll_no, admission_no, admission_date, guardian_name, guardian_phone, guardian_cnic, guardian_relation, address
     * "class" is the class name (e.g. "Class 5"); "section" the section name (e.g. "A").
     * Send dry_run=1 to validate without saving.
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:5120', 'dry_run' => 'nullable|boolean']);

        $handle = fopen($request->file('file')->getRealPath(), 'r');
        $header = fgetcsv($handle);
        if (! $header) {
            throw ValidationException::withMessages(['file' => 'The file is empty.']);
        }
        $header = array_map(fn ($h) => strtolower(trim(str_replace(["\xEF\xBB\xBF", ' '], ['', '_'], $h))), $header);

        $classes = SchoolClass::with('sections')->get()->keyBy(fn ($c) => strtolower(trim($c->name)));
        $rows = [];
        $errors = [];
        $line = 1;
        while (($values = fgetcsv($handle)) !== false) {
            $line++;
            if (count(array_filter($values, fn ($v) => trim((string) $v) !== '')) === 0) {
                continue;
            }
            $row = array_combine($header, array_pad(array_slice($values, 0, count($header)), count($header), null));
            $row = array_map(fn ($v) => is_string($v) ? trim($v) : $v, $row);
            $row['gender'] = strtolower($row['gender'] ?? '');

            $v = Validator::make($row, [
                'first_name' => 'required|string|max:255',
                'gender' => 'required|in:male,female,other',
                'class' => 'required|string',
                'section' => 'required|string',
                'date_of_birth' => 'nullable|date',
                'admission_date' => 'nullable|date',
                'admission_no' => 'nullable|string|max:30|unique:students,admission_no',
                'guardian_phone' => 'nullable|string|max:30',
            ]);
            $class = $classes->get(strtolower($row['class'] ?? ''));
            $section = $class?->sections->first(fn ($s) => strtolower($s->name) === strtolower($row['section'] ?? ''));

            $rowErrors = $v->errors()->all();
            if (! $class) {
                $rowErrors[] = "Class '{$row['class']}' not found.";
            } elseif (! $section) {
                $rowErrors[] = "Section '{$row['section']}' not found in {$class->name}.";
            }
            if ($rowErrors) {
                $errors[] = ['line' => $line, 'errors' => $rowErrors];

                continue;
            }
            $rows[] = $row + ['_class_id' => $class->id, '_section_id' => $section->id];
        }
        fclose($handle);

        if ($errors || $request->boolean('dry_run')) {
            return response()->json([
                'message' => $errors ? 'Fix the errors below and upload again. Nothing was imported.' : 'File is valid.',
                'valid_rows' => count($rows),
                'errors' => $errors,
            ], $errors ? 422 : 200);
        }

        $sessionId = AcademicSession::current()?->id;
        DB::transaction(function () use ($rows, $sessionId) {
            foreach ($rows as $row) {
                $guardian = null;
                if (! empty($row['guardian_name']) || ! empty($row['guardian_phone'])) {
                    $guardian = ! empty($row['guardian_cnic'])
                        ? Guardian::firstOrNew(['cnic' => $row['guardian_cnic']])
                        : (! empty($row['guardian_phone']) ? Guardian::firstOrNew(['phone' => $row['guardian_phone']]) : new Guardian);
                    $guardian->fill(array_filter([
                        'name' => $row['guardian_name'] ?? null ?: ($guardian->name ?? 'Guardian'),
                        'phone' => $row['guardian_phone'] ?? null,
                        'relation' => $row['guardian_relation'] ?? null ?: 'Father',
                        'address' => $row['address'] ?? null,
                    ]))->save();
                }

                $student = Student::create([
                    'admission_no' => ($row['admission_no'] ?? null) ?: Student::nextAdmissionNo(),
                    'roll_no' => $row['roll_no'] ?? null,
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'] ?? null,
                    'gender' => $row['gender'],
                    'date_of_birth' => ($row['date_of_birth'] ?? null) ?: null,
                    'b_form' => $row['b_form'] ?? null,
                    'address' => $row['address'] ?? null,
                    'admission_date' => ($row['admission_date'] ?? null) ?: today()->toDateString(),
                    'school_class_id' => $row['_class_id'],
                    'section_id' => $row['_section_id'],
                    'academic_session_id' => $sessionId,
                    'guardian_id' => $guardian?->id,
                ]);
                StudentHistory::record($student, 'admitted', 'Imported from CSV');
            }
        });

        return response()->json(['message' => count($rows).' student(s) imported successfully.']);
    }

    /** GET /students/import-template : sample CSV for bulk import. */
    public function importTemplate()
    {
        $columns = ['first_name', 'last_name', 'gender', 'date_of_birth', 'b_form', 'class', 'section', 'roll_no',
            'admission_no', 'admission_date', 'guardian_name', 'guardian_phone', 'guardian_cnic', 'guardian_relation', 'address'];
        $sample = ['Ali', 'Khan', 'male', '2016-05-14', '35202-1234567-1', 'Class 3', 'A', '1', '', '', 'Imran Khan', '03001234567', '35202-7654321-1', 'Father', 'Lahore'];

        return response()->streamDownload(function () use ($columns, $sample) {
            $out = fopen('php://output', 'w');
            fputcsv($out, $columns);
            fputcsv($out, $sample);
            fclose($out);
        }, 'student-import-template.csv', ['Content-Type' => 'text/csv']);
    }
}
