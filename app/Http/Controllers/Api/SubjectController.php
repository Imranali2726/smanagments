<?php

namespace App\Http\Controllers\Api;

use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SubjectController extends CrudController
{
    protected string $model = Subject::class;

    protected array $searchable = ['name', 'code'];

    protected array $filterable = ['type'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:100',
            'code' => ['required', 'string', 'max:30', Rule::unique('subjects')->ignore($id)],
            'type' => 'nullable|in:theory,practical,both',
        ];
    }
}
