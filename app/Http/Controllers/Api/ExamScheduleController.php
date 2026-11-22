<?php

namespace App\Http\Controllers\Api;

use App\Models\ExamSchedule;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ExamScheduleController extends CrudController
{
    protected string $model = ExamSchedule::class;

    protected array $with = ['exam:id,name', 'schoolClass:id,name', 'subject:id,name,code'];

    protected array $filterable = ['exam_id', 'school_class_id', 'subject_id'];

    protected ?string $dateColumn = 'exam_date';

    protected string $orderBy = 'exam_date';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'exam_id' => 'required|exists:exams,id',
            'school_class_id' => 'required|exists:school_classes,id',
            'subject_id' => ['required', 'exists:subjects,id', Rule::unique('exam_schedules')
                ->where('exam_id', $request->input('exam_id', $id ? ExamSchedule::find($id)?->exam_id : null))
                ->where('school_class_id', $request->input('school_class_id', $id ? ExamSchedule::find($id)?->school_class_id : null))
                ->ignore($id)],
            'exam_date' => 'required|date',
            'start_time' => 'nullable|date_format:H:i',
            'end_time' => 'nullable|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:30',
            'total_marks' => 'nullable|numeric|min:1|max:1000',
            'pass_marks' => 'nullable|numeric|min:0|lte:total_marks',
        ];
    }
}
