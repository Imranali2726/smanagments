<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Student extends Model
{
    use Concerns\BelongsToSchool;

    protected static function booted(): void
    {
        // Plan limit: refuse new students once the school reaches its student limit.
        static::creating(function (Student $student) {
            $school = \App\Support\Tenant::school();
            if ($school && $school->student_limit && static::count() >= $school->student_limit) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'first_name' => "Your plan allows {$school->student_limit} students. Please contact AAS School Manager to upgrade.",
                ]);
            }
        });
    }

    protected $guarded = ['id'];

    protected $appends = ['full_name'];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date:Y-m-d',
            'admission_date' => 'date:Y-m-d',
            'monthly_discount' => 'decimal:2',
        ];
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim(($this->attributes['first_name'] ?? '').' '.($this->attributes['last_name'] ?? '')));
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function guardian(): BelongsTo
    {
        return $this->belongsTo(Guardian::class);
    }

    public function transportRoute(): BelongsTo
    {
        return $this->belongsTo(TransportRoute::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    public function marks(): HasMany
    {
        return $this->hasMany(Mark::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(FeeInvoice::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(StudentHistory::class)->latest();
    }

    public function homeworkSubmissions(): HasMany
    {
        return $this->hasMany(HomeworkSubmission::class);
    }

    public function hostelAllocations(): HasMany
    {
        return $this->hasMany(HostelAllocation::class);
    }

    public function activeHostelAllocation(): HasOne
    {
        return $this->hasOne(HostelAllocation::class)->where('status', 'active');
    }

    public static function nextAdmissionNo(): string
    {
        $prefix = 'ADM-'.now()->format('Y').'-';
        $last = static::where('admission_no', 'like', $prefix.'%')->orderByDesc('admission_no')->value('admission_no');
        $next = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix.str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }
}
