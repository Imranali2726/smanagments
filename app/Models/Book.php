<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    public function issues(): HasMany
    {
        return $this->hasMany(BookIssue::class);
    }
}
