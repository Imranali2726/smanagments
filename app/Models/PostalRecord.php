<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostalRecord extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'postal_date' => 'date:Y-m-d',
        ];
    }
}
