<?php

namespace App\Support;

use App\Models\School;
use App\Models\Setting;

/**
 * The school (tenant) of the current request. Every school-owned model is
 * filtered by it (see Models\Concerns\BelongsToSchool).
 */
class Tenant
{
    /** Tables that carry a school_id column. */
    public const TABLES = [
        'users', 'settings', 'sms_logs', 'academic_sessions', 'school_classes', 'subjects', 'teachers', 'sections',
        'class_subjects', 'vehicles', 'transport_routes', 'guardians', 'students', 'attendances', 'staff_attendances',
        'timetables', 'exams', 'grades', 'marks', 'fee_types', 'fee_structures', 'fee_invoices', 'fee_invoice_items',
        'fee_payments', 'salary_payments', 'expenses', 'notices', 'homework', 'books', 'book_issues', 'student_histories',
        'admission_applications', 'exam_schedules', 'homework_submissions', 'study_materials', 'incomes',
        'payment_methods', 'payment_submissions', 'admission_enquiries', 'visitors', 'phone_calls', 'postal_records',
        'complaints', 'leave_types', 'leave_requests', 'messages', 'suppliers', 'inventory_items', 'stock_movements',
        'assets', 'hostels', 'hostel_rooms', 'hostel_allocations', 'events', 'student_remarks',
    ];

    /** Modules a school can have switched off => API path prefixes (after /api/). */
    public const MODULES = [
        'exams' => ['exams', 'exam-schedules', 'marks', 'results', 'grades'],
        'homework' => ['homework', 'homework-submissions', 'study-materials'],
        'online_admission' => ['admission-applications', 'public/admission-applications'],
        'finance' => ['expenses', 'incomes', 'reports/income-expense'],
        'payroll' => ['payroll'],
        'front_office' => ['admission-enquiries', 'visitors', 'phone-calls', 'postal-records', 'complaints'],
        'library' => ['books', 'book-issues'],
        'transport' => ['transport-routes', 'vehicles'],
        'hostel' => ['hostels', 'hostel-rooms', 'hostel-allocations', 'hostels-occupancy'],
        'inventory' => ['suppliers', 'inventory-items', 'stock-movements', 'inventory', 'assets'],
        'sms' => ['sms'],
        'events' => ['events'],
        'remarks' => ['student-remarks'],
    ];

    protected static ?School $school = null;

    public static function set(?School $school): void
    {
        static::$school = $school;
        Setting::flush();
    }

    public static function school(): ?School
    {
        return static::$school;
    }

    public static function id(): ?int
    {
        return static::$school?->id;
    }

    /** "bfs" for bfs.aasschoolmanager.com / bfs.localhost; null on the main domain. */
    public static function subdomainFromHost(string $host): ?string
    {
        $host = strtolower(trim(explode(':', $host)[0], '.'));
        $base = strtolower(trim((string) config('app.domain', 'localhost'), '.'));
        if ($base === '' || $host === $base || ! str_ends_with($host, '.'.$base)) {
            return null;
        }
        $sub = substr($host, 0, -strlen('.'.$base));
        $sub = str_contains($sub, '.') ? substr($sub, strrpos($sub, '.') + 1) : $sub;

        return in_array($sub, ['www', 'app', 'admin', 'api'], true) ? null : $sub;
    }

    /** Add school_id to raw rows used with upsert()/insert(), which skip model events. */
    public static function stamp(array $rows): array
    {
        $id = static::id();

        return $id ? array_map(fn ($r) => ['school_id' => $id] + $r, $rows) : $rows;
    }

    /** Module key for an API path, if the path belongs to a switchable module. */
    public static function moduleForPath(string $path): ?string
    {
        $path = preg_replace('#^api/#', '', trim($path, '/'));
        foreach (static::MODULES as $module => $prefixes) {
            foreach ($prefixes as $p) {
                if ($path === $p || str_starts_with($path, $p.'/')) {
                    return $module;
                }
            }
        }

        return null;
    }
}
