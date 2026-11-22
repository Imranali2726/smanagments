<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    use Concerns\BelongsToSchool;

    public const TYPES = ['event', 'holiday', 'exam', 'meeting', 'sports', 'other'];

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    /** Events the given user may see. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->role === 'admin') {
            return $query;
        }

        $audiences = match ($user->role) {
            'parent' => ['all', 'parents'],
            'student' => ['all', 'students'],
            default => ['all', 'staff'],
        };

        return $query->whereIn('audience', $audiences);
    }

    /** Events overlapping the date range. */
    public function scopeBetween(Builder $query, string $from, string $to): Builder
    {
        return $query->whereDate('start_date', '<=', $to)
            ->where(fn ($q) => $q->whereDate('end_date', '>=', $from)
                ->orWhere(fn ($w) => $w->whereNull('end_date')->whereDate('start_date', '>=', $from)));
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
