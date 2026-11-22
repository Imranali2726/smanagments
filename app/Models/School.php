<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A school (tenant) using AAS School Manager. */
class School extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'expires_at' => 'date:Y-m-d',
            'disabled_modules' => 'array',
            'student_limit' => 'integer',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->endOfDay()->isPast();
    }

    public function moduleEnabled(string $module): bool
    {
        return ! in_array($module, $this->disabled_modules ?? [], true);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function students(): HasMany
    {
        return $this->hasMany(Student::class);
    }

    public function teachers(): HasMany
    {
        return $this->hasMany(Teacher::class);
    }

    /** Public summary returned to the apps. */
    public function summary(): array
    {
        return $this->only('id', 'name', 'subdomain', 'status', 'plan', 'student_limit', 'disabled_modules') + [
            'expires_at' => $this->expires_at?->toDateString(),
        ];
    }
}
