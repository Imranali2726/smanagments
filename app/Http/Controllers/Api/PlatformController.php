<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\School;
use App\Models\SchoolGroup;
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
        $q = School::query()->with('group:id,name')
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
            'group_id' => 'nullable|exists:school_groups,id',
            'campus_name' => 'nullable|string|max:120',
        ];
    }

    private function schoolFields(array $data): array
    {
        $fields = collect($data)->only(['name', 'subdomain', 'email', 'phone', 'city', 'address', 'contact_person', 'plan', 'student_limit', 'expires_at', 'status', 'disabled_modules', 'notes', 'group_id', 'campus_name'])->all();
        $fields['subdomain'] = strtolower($fields['subdomain']);
        $fields['plan'] = $fields['plan'] ?? 'standard';
        $fields['status'] = $fields['status'] ?? 'active';
        $fields['disabled_modules'] = array_values($fields['disabled_modules'] ?? []);

        return $fields;
    }

    /* ---------------- multi-campus school groups ---------------- */

    /** GET /platform/groups */
    public function groups(): JsonResponse
    {
        $groups = SchoolGroup::with(['schools' => fn ($q) => $q->orderBy('name')->select('id', 'group_id', 'name', 'campus_name', 'subdomain', 'status', 'expires_at')])
            ->orderBy('name')->get();
        $owners = User::withoutGlobalScope('school')->where('role', User::OWNER)->whereIn('group_id', $groups->pluck('id'))
            ->get(['id', 'group_id', 'name', 'email', 'is_active', 'last_login_at'])->groupBy('group_id');

        return response()->json(['data' => $groups->map(fn ($g) => $g->toArray() + ['owners' => $owners->get($g->id, collect())->values()])]);
    }

    /** POST /platform/groups  {name, contact_person?, phone?, email?, notes?, school_ids[], owner_name?, owner_email?, owner_password?} */
    public function storeGroup(Request $request): JsonResponse
    {
        $data = $request->validate($this->groupRules() + [
            'owner_name' => 'nullable|required_with:owner_email|string|max:255',
            'owner_email' => 'nullable|email|max:255|unique:users,email',
            'owner_password' => 'nullable|required_with:owner_email|string|min:6',
        ]);

        $group = DB::transaction(function () use ($data) {
            $group = SchoolGroup::create(collect($data)->only('name', 'contact_person', 'phone', 'email', 'notes')->all());
            $this->syncCampuses($group, $data['school_ids'] ?? []);
            if (! empty($data['owner_email'])) {
                $this->createOwner($group, $data['owner_name'], $data['owner_email'], $data['owner_password']);
            }

            return $group;
        });

        return response()->json(['message' => "Group \"{$group->name}\" created.", 'data' => $group], 201);
    }

    /** PUT /platform/groups/{group} */
    public function updateGroup(Request $request, SchoolGroup $group): JsonResponse
    {
        $data = $request->validate($this->groupRules());
        DB::transaction(function () use ($group, $data) {
            $group->update(collect($data)->only('name', 'contact_person', 'phone', 'email', 'notes')->all());
            $this->syncCampuses($group, $data['school_ids'] ?? []);
        });

        return response()->json(['message' => 'Group updated.', 'data' => $group->fresh('schools')]);
    }

    /** POST /platform/groups/{group}/owners  {name, email, password} */
    public function addOwner(Request $request, SchoolGroup $group): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
        ]);
        $owner = $this->createOwner($group, $data['name'], $data['email'], $data['password']);

        return response()->json(['message' => "Owner login created for {$owner->email}.", 'data' => $owner->only('id', 'name', 'email')], 201);
    }

    /** DELETE /platform/groups/{group}/owners/{owner} */
    public function removeOwner(SchoolGroup $group, int $owner): JsonResponse
    {
        $user = User::withoutGlobalScope('school')->where('id', $owner)->where('group_id', $group->id)->where('role', User::OWNER)->firstOrFail();
        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Owner login removed.']);
    }

    private function groupRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:255',
            'notes' => 'nullable|string|max:2000',
            'school_ids' => 'nullable|array',
            'school_ids.*' => 'integer|exists:schools,id',
        ];
    }

    private function syncCampuses(SchoolGroup $group, array $schoolIds): void
    {
        School::where('group_id', $group->id)->whereNotIn('id', $schoolIds ?: [0])->update(['group_id' => null]);
        if ($schoolIds) {
            School::whereIn('id', $schoolIds)->update(['group_id' => $group->id]);
        }
    }

    private function createOwner(SchoolGroup $group, string $name, string $email, string $password): User
    {
        $user = new User(['name' => $name, 'email' => $email, 'password' => $password, 'role' => User::OWNER, 'is_active' => true]);
        $user->school_id = null;
        $user->group_id = $group->id;
        $user->save();

        return $user;
    }
}
