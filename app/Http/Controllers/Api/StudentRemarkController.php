<?php

namespace App\Http\Controllers\Api;

use App\Models\StudentRemark;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class StudentRemarkController extends CrudController
{
    protected string $model = StudentRemark::class;

    protected array $with = [
        'student:id,first_name,last_name,admission_no,school_class_id,section_id',
        'student.schoolClass:id,name', 'student.section:id,name', 'creator:id,name',
    ];

    protected array $searchable = ['title', 'category', 'description'];

    protected array $filterable = ['student_id', 'type', 'category'];

    protected ?string $dateColumn = 'remark_date';

    protected string $orderBy = 'remark_date';

    /** Teachers see the remarks they wrote; admins see everything. */
    protected function baseQuery(Request $request): Builder
    {
        $query = StudentRemark::query();
        if ($request->user()->role !== 'admin') {
            $query->where('created_by', $request->user()->id);
        }
        if ($request->filled('section_id')) {
            $query->whereHas('student', fn ($q) => $q->where('section_id', $request->query('section_id')));
        }

        return $query;
    }

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'student_id' => 'required|exists:students,id',
            'type' => 'required|in:positive,negative,note',
            'category' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'remark_date' => 'nullable|date|before_or_equal:today',
            'action_taken' => 'nullable|string|max:255',
            'visible_to_parent' => 'nullable|boolean',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item) {
            $data['created_by'] = $request->user()->id;
            $data['remark_date'] = $data['remark_date'] ?? today()->toDateString();
            $data['visible_to_parent'] = $data['visible_to_parent'] ?? true;
        }

        return $data;
    }
}
