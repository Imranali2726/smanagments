<?php

namespace App\Http\Controllers\Api;

use App\Models\Visitor;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class VisitorController extends CrudController
{
    protected string $model = Visitor::class;

    protected array $searchable = ['name', 'phone', 'cnic', 'purpose', 'person_to_meet'];

    protected ?string $dateColumn = 'visit_date';

    protected string $orderBy = 'visit_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'cnic' => 'nullable|string|max:20',
            'purpose' => 'required|string|max:255',
            'person_to_meet' => 'nullable|string|max:255',
            'number_of_persons' => 'nullable|integer|min:1|max:100',
            'visit_date' => 'nullable|date',
            'in_time' => 'nullable|date_format:H:i',
            'out_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string|max:2000',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item && empty($data['visit_date'])) {
            $data['visit_date'] = today()->toDateString();
        }

        return $data;
    }
}
