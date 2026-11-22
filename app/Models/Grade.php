<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class Grade extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'min_percentage' => 'float',
            'max_percentage' => 'float',
            'grade_point' => 'float',
        ];
    }

    protected static ?Collection $cached = null;

    public static function forPercentage(float $percentage): ?self
    {
        static::$cached ??= static::orderByDesc('min_percentage')->get();

        return static::$cached->first(fn (Grade $g) => $percentage >= $g->min_percentage && $percentage <= $g->max_percentage)
            ?? static::$cached->first(fn (Grade $g) => $percentage >= $g->min_percentage);
    }

    protected static function booted(): void
    {
        static::saved(fn () => static::$cached = null);
        static::deleted(fn () => static::$cached = null);
    }
}
