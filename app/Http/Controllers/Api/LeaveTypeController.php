<?php

namespace App\Http\Controllers\Api;

use App\Models\LeaveType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LeaveTypeController extends CrudController
{
    protected string $model = LeaveType::class;

    protected array $searchable = ['name'];

    protected array $filterable = ['applies_to'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('leave_types')->ignore($id)],
            'days_allowed' => 'nullable|integer|min:0|max:365',
            'applies_to' => 'nullable|in:staff,student,both',
        ];
    }
}
