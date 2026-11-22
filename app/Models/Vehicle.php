<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'insurance_expiry' => 'date:Y-m-d',
        ];
    }

    public function routes(): HasMany
    {
        return $this->hasMany(TransportRoute::class);
    }
}
