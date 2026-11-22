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

    protected $guarded = ['id'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
            'last_login_at' => 'datetime',
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
