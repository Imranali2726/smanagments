<?php

namespace App\Http\Controllers\Api;

use App\Models\AcademicSession;
use App\Models\FeeStructure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

/** Fee amount per class per fee type (per academic session). */
class FeeStructureController extends CrudController
{
    protected string $model = FeeStructure::class;

    protected array $with = ['schoolClass:id,name', 'feeType:id,name,frequency', 'academicSession:id,name'];

    protected array $filterable = ['school_class_id', 'fee_type_id', 'academic_session_id'];

    protected string $orderBy = 'school_class_id';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'school_class_id' => 'required|exists:school_classes,id',
            'fee_type_id' => 'required|exists:fee_types,id',
            'academic_session_id' => 'nullable|exists:academic_sessions,id',
            'amount' => 'required|numeric|min:0',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && ! array_key_exists('academic_session_id', $data)) {
            $data['academic_session_id'] = AcademicSession::current()?->id;
        }

        $merged = array_merge($item?->only('school_class_id', 'fee_type_id', 'academic_session_id') ?? [], $data);
        $exists = FeeStructure::where('school_class_id', $merged['school_class_id'])
            ->where('fee_type_id', $merged['fee_type_id'])
            ->where('academic_session_id', $merged['academic_session_id'] ?? null)
            ->when($item, fn ($q) => $q->where('id', '!=', $item->id))
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages(['fee_type_id' => 'This fee is already defined for this class and session.']);
        }

        return $data;
    }
}
