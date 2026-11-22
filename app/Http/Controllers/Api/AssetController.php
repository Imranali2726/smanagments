<?php

namespace App\Http\Controllers\Api;

use App\Models\Asset;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AssetController extends CrudController
{
    protected string $model = Asset::class;

    protected array $with = ['supplier:id,name'];

    protected array $searchable = ['name', 'asset_code', 'location', 'assigned_to'];

    protected array $filterable = ['category', 'condition', 'supplier_id'];

    protected ?string $dateColumn = 'purchase_date';

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'asset_code' => ['nullable', 'string', 'max:50', Rule::unique('assets')->ignore($id)],
            'category' => 'nullable|string|max:50',
            'purchase_date' => 'nullable|date',
            'purchase_cost' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'location' => 'nullable|string|max:255',
            'condition' => 'nullable|in:new,good,fair,poor,damaged,disposed',
            'assigned_to' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:2000',
        ];
    }
}
