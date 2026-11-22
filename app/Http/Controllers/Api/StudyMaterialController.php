<?php

namespace App\Http\Controllers\Api;

use App\Models\StudyMaterial;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class StudyMaterialController extends CrudController
{
    protected string $model = StudyMaterial::class;

    protected array $with = ['schoolClass:id,name', 'section:id,name', 'subject:id,name', 'uploader:id,name'];

    protected array $searchable = ['title', 'description'];

    protected array $filterable = ['type', 'school_class_id', 'section_id', 'subject_id', 'is_public', 'uploaded_by'];

    protected array $fileFields = ['file' => 'downloads'];

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'title' => 'required|string|max:255',
            'type' => 'required|in:assignment,syllabus,study_material,circular,other',
            'school_class_id' => 'nullable|exists:school_classes,id',
            'section_id' => 'nullable|exists:sections,id',
            'subject_id' => 'nullable|exists:subjects,id',
            'description' => 'nullable|string|max:5000',
            'file' => 'nullable|file|max:20480',
            'link' => 'nullable|url|max:500',
            'is_public' => 'nullable|boolean',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item) {
            $data['uploaded_by'] = $request->user()->id;
        }

        return $data;
    }
}
