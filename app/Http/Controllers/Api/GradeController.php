<?php

namespace App\Http\Controllers\Api;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends CrudController
{
    protected string $model = Grade::class;

    protected string $orderBy = 'min_percentage';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:10',
            'min_percentage' => 'required|numeric|min:0|max:100',
            'max_percentage' => 'required|numeric|min:0|max:100|gte:min_percentage',
            'grade_point' => 'nullable|numeric|min:0|max:5',
            'remarks' => 'nullable|string|max:255',
        ];
    }
}
