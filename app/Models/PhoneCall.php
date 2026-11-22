<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PhoneCall extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'call_date' => 'date:Y-m-d',
            'follow_up_date' => 'date:Y-m-d',
        ];
    }
}
