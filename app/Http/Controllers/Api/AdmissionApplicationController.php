<?php

namespace App\Http\Controllers\Api;

use App\Models\AcademicSession;
use App\Models\AdmissionApplication;
use App\Models\FeeType;
use App\Models\FeeStructure;
use App\Models\Guardian;
use App\Models\Section;
use App\Models\Setting;
use App\Models\Student;
use App\Models\StudentHistory;
use App\Models\User;
use App\Services\FeeService;
use App\Services\SmsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

/**
 * Online admission: parents apply from the public website (no login);
 * admin reviews and approves → student + guardian records are created automatically.
 */
class AdmissionApplicationController extends CrudController
{
    protected string $model = AdmissionApplication::class;

    protected array $with = ['schoolClass:id,name', 'reviewer:id,name'];

    protected array $searchable = ['application_no', 'first_name', 'last_name', 'guardian_name', 'guardian_phone', 'guardian_cnic'];

    protected array $filterable = ['status', 'school_class_id'];

    protected array $fileFields = ['photo' => 'admissions'];

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'gender' => 'required|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'b_form' => 'nullable|string|max:20',
            'previous_school' => 'nullable|string|max:255',
            'school_class_id' => 'required|exists:school_classes,id',
            'guardian_name' => 'required|string|max:255',
            'guardian_relation' => 'nullable|string|max:30',
            'guardian_phone' => 'required|string|max:30',
            'guardian_email' => 'nullable|email|max:255',
            'guardian_cnic' => 'nullable|string|max:20',
            'guardian_occupation' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string|max:2000',
        ];
    }

    /** GET /public/admission-form : data the public form needs (no login). */
    public function formOptions(): JsonResponse
    {
        if (! \App\Support\Tenant::id()) {
            // Main domain: no school selected yet.
            return response()->json(['open' => false, 'platform' => true, 'school' => ['name' => 'AAS School Manager', 'phone' => null, 'address' => null, 'logo_url' => null], 'currency' => 'PKR', 'classes' => []]);
        }

        return response()->json([
            'open' => (bool) Setting::get('online_admission_open', 1),
            'school' => [
                'name' => Setting::get('school_name'),
                'phone' => Setting::get('school_phone'),
                'address' => Setting::get('school_address'),
                'logo_url' => Setting::get('school_logo') ? \Illuminate\Support\Facades\Storage::disk('public')->url(Setting::get('school_logo')) : null,
            ],
            'currency' => Setting::get('currency', 'PKR'),
            'classes' => \App\Models\SchoolClass::orderBy('numeric_level')->get(['id', 'name']),
        ]);
    }

    /** POST /public/admission-applications  (no login, rate limited) */
    public function apply(Request $request): JsonResponse
    {
        abort_unless(\App\Support\Tenant::id(), 404, 'Open your school\'s own address to apply for admission.');
        abort_unless(\App\Support\Tenant::school()->moduleEnabled('online_admission'), 403, 'Online admissions are not available for this school.');
        abort_unless((bool) Setting::get('online_admission_open', 1), 403, 'Online admissions are currently closed.');

        $data = $request->validate($this->rules($request));
        $data = $this->prepare($data, $request, null);
        $application = AdmissionApplication::create($data);

        return response()->json([
            'message' => 'Application submitted successfully. The school will contact you soon.',
            'application_no' => $application->fresh()->application_no,
        ], 201);
    }

    /** GET /public/admission-applications/status?application_no=&guardian_phone= */
    public function status(Request $request): JsonResponse
    {
        abort_unless(\App\Support\Tenant::id(), 404, 'Open your school\'s own address to check the status.');
        $data = $request->validate(['application_no' => 'required|string', 'guardian_phone' => 'required|string']);
        $app = AdmissionApplication::with('schoolClass:id,name')->where('application_no', $data['application_no'])
            ->where('guardian_phone', $data['guardian_phone'])->firstOrFail();

        return response()->json(['data' => $app->only('application_no', 'first_name', 'last_name', 'status', 'remarks', 'created_at') + ['class' => $app->schoolClass?->name]]);
    }

    /**
     * POST /admission-applications/{id}/approve
     * { section_id, school_class_id?, roll_no?, admission_no?, charge_admission_fee?, create_parent_login?, parent_password? }
     */
    public function approve(Request $request, int $id, FeeService $fees, SmsService $sms): JsonResponse
    {
        $app = AdmissionApplication::findOrFail($id);
        if ($app->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'This application has already been '.$app->status.'.']);
        }

        $data = $request->validate([
            'school_class_id' => 'nullable|exists:school_classes,id',
            'section_id' => 'required|exists:sections,id',
            'roll_no' => 'nullable|string|max:20',
            'admission_no' => 'nullable|string|max:30|unique:students,admission_no',
            'charge_admission_fee' => 'nullable|boolean',
            'create_parent_login' => 'nullable|boolean',
            'parent_email' => ['nullable', 'required_if:create_parent_login,1,true', 'email', Rule::unique('users', 'email')],
            'parent_password' => 'nullable|required_if:create_parent_login,1,true|string|min:6',
            'remarks' => 'nullable|string|max:255',
        ]);
        $classId = $data['school_class_id'] ?? $app->school_class_id;
        if (! Section::where('id', $data['section_id'])->where('school_class_id', $classId)->exists()) {
            throw ValidationException::withMessages(['section_id' => 'The section does not belong to the class.']);
        }

        $student = DB::transaction(function () use ($app, $data, $classId, $request, $fees) {
            $guardian = $app->guardian_cnic ? Guardian::firstOrNew(['cnic' => $app->guardian_cnic]) : Guardian::firstOrNew(['phone' => $app->guardian_phone]);
            $guardian->fill([
                'name' => $app->guardian_name,
                'relation' => $app->guardian_relation ?: 'Father',
                'phone' => $app->guardian_phone,
                'email' => $app->guardian_email,
                'cnic' => $app->guardian_cnic,
                'occupation' => $app->guardian_occupation,
                'address' => $app->address,
            ])->save();

            if ($request->boolean('create_parent_login') && ! $guardian->user_id) {
                $user = User::create([
                    'name' => $guardian->name, 'email' => $data['parent_email'], 'password' => $data['parent_password'],
                    'phone' => $guardian->phone, 'role' => 'parent', 'is_active' => true,
                ]);
                $guardian->update(['user_id' => $user->id]);
            }

            $student = Student::create([
                'admission_no' => $data['admission_no'] ?? Student::nextAdmissionNo(),
                'roll_no' => $data['roll_no'] ?? null,
                'first_name' => $app->first_name,
                'last_name' => $app->last_name,
                'gender' => $app->gender,
                'date_of_birth' => $app->date_of_birth,
                'b_form' => $app->b_form,
                'address' => $app->address,
                'photo' => $app->photo,
                'previous_school' => $app->previous_school,
                'admission_date' => today()->toDateString(),
                'school_class_id' => $classId,
                'section_id' => $data['section_id'],
                'academic_session_id' => AcademicSession::current()?->id,
                'guardian_id' => $guardian->id,
            ]);
            StudentHistory::record($student, 'admitted', 'Admitted via online application '.$app->application_no);

            $app->update([
                'status' => 'approved', 'student_id' => $student->id, 'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(), 'remarks' => $data['remarks'] ?? null,
            ]);

            // Optional admission fee invoice from the class fee structure.
            if ($request->boolean('charge_admission_fee')) {
                $type = FeeType::where('name', Setting::get('admission_fee_type', 'Admission Fee'))->first();
                $amount = $type ? FeeStructure::where('school_class_id', $classId)->where('fee_type_id', $type->id)->value('amount') : null;
                if ($amount > 0) {
                    $fees->createInvoice($student, now()->format('Y-m'), today()->addDays(7)->toDateString(),
                        [['fee_type_id' => $type->id, 'description' => $type->name, 'amount' => $amount]], 0, null, $request->user()->id);
                }
            }

            return $student;
        });

        $sms->send($app->guardian_phone, "Congratulations! Admission of {$student->full_name} is approved. Admission No: {$student->admission_no}. - ".Setting::get('school_name'), $request->user()->id);

        return response()->json(['message' => 'Application approved and student admitted.', 'student' => $student->load('schoolClass:id,name', 'section:id,name', 'guardian')]);
    }

    /** POST /admission-applications/{id}/reject { remarks } */
    public function reject(Request $request, int $id): JsonResponse
    {
        $app = AdmissionApplication::findOrFail($id);
        if ($app->status !== 'pending') {
            throw ValidationException::withMessages(['status' => 'This application has already been '.$app->status.'.']);
        }
        $data = $request->validate(['remarks' => 'nullable|string|max:255']);
        $app->update(['status' => 'rejected', 'reviewed_by' => $request->user()->id, 'reviewed_at' => now(), 'remarks' => $data['remarks'] ?? null]);

        return response()->json(['message' => 'Application rejected.']);
    }
}
