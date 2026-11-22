<?php

namespace App\Http\Controllers\Api;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class ExpenseController extends CrudController
{
    protected string $model = Expense::class;

    protected array $with = ['creator:id,name'];

    protected array $searchable = ['title', 'reference'];

    protected array $filterable = ['category', 'payment_method'];

    protected ?string $dateColumn = 'expense_date';

    protected string $orderBy = 'expense_date';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0.01',
            'expense_date' => 'required|date',
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
