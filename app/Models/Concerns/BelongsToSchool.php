<?php

namespace App\Models\Concerns;

use App\Models\School;
use App\Support\Tenant;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/** Scopes every query to the current school and stamps school_id on create. */
trait BelongsToSchool
{
    protected static function bootBelongsToSchool(): void
    {
        static::addGlobalScope('school', function (Builder $builder) {
            if ($id = Tenant::id()) {
                $builder->where($builder->getModel()->getTable().'.school_id', $id);
            }
        });

        static::creating(function ($model) {
            if (empty($model->school_id) && ($id = Tenant::id())) {
                $model->school_id = $id;
            }
        });
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }
}
