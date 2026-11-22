<?php

namespace App\Http\Controllers\Api;

use App\Models\AcademicSession;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AcademicSessionController extends CrudController
{
    protected string $model = AcademicSession::class;

    protected array $searchable = ['name'];

    protected string $orderBy = 'start_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => ['required', 'string', 'max:50', Rule::unique('academic_sessions')->ignore($id)],
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'is_current' => 'nullable|boolean',
        ];
    }

    protected function afterSave(Model $item, Request $request, bool $created): void
    {
        // Only one session can be current.
        if ($item->is_current) {
            AcademicSession::where('id', '!=', $item->id)->update(['is_current' => false]);
        }
    }
}
