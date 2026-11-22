<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\FeeType;
use App\Models\Grade;
use App\Models\LeaveType;
use App\Models\PaymentMethod;
use App\Models\SchoolClass;
use App\Models\Setting;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Base data needed to start using the system:
 *   php artisan migrate --seed
 * Demo data (teachers, students, fees, marks):
 *   php artisan db:seed --class=DemoSeeder
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Base data goes into the first (default) school created by the multi-school migration.
        $school = \App\Models\School::orderBy('id')->first()
            ?? \App\Models\School::create(['name' => 'Bright Future School', 'subdomain' => 'bfs']);
        $school->update(['name' => 'Bright Future School']);
        \App\Support\Tenant::set($school);

        User::updateOrCreate(['email' => 'admin@school.com'], [
            'name' => 'System Administrator',
            'password' => 'password',
            'role' => 'admin',
            'is_active' => true,
        ]);

        foreach (Setting::DEFAULTS as $key => $value) {
            Setting::firstOrCreate(['key' => $key], ['value' => $value]);
        }
        Setting::put('school_name', 'Bright Future School');

        $year = (int) now()->format('Y');
        $startYear = now()->month >= 4 ? $year : $year - 1;   // Pakistani schools usually start in April
        AcademicSession::firstOrCreate(['name' => $startYear.'-'.($startYear + 1)], [
            'start_date' => "{$startYear}-04-01",
            'end_date' => ($startYear + 1).'-03-31',
            'is_current' => true,
        ]);

        $grades = [
            ['A+', 90, 100, 4.0, 'Outstanding'],
            ['A', 80, 89.99, 4.0, 'Excellent'],
            ['B', 70, 79.99, 3.0, 'Very Good'],
            ['C', 60, 69.99, 2.5, 'Good'],
            ['D', 50, 59.99, 2.0, 'Satisfactory'],
            ['E', 33, 49.99, 1.0, 'Needs Improvement'],
            ['F', 0, 32.99, 0.0, 'Fail'],
        ];
        foreach ($grades as [$name, $min, $max, $gp, $remarks]) {
            Grade::firstOrCreate(['name' => $name], [
                'min_percentage' => $min, 'max_percentage' => $max, 'grade_point' => $gp, 'remarks' => $remarks,
            ]);
        }

        foreach ([
            ['Tuition Fee', 'monthly'],
            ['Admission Fee', 'one_time'],
            ['Annual Charges', 'yearly'],
            ['Exam Fee', 'yearly'],
            ['Computer Lab Fee', 'monthly'],
        ] as [$name, $frequency]) {
            FeeType::firstOrCreate(['name' => $name], ['frequency' => $frequency]);
        }

        $classes = ['Play Group', 'Nursery', 'Prep', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
            'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];
        foreach ($classes as $level => $name) {
            $class = SchoolClass::firstOrCreate(['name' => $name], ['numeric_level' => $level]);
            $class->sections()->firstOrCreate(['name' => 'A'], ['capacity' => 40]);
        }

        foreach ([['Casual Leave', 10, 'staff'], ['Sick Leave', 8, 'both'], ['Annual Leave', 14, 'staff'], ['Other', 0, 'both']] as [$name, $days, $for]) {
            LeaveType::firstOrCreate(['name' => $name], ['days_allowed' => $days, 'applies_to' => $for]);
        }

        PaymentMethod::firstOrCreate(['name' => 'Bank Transfer'], [
            'account_title' => 'School Account (edit me)',
            'account_number' => 'PK00XXXX0000000000000000',
            'instructions' => 'Transfer the fee, then submit the transaction ID and a screenshot from the parent portal.',
        ]);
        PaymentMethod::firstOrCreate(['name' => 'JazzCash'], ['account_title' => 'School (edit me)', 'account_number' => '03XXXXXXXXX']);
        PaymentMethod::firstOrCreate(['name' => 'EasyPaisa'], ['account_title' => 'School (edit me)', 'account_number' => '03XXXXXXXXX']);

        foreach ([
            ['English', 'ENG'], ['Urdu', 'URD'], ['Mathematics', 'MATH'], ['General Science', 'SCI'],
            ['Islamiat', 'ISL'], ['Social Studies', 'SST'], ['Computer Science', 'CS'],
            ['Physics', 'PHY'], ['Chemistry', 'CHEM'], ['Biology', 'BIO'], ['Pakistan Studies', 'PST'],
        ] as [$name, $code]) {
            Subject::firstOrCreate(['code' => $code], ['name' => $name]);
        }
    }
}
