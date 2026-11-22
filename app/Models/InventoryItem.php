<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'reorder_level' => 'float',
            'unit_price' => 'float',
        ];
    }

    protected $appends = ['is_low_stock'];

    public function getIsLowStockAttribute(): bool
    {
        return (float) ($this->attributes['quantity'] ?? 0) <= (float) ($this->attributes['reorder_level'] ?? 0);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
