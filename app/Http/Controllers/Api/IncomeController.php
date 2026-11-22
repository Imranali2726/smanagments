<?php

namespace App\Http\Controllers\Api;

use App\Models\Income;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class IncomeController extends CrudController
{
    protected string $model = Income::class;

    protected array $with = ['creator:id,name'];

    protected array $searchable = ['title', 'received_from', 'reference'];

    protected array $filterable = ['category', 'payment_method'];

    protected ?string $dateColumn = 'income_date';

    protected string $orderBy = 'income_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0.01',
            'income_date' => 'required|date',
            'received_from' => 'nullable|string|max:255',
            'payment_method' => 'nullable|string|max:30',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ];
    }

    protected function beforeSave(array $data, Request $request, ?Model $item): array
    {
        if (! $item) {
            $data['created_by'] = $request->user()->id;
        }

        return $data;
    }
}
