<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeType extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    public function structures(): HasMany
    {
        return $this->hasMany(FeeStructure::class);
    }
}
