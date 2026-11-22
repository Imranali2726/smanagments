<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }
}
