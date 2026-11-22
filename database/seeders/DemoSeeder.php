<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\AdmissionEnquiry;
use App\Models\Asset;
use App\Models\Hostel;
use App\Models\Income;
use App\Models\InventoryItem;
use App\Models\Supplier;
use App\Models\TransportRoute;
use App\Models\Vehicle;
use App\Models\Visitor;
use App\Models\Attendance;
use App\Models\ClassSubject;
use App\Models\Exam;
use App\Models\FeeStructure;
use App\Models\FeeType;
use App\Models\Guardian;
use App\Models\Mark;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\Timetable;
use App\Models\User;
use App\Services\FeeService;
use Illuminate\Database\Seeder;

/** Sample data for trying the system:  php artisan db:seed --class=DemoSeeder */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        \App\Support\Tenant::set(\App\Models\School::orderBy('id')->first());
        mt_srand(2026);
        $session = AcademicSession::current();

        // Staff logins
        User::updateOrCreate(['email' => 'accountant@school.com'], ['name' => 'Accounts Officer', 'password' => 'password', 'role' => 'accountant']);
        User::updateOrCreate(['email' => 'librarian@school.com'], ['name' => 'Librarian', 'password' => 'password', 'role' => 'librarian']);
        User::updateOrCreate(['email' => 'reception@school.com'], ['name' => 'Front Desk', 'password' => 'password', 'role' => 'receptionist']);

        // Transport, hostel, store, front office samples
        $van = Vehicle::firstOrCreate(['vehicle_no' => 'LEA-1234'], ['model' => 'Toyota Hiace 2020', 'capacity' => 15, 'driver_name' => 'Aslam', 'driver_phone' => '03001112233']);
        TransportRoute::firstOrCreate(['name' => 'Route 1 - Model Town'], ['vehicle_id' => $van->id, 'fare' => 2500]);
        $hostel = Hostel::firstOrCreate(['name' => 'Boys Hostel'], ['type' => 'boys', 'warden_name' => 'Mr. Saleem', 'warden_phone' => '03004445566']);
        foreach (['101', '102', '103'] as $room) {
            $hostel->rooms()->firstOrCreate(['room_no' => $room], ['room_type' => '3-Seater', 'capacity' => 3, 'cost_per_month' => 6000]);
        }
        $supplier = Supplier::firstOrCreate(['name' => 'City Stationers'], ['phone' => '04235550000']);
        foreach ([['A4 Paper Rim', 'Stationery', 'rim', 40, 10, 1200], ['Whiteboard Marker', 'Stationery', 'pcs', 6, 20, 120], ['Chalk Box', 'Stationery', 'box', 25, 5, 150]] as [$n, $c, $u, $q, $r, $p]) {
            InventoryItem::firstOrCreate(['name' => $n], ['category' => $c, 'unit' => $u, 'quantity' => $q, 'reorder_level' => $r, 'unit_price' => $p]);
        }
        Asset::firstOrCreate(['asset_code' => 'IT-0001'], ['name' => 'Multimedia Projector', 'category' => 'IT', 'purchase_cost' => 85000, 'supplier_id' => $supplier->id, 'location' => 'Hall', 'condition' => 'good']);
        AdmissionEnquiry::firstOrCreate(['phone' => '03215556677'], ['name' => 'Kamran Ali', 'student_name' => 'Ayaan', 'source' => 'walk_in', 'enquiry_date' => today()->toDateString(), 'follow_up_date' => today()->addDays(3)->toDateString()]);
        Visitor::firstOrCreate(['name' => 'Book Supplier Rep', 'visit_date' => today()->toDateString()], ['purpose' => 'Meeting', 'person_to_meet' => 'Principal', 'in_time' => '10:30']);
        Income::firstOrCreate(['title' => 'Uniform sales'], ['category' => 'Uniform Sales', 'amount' => 15000, 'income_date' => today()->toDateString()]);

        // Teachers
        $teacherNames = ['Ayesha Khan', 'Muhammad Usman', 'Fatima Noor', 'Ali Raza', 'Sana Tariq', 'Bilal Ahmed', 'Hina Iqbal', 'Imran Shah'];
        $teachers = collect();
        foreach ($teacherNames as $i => $name) {
            $email = 'teacher'.($i + 1).'@school.com';
            $user = User::updateOrCreate(['email' => $email], ['name' => $name, 'password' => 'password', 'role' => 'teacher']);
            $teachers->push(Teacher::updateOrCreate(['employee_no' => 'EMP-'.str_pad($i + 1, 4, '0', STR_PAD_LEFT)], [
                'user_id' => $user->id,
                'name' => $name,
                'email' => $email,
                'phone' => '0300'.str_pad((string) (1000000 + $i * 1111), 7, '0', STR_PAD_LEFT),
                'gender' => in_array($i, [0, 2, 4, 6]) ? 'female' : 'male',
                'qualification' => ['M.A English', 'M.Sc Mathematics', 'M.Sc Physics', 'B.Ed', 'M.A Urdu', 'MCS', 'M.Sc Chemistry', 'M.A Islamiat'][$i],
                'designation' => 'Teacher',
                'joining_date' => now()->subYears(mt_rand(1, 8))->toDateString(),
                'basic_salary' => mt_rand(40, 90) * 1000,
            ]));
        }

        // Class teachers, subjects & fee structure for Class 1 - Class 5
        $classes = SchoolClass::whereIn('name', ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'])->with('sections')->get();
        $subjects = Subject::whereIn('code', ['ENG', 'URD', 'MATH', 'SCI', 'ISL', 'SST'])->get();
        $tuition = FeeType::where('name', 'Tuition Fee')->first();
        $computer = FeeType::where('name', 'Computer Lab Fee')->first();
        $admission = FeeType::where('name', 'Admission Fee')->first();

        foreach ($classes as $ci => $class) {
            $section = $class->sections->first();
            $section->update(['class_teacher_id' => $teachers[$ci]->id]);

            foreach ($subjects as $si => $subject) {
                ClassSubject::firstOrCreate(
                    ['school_class_id' => $class->id, 'subject_id' => $subject->id],
                    ['teacher_id' => $teachers[($ci + $si) % $teachers->count()]->id]
                );
            }

            foreach ([[$tuition, 3000 + $ci * 500], [$computer, 500], [$admission, 5000]] as [$type, $amount]) {
                FeeStructure::firstOrCreate(
                    ['school_class_id' => $class->id, 'fee_type_id' => $type->id, 'academic_session_id' => $session?->id],
                    ['amount' => $amount]
                );
            }

            // Simple Mon-Fri timetable: 6 periods of 40 minutes from 08:00
            $days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
            foreach ($days as $d => $day) {
                foreach ($subjects as $p => $subject) {
                    $start = now()->setTime(8, 0)->addMinutes($p * 40);
                    // Rotate subjects by day so each day has a different order.
                    $subj = $subjects[($p + $d) % $subjects->count()];
                    Timetable::firstOrCreate(
                        ['section_id' => $section->id, 'day' => $day, 'start_time' => $start->format('H:i:s')],
                        ['subject_id' => $subj->id, 'teacher_id' => null, 'end_time' => $start->copy()->addMinutes(40)->format('H:i:s'), 'room' => 'R-'.($ci + 1)]
                    );
                }
            }
        }

        // Guardians & students (8 per class)
        $first = ['Ahmed', 'Hamza', 'Zainab', 'Maryam', 'Abdullah', 'Hassan', 'Aiman', 'Hoorain', 'Saad', 'Eman', 'Rayyan', 'Anaya'];
        $last = ['Khan', 'Malik', 'Butt', 'Chaudhry', 'Qureshi', 'Sheikh', 'Siddiqui', 'Mirza'];
        $fathers = ['Tariq', 'Naveed', 'Shahid', 'Kashif', 'Asif', 'Rashid', 'Zahid', 'Javed'];
        $n = 0;
        foreach ($classes as $class) {
            $section = $class->sections->first();
            for ($k = 1; $k <= 8; $k++) {
                $n++;
                $lastName = $last[$n % count($last)];
                $guardian = Guardian::firstOrCreate(['cnic' => '35202-'.str_pad((string) (1000000 + $n), 7, '0', STR_PAD_LEFT).'-1'], [
                    'name' => $fathers[$n % count($fathers)].' '.$lastName,
                    'relation' => 'Father',
                    'phone' => '0321'.str_pad((string) (2000000 + $n * 37), 7, '0', STR_PAD_LEFT),
                    'occupation' => ['Businessman', 'Engineer', 'Doctor', 'Teacher', 'Banker'][$n % 5],
                    'address' => 'House '.$n.', Lahore',
                ]);
                $firstName = $first[$n % count($first)];
                Student::firstOrCreate(['admission_no' => 'ADM-DEMO-'.str_pad((string) $n, 4, '0', STR_PAD_LEFT)], [
                    'roll_no' => (string) $k,
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'gender' => in_array($firstName, ['Zainab', 'Maryam', 'Aiman', 'Hoorain', 'Eman', 'Anaya']) ? 'female' : 'male',
                    'date_of_birth' => now()->subYears(6 + $class->numeric_level - 3)->subDays(mt_rand(0, 300))->toDateString(),
                    'admission_date' => now()->subMonths(mt_rand(1, 24))->toDateString(),
                    'school_class_id' => $class->id,
                    'section_id' => $section->id,
                    'academic_session_id' => $session?->id,
                    'guardian_id' => $guardian->id,
                    'status' => 'active',
                ]);
            }
        }

        // Parent login for the first guardian
        $firstGuardian = Guardian::orderBy('id')->first();
        if ($firstGuardian && ! $firstGuardian->user_id) {
            $parentUser = User::updateOrCreate(['email' => 'parent@school.com'], ['name' => $firstGuardian->name, 'password' => 'password', 'role' => 'parent']);
            $firstGuardian->update(['user_id' => $parentUser->id]);
        }

        // Attendance for the last 10 weekdays
        $students = Student::active()->get();
        $date = today();
        $days = 0;
        while ($days < 10) {
            if (! $date->isWeekend()) {
                foreach ($students as $s) {
                    $r = mt_rand(1, 100);
                    Attendance::firstOrCreate(['student_id' => $s->id, 'date' => $date->toDateString()], [
                        'section_id' => $s->section_id,
                        'status' => $r <= 85 ? 'present' : ($r <= 92 ? 'absent' : ($r <= 97 ? 'late' : 'leave')),
                    ]);
                }
                $days++;
            }
            $date = $date->copy()->subDay();
        }

        // One published exam with marks
        $exam = Exam::firstOrCreate(['name' => 'First Term', 'academic_session_id' => $session?->id], [
            'start_date' => now()->subMonth()->toDateString(),
            'end_date' => now()->subMonth()->addDays(7)->toDateString(),
            'is_published' => true,
        ]);
        foreach ($students as $s) {
            foreach ($subjects as $subject) {
                Mark::firstOrCreate(['exam_id' => $exam->id, 'student_id' => $s->id, 'subject_id' => $subject->id], [
                    'total_marks' => 100,
                    'obtained_marks' => mt_rand(28, 99),
                ]);
            }
        }

        // Invoices for this month; pay about half of them
        $result = app(FeeService::class)->generate(['month' => now()->format('Y-m')]);
        foreach (array_slice($result['invoice_ids'], 0, (int) ceil(count($result['invoice_ids']) / 2)) as $id) {
            $invoice = \App\Models\FeeInvoice::find($id);
            $invoice->payments()->create(['amount' => $invoice->total, 'method' => 'cash', 'paid_on' => today()->toDateString()]);
            $invoice->recalculate();
        }

        $this->command?->info('Demo data created. Logins (password: "password"): admin@school.com, accountant@school.com, librarian@school.com, reception@school.com, teacher1@school.com, parent@school.com');
    }
}
