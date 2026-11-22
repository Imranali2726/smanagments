<?php

namespace App\Http\Controllers\Api;

use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SectionController extends CrudController
{
    protected string $model = Section::class;

    protected array $with = ['schoolClass:id,name', 'classTeacher:id,name'];

    protected array $withCount = ['students'];

    protected array $searchable = ['name'];

    protected array $filterable = ['school_class_id', 'class_teacher_id'];

    protected string $orderBy = 'school_class_id';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        $classId = $request->input('school_class_id', $id ? Section::find($id)?->school_class_id : null);

        return [
            'school_class_id' => 'required|exists:school_classes,id',
            'name' => ['required', 'string', 'max:20', Rule::unique('sections')->where('school_class_id', $classId)->ignore($id)],
            'capacity' => 'nullable|integer|min:1|max:500',
            'class_teacher_id' => 'nullable|exists:teachers,id',
        ];
    }
}
