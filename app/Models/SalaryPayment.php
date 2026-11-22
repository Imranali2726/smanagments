<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryPayment extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'basic_salary' => 'float',
            'allowances' => 'float',
            'deductions' => 'float',
            'net_salary' => 'float',
            'paid_on' => 'date:Y-m-d',
        ];
    }

    public function computeNet(): self
    {
        $this->net_salary = max(0, round($this->basic_salary + $this->allowances - $this->deductions, 2));

        return $this;
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }
}
