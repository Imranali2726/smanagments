<?php

namespace App\Http\Controllers\Api;

use App\Models\FeeType;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class FeeTypeController extends CrudController
{
    protected string $model = FeeType::class;

    protected array $searchable = ['name'];

    protected array $filterable = ['frequency'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('fee_types')->ignore($id)],
            'frequency' => 'required|in:monthly,yearly,one_time',
            'description' => 'nullable|string|max:255',
        ];
    }
}
