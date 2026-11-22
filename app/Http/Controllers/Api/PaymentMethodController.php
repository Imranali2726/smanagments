<?php

namespace App\Http\Controllers\Api;

use App\Models\PaymentMethod;
use Illuminate\Http\Request;

class PaymentMethodController extends CrudController
{
    protected string $model = PaymentMethod::class;

    protected array $searchable = ['name'];

    protected array $filterable = ['is_active'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'account_title' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'instructions' => 'nullable|string|max:2000',
            'is_active' => 'nullable|boolean',
        ];
    }
}
