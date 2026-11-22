<?php

namespace App\Http\Controllers\Api;

use App\Models\ClassSubject;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** Assigns subjects (and their teacher) to a class. */
class ClassSubjectController extends CrudController
{
    protected string $model = ClassSubject::class;

    protected array $with = ['schoolClass:id,name', 'subject:id,name,code', 'teacher:id,name'];

    protected array $filterable = ['school_class_id', 'subject_id', 'teacher_id'];

    protected string $orderBy = 'school_class_id';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        $classId = $request->input('school_class_id', $id ? ClassSubject::find($id)?->school_class_id : null);

        return [
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => ['required', 'exists:subjects,id', Rule::unique('class_subjects')->where('school_class_id', $classId)->ignore($id)],
            'teacher_id' => 'nullable|exists:teachers,id',
        ];
    }
}
