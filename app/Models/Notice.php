<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notice extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return [
            'publish_date' => 'date:Y-m-d',
            'expiry_date' => 'date:Y-m-d',
            'is_published' => 'boolean',
        ];
    }

    /** Notices currently visible to the given user. */
    public function scopeVisibleTo(Builder $query, User $user): Builder
    {
        $query->where('is_published', true)
            ->whereDate('publish_date', '<=', today())
            ->where(fn ($q) => $q->whereNull('expiry_date')->orWhereDate('expiry_date', '>=', today()));

        if ($user->role === 'admin') {
            return $query;
        }

        $audiences = match ($user->role) {
            'teacher' => ['all', 'teachers', 'staff'],
            'student' => ['all', 'students'],
            'parent' => ['all', 'parents'],
            default => ['all', 'staff'],
        };
        $query->whereIn('audience', $audiences);

        // Section-specific notices only for students/parents of that section.
        $sectionIds = match ($user->role) {
            'student' => $user->student ? [$user->student->section_id] : [],
            'parent' => $user->guardian ? $user->guardian->students()->pluck('section_id')->all() : [],
            default => null,
        };

        if (is_array($sectionIds)) {
            $query->where(fn ($q) => $q->whereNull('section_id')->orWhereIn('section_id', $sectionIds));
        }

        return $query;
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
