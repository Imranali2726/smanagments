<?php

namespace App\Http\Controllers\Api;

use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SchoolClassController extends CrudController
{
    protected string $model = SchoolClass::class;

    protected array $with = ['sections.classTeacher:id,name'];

    protected array $withCount = ['students'];

    protected array $searchable = ['name'];

    protected string $orderBy = 'numeric_level';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => ['required', 'string', 'max:50', Rule::unique('school_classes')->ignore($id)],
            'numeric_level' => 'nullable|integer|min:0|max:100',
            'description' => 'nullable|string|max:255',
        ];
    }
}
