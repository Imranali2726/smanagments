<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\CreatesLoginAccount;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TeacherController extends CrudController
{
    use CreatesLoginAccount;

    protected string $model = Teacher::class;

    protected array $with = ['user:id,email,is_active'];

    protected array $searchable = ['name', 'employee_no', 'phone', 'cnic', 'email'];

    protected array $filterable = ['status', 'gender', 'designation', 'staff_type', 'department'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected array $nonColumns = ['create_login', 'login_email', 'password', 'login_role'];

    protected array $fileFields = ['photo' => 'teachers'];

    protected function rules(Request $request, ?int $id = null): array
    {
        $userId = $id ? Teacher::find($id)?->user_id : null;

        return array_merge([
            'employee_no' => ['nullable', 'string', 'max:30', Rule::unique('teachers')->ignore($id)],
            'staff_type' => 'nullable|in:teaching,non_teaching',
            'department' => 'nullable|string|max:100',
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:30',
            'gender' => 'nullable|in:male,female,other',
            'date_of_birth' => 'nullable|date|before:today',
            'cnic' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:1000',
            'qualification' => 'nullable|string|max:255',
            'designation' => 'nullable|string|max:255',
            'joining_date' => 'nullable|date',
            'basic_salary' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive',
            'photo' => 'nullable|image|max:2048',
            // Non-teaching staff can log in as accountant, librarian or receptionist.
            'login_role' => 'nullable|in:teacher,accountant,librarian,receptionist',
        ], $this->loginRules($userId));
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && empty($data['employee_no'])) {
            $next = (int) Teacher::max('id') + 1;
            $data['employee_no'] = 'EMP-'.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
        }

        return $data;
    }

    protected function afterSave(Model $item, Request $request, bool $created): void
    {
        $this->syncLoginAccount($item, $request, $request->input('login_role', 'teacher'), $item->name);

        if ($item->user_id && $request->has('status')) {
            $item->user()->update(['is_active' => $item->status === 'active']);
        }
    }
}
