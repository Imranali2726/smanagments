<?php

namespace App\Http\Controllers\Api;

use App\Models\AcademicSession;
use App\Models\Exam;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ExamController extends CrudController
{
    protected string $model = Exam::class;

    protected array $with = ['academicSession:id,name'];

    protected array $searchable = ['name'];

    protected array $filterable = ['academic_session_id', 'is_published'];

    protected string $orderBy = 'start_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'name' => 'required|string|max:255',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_published' => 'nullable|boolean',
            'description' => 'nullable|string|max:2000',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && empty($data['academic_session_id'])) {
            $data['academic_session_id'] = AcademicSession::current()?->id;
        }

        return $data;
    }
}
