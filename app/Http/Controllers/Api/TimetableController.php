<?php

namespace App\Http\Controllers\Api;

use App\Models\Timetable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class TimetableController extends CrudController
{
    protected string $model = Timetable::class;

    protected array $with = ['section.schoolClass:id,name', 'subject:id,name,code', 'teacher:id,name'];

    protected array $filterable = ['section_id', 'teacher_id', 'subject_id', 'day'];

    protected string $orderBy = 'start_time';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'section_id' => 'required|exists:sections,id',
            'subject_id' => 'required|exists:subjects,id',
            'teacher_id' => 'nullable|exists:teachers,id',
            'day' => 'required|in:'.implode(',', Timetable::DAYS),
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'room' => 'nullable|string|max:30',
        ];
    }

    /** Prevents double-booking a section or a teacher in the same time slot. */
    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        $slot = array_merge($item?->only('section_id', 'teacher_id', 'day', 'start_time', 'end_time') ?? [], $data);
        foreach (['start_time', 'end_time'] as $t) {
            $slot[$t] = substr($slot[$t], 0, 5).':00';   // normalise to HH:MM:SS
        }

        $overlap = fn ($q) => $q->where('day', $slot['day'])
            ->where('start_time', '<', $slot['end_time'])
            ->where('end_time', '>', $slot['start_time'])
            ->when($item, fn ($q) => $q->where('id', '!=', $item->id));

        if (Timetable::where('section_id', $slot['section_id'])->where($overlap)->exists()) {
            throw ValidationException::withMessages(['start_time' => 'This section already has a period in this time slot.']);
        }

        if (! empty($slot['teacher_id']) && Timetable::where('teacher_id', $slot['teacher_id'])->where($overlap)->exists()) {
            throw ValidationException::withMessages(['teacher_id' => 'This teacher is already busy in this time slot.']);
        }

        return $data;
    }
}
