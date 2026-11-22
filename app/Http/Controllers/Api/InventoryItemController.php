<?php

namespace App\Http\Controllers\Api;

use App\Models\InventoryItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;

class InventoryItemController extends CrudController
{
    protected string $model = InventoryItem::class;

    protected array $searchable = ['name', 'location'];

    protected array $filterable = ['category'];

    protected array $nonColumns = ['opening_stock'];

    protected string $orderBy = 'name';

    protected string $orderDirection = 'asc';

    protected function rules(Request $request, ?int $id = null): array
    {
        return [
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:50',
            'unit' => 'nullable|string|max:20',
            'reorder_level' => 'nullable|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:2000',
            'opening_stock' => 'nullable|numeric|min:0',
        ];
    }

    protected function afterSave(Model $item, Request $request, bool $created): void
    {
        if ($created && $request->filled('opening_stock') && $request->input('opening_stock') > 0) {
            $item->update(['quantity' => $request->input('opening_stock')]);
            $item->movements()->create([
                'type' => 'in',
                'quantity' => $request->input('opening_stock'),
                'unit_price' => $item->unit_price,
                'movement_date' => today()->toDateString(),
                'notes' => 'Opening stock',
                'created_by' => $request->user()->id,
            ]);
        }
    }
}
