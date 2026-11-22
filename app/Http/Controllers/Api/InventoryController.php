<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\InventoryItem;
use App\Models\StockMovement;
use App\Support\CsvExport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/** Stock in / out / adjustments and store reports. Items themselves are managed by InventoryItemController. */
class InventoryController extends Controller
{
    /** GET /stock-movements?inventory_item_id=&type=&from=&to= */
    public function movements(Request $request)
    {
        $query = StockMovement::with('item:id,name,unit', 'supplier:id,name', 'creator:id,name')
            ->when($request->query('inventory_item_id'), fn ($q, $v) => $q->where('inventory_item_id', $v))
            ->when($request->query('type'), fn ($q, $v) => $q->where('type', $v))
            ->when($request->query('from'), fn ($q, $v) => $q->whereDate('movement_date', '>=', $v))
            ->when($request->query('to'), fn ($q, $v) => $q->whereDate('movement_date', '<=', $v))
            ->orderByDesc('movement_date')->orderByDesc('id');

        if ($request->query('export') === 'csv') {
            return CsvExport::download($query->get(), 'stock-movements');
        }

        return response()->json($query->paginate(min((int) $request->query('per_page', 30), 200)));
    }

    /**
     * POST /stock-movements
     * { inventory_item_id, type: in|out|adjustment, quantity, unit_price?, movement_date?, supplier_id?, issued_to?, reference?, notes? }
     * For "adjustment", quantity is the counted stock (physical stock-take).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|numeric|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'movement_date' => 'nullable|date|before_or_equal:today',
            'supplier_id' => 'nullable|exists:suppliers,id',
            'issued_to' => 'nullable|required_if:type,out|string|max:255',
            'reference' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:255',
        ]);

        $movement = DB::transaction(function () use ($data, $request) {
            $item = InventoryItem::lockForUpdate()->findOrFail($data['inventory_item_id']);
            $qty = (float) $data['quantity'];

            $newQty = match ($data['type']) {
                'in' => $item->quantity + $qty,
                'out' => $item->quantity - $qty,
                'adjustment' => $qty,
            };
            if ($data['type'] !== 'adjustment' && $qty <= 0) {
                throw ValidationException::withMessages(['quantity' => 'Quantity must be greater than zero.']);
            }
            if ($newQty < 0) {
                throw ValidationException::withMessages(['quantity' => "Only {$item->quantity} {$item->unit} in stock."]);
            }

            $item->quantity = $newQty;
            if ($data['type'] === 'in' && ! empty($data['unit_price'])) {
                $item->unit_price = $data['unit_price'];
            }
            $item->save();

            return StockMovement::create($data + [
                'movement_date' => $data['movement_date'] ?? today()->toDateString(),
                'created_by' => $request->user()->id,
            ]);
        });

        return response()->json(['message' => 'Stock updated.', 'data' => $movement->load('item')], 201);
    }

    /** GET /inventory/report : stock value, low stock items, asset summary. */
    public function report(Request $request): JsonResponse
    {
        $items = InventoryItem::orderBy('name')->get();
        $low = $items->filter(fn ($i) => $i->is_low_stock)->values();

        return response()->json([
            'total_items' => $items->count(),
            'stock_value' => round($items->sum(fn ($i) => $i->quantity * $i->unit_price), 2),
            'low_stock_count' => $low->count(),
            'low_stock' => $low,
            'by_category' => $items->groupBy(fn ($i) => $i->category ?: 'Uncategorised')
                ->map(fn ($g) => ['items' => $g->count(), 'value' => round($g->sum(fn ($i) => $i->quantity * $i->unit_price), 2)]),
            'assets' => [
                'count' => Asset::where('condition', '!=', 'disposed')->count(),
                'value' => (float) Asset::where('condition', '!=', 'disposed')->sum('purchase_cost'),
                'by_condition' => Asset::selectRaw('`condition`, COUNT(*) as total')->groupBy('condition')->pluck('total', 'condition'),
            ],
        ]);
    }
}
