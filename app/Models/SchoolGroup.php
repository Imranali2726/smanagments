<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/** A group of campuses that belong to one owner. Not school-scoped. */
class SchoolGroup extends Model
{
    protected $guarded = ['id'];

    public function schools(): HasMany
    {
        return $this->hasMany(School::class, 'group_id');
    }

    /** Owner logins (users with role "owner"). Queried without the school scope. */
    public function owners()
    {
        return User::withoutGlobalScope('school')->where('group_id', $this->id)->where('role', User::OWNER);
    }
}
