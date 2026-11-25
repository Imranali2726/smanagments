<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use Concerns\BelongsToSchool;

    use HasApiTokens, Notifiable;

    public const ROLES = ['admin', 'teacher', 'student', 'parent', 'accountant', 'librarian', 'receptionist'];

    /** Platform owner: manages schools, belongs to no school. */
    public const SUPER_ADMIN = 'super_admin';

    /** Owner of a school group: sees all campuses of the group. */
    public const OWNER = 'owner';

    protected $guarded = ['id'];

    protected $hidden = ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes', 'two_factor_last_step'];

    /** Two-factor login is on (an authenticator app was set up and confirmed). */
    public function hasTwoFactor(): bool
    {
        return $this->two_factor_confirmed_at !== null && $this->two_factor_secret;
    }

    /** Turns two-factor login off and forgets the secret and recovery codes. */
    public function clearTwoFactor(): void
    {
        $this->forceFill(['two_factor_secret' => null, 'two_factor_recovery_codes' => null, 'two_factor_confirmed_at' => null, 'two_factor_last_step' => null])->save();
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
            'two_factor_secret' => 'encrypted',
            'two_factor_recovery_codes' => 'encrypted:array',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function teacher(): HasOne
    {
        return $this->hasOne(Teacher::class);
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function guardian(): HasOne
    {
        return $this->hasOne(Guardian::class);
    }

    public function hasRole(string ...$roles): bool
    {
        return in_array($this->role, $roles, true);
    }

    /** Loads the profile that matches the user's role (teacher / student / guardian). */
    public function loadProfile(): self
    {
        return match ($this->role) {
            'teacher' => $this->load('teacher'),
            'student' => $this->load('student.schoolClass', 'student.section'),
            'parent' => $this->load('guardian.students.schoolClass', 'guardian.students.section'),
            default => $this,
        };
    }
}
