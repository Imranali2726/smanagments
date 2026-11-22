<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentHistory extends Model
{
    use Concerns\BelongsToSchool;

    protected $guarded = ['id'];

    public static function record(Student $student, string $event, ?string $description = null): self
    {
        return static::create([
            'student_id' => $student->id,
            'academic_session_id' => $student->academic_session_id,
            'school_class_id' => $student->school_class_id,
            'section_id' => $student->section_id,
            'event' => $event,
            'description' => $description,
            'changed_by' => auth()->id(),
        ]);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function schoolClass(): BelongsTo
    {
        return $this->belongsTo(SchoolClass::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function changer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
