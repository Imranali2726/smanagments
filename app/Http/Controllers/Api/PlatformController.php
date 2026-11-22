<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Support\SchoolSetup;
use App\Support\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Super admin (platform owner): schools, plans, modules. Main domain only. */
class PlatformController extends Controller
{
    private const RESERVED = ['www', 'app', 'admin', 'api', 'mail', 'super', 'portal', 'aas'];

    public function overview(): JsonResponse
    {
        $schools = School::all();
        $soon = $schools->filter(fn ($s) => $s->expires_at && ! $s->isExpired() && $s->expires_at->lte(now()->addDays(30)));

        return response()->json([
            'schools' => $schools->count(),
            'active' => $schools->where('status', 'active')->reject(fn ($s) => $s->isExpired())->count(),
            'suspended' => $schools->where('status', 'suspended')->count(),
            'expired' => $schools->filter(fn ($s) => $s->isExpired())->count(),
            'expiring_soon' => $soon->values()->map->only('id', 'name', 'subdomain', 'expires_at'),
            'students' => Student::where('status', 'active')->count(),
            'teachers' => Teacher::where('status', 'active')->count(),
            'users' => User::where('role', '!=', User::SUPER_ADMIN)->count(),
            'by_plan' => $schools->groupBy('plan')->map->count(),
            'recent' => School::latest()->limit(5)->get(['id', 'name', 'subdomain', 'created_at', 'plan']),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $q = School::query()
            ->withCount(['students' => fn ($s) => $s->where('status', 'active'), 'teachers' => fn ($t) => $t->where('status', 'active')])
            ->when($request->query('search'), fn ($w, $v) => $w->where(fn ($x) => $x->where('name', 'like', "%$v%")->orWhere('subdomain', 'like', "%$v%")->orWhere('city', 'like', "%$v%")))
            ->when($request->query('status'), function ($w, $v) {
                return match ($v) {
                    'expired' => $w->whereDate('expires_at', '<', today()),
                    default => $w->where('status', $v),
                };
            })
            ->orderBy('name');

        $schools = $q->get();
        $admins = User::whereIn('school_id', $schools->pluck('id'))->where('role', 'admin')->orderBy('id')->get(['id', 'school_id', 'name', 'email'])->groupBy('school_id');

        return response()->json(['data' => $schools->map(fn ($s) => $s->toArray() + [
            'is_expired' => $s->isExpired(),
            'admin' => optional($admins->get($s->id))->first(),
        ])]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate($this->rules() + [
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255|unique:users,email',
            'admin_password' => 'required|string|min:6',
        ]);

        $school = DB::transaction(function () use ($data) {
            $school = School::create($this->schoolFields($data));
            Tenant::set($school);
            User::create(['name' => $data['admin_name'], 'email' => $data['admin_email'], 'password' => $data['admin_password'], 'role' => 'admin', 'is_active' => true]);
            SchoolSetup::defaults($school->name, ['school_phone' => $school->phone, 'school_email' => $school->email, 'school_address' => $school->address]);
            Tenant::set(null);

            return $school;
        });

        return response()->json(['message' => "School \"{$school->name}\" created.", 'data' => $school], 201);
    }

    public function show(School $school): JsonResponse
    {
        return response()->json(['data' => $school->loadCount(['students', 'teachers', 'users']) ]);
    }

    public function update(Request $request, School $school): JsonResponse
    {
        $data = $request->validate($this->rules($school->id));
        $school->update($this->schoolFields($data));

        return response()->json(['message' => 'School updated.', 'data' => $school->fresh()]);
    }

    /** POST /platform/schools/{school}/admin-password  { email?, password } */
    public function resetAdmin(Request $request, School $school): JsonResponse
    {
        $data = $request->validate(['password' => 'required|string|min:6']);
        $admin = User::where('school_id', $school->id)->where('role', 'admin')->orderBy('id')->first();
        abort_unless($admin, 404, 'This school has no admin account.');
        $admin->update(['password' => $data['password'], 'is_active' => true]);
        $admin->tokens()->delete();

        return response()->json(['message' => "Password reset for {$admin->email}."]);
    }

    public function modules(): JsonResponse
    {
        return response()->json(['data' => array_keys(Tenant::MODULES)]);
    }

    private function rules(?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'subdomain' => ['required', 'string', 'min:2', 'max:40', 'regex:/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/', Rule::notIn(self::RESERVED), Rule::unique('schools', 'subdomain')->ignore($id)],
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:30',
            'city' => 'nullable|string|max:80',
            'address' => 'nullable|string|max:1000',
            'contact_person' => 'nullable|string|max:255',
            'plan' => 'nullable|string|max:40',
            'student_limit' => 'nullable|integer|min:1',
            'expires_at' => 'nullable|date',
            'status' => 'nullable|in:active,suspended',
            'disabled_modules' => 'nullable|array',
            'disabled_modules.*' => Rule::in(array_keys(Tenant::MODULES)),
            'notes' => 'nullable|string|max:2000',
        ];
    }

    private function schoolFields(array $data): array
    {
        $fields = collect($data)->only(['name', 'subdomain', 'email', 'phone', 'city', 'address', 'contact_person', 'plan', 'student_limit', 'expires_at', 'status', 'disabled_modules', 'notes'])->all();
        $fields['subdomain'] = strtolower($fields['subdomain']);
        $fields['plan'] = $fields['plan'] ?? 'standard';
        $fields['status'] = $fields['status'] ?? 'active';
        $fields['disabled_modules'] = array_values($fields['disabled_modules'] ?? []);

        return $fields;
    }
}
