<?php

use App\Support\Tenant;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Multi-school (SaaS): a `schools` table, a school_id on every school-owned
 * table, per-school unique numbers and a platform super admin.
 * Existing data is moved into one default school.
 */
return new class extends Migration
{
    /** Single-column unique indexes that must become unique per school. */
    private array $perSchoolUnique = [
        'settings' => 'key', 'subjects' => 'code', 'teachers' => 'employee_no', 'vehicles' => 'vehicle_no',
        'students' => 'admission_no', 'books' => 'isbn', 'assets' => 'asset_code',
    ];

    public function up(): void
    {
        Schema::create('schools', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subdomain', 60)->unique();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('city', 80)->nullable();
            $table->text('address')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('plan', 40)->default('standard');
            $table->unsignedInteger('student_limit')->nullable();
            $table->date('expires_at')->nullable();
            $table->enum('status', ['active', 'suspended'])->default('active')->index();
            $table->json('disabled_modules')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Default school for the data that already exists.
        $name = DB::table('settings')->where('key', 'school_name')->value('value') ?: 'My School';
        $sub = Str::lower(collect(preg_split('/\s+/', trim($name)))->map(fn ($w) => Str::substr($w, 0, 1))->join(''));
        $sub = preg_replace('/[^a-z0-9]/', '', $sub) ?: 'school';
        $schoolId = DB::table('schools')->insertGetId([
            'name' => $name, 'subdomain' => $sub, 'plan' => 'standard', 'status' => 'active',
            'phone' => DB::table('settings')->where('key', 'school_phone')->value('value') ?: null,
            'address' => DB::table('settings')->where('key', 'school_address')->value('value') ?: null,
            'created_at' => now(), 'updated_at' => now(),
        ]);

        foreach (Tenant::TABLES as $name) {
            if (! Schema::hasTable($name) || Schema::hasColumn($name, 'school_id')) {
                continue;
            }
            Schema::table($name, function (Blueprint $table) {
                $table->foreignId('school_id')->nullable()->after('id')->constrained('schools')->cascadeOnDelete();
            });
            DB::table($name)->update(['school_id' => $schoolId]);
        }

        foreach ($this->perSchoolUnique as $name => $column) {
            Schema::table($name, function (Blueprint $table) use ($name, $column) {
                $table->dropUnique("{$name}_{$column}_unique");
                $table->unique(['school_id', $column], "{$name}_school_{$column}_unique");
            });
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin','admin','teacher','student','parent','accountant','librarian','receptionist') NOT NULL");
        }

        if (! DB::table('users')->where('role', 'super_admin')->exists()) {
            DB::table('users')->insert([
                'name' => 'AAS Super Admin', 'email' => 'super@aasschoolmanager.com', 'password' => Hash::make('password'),
                'role' => 'super_admin', 'is_active' => true, 'school_id' => null, 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'super_admin')->delete();
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('admin','teacher','student','parent','accountant','librarian','receptionist') NOT NULL");
        }
        foreach ($this->perSchoolUnique as $name => $column) {
            Schema::table($name, function (Blueprint $table) use ($name, $column) {
                $table->dropUnique("{$name}_school_{$column}_unique");
                $table->unique($column);
            });
        }
        foreach (Tenant::TABLES as $name) {
            if (Schema::hasTable($name) && Schema::hasColumn($name, 'school_id')) {
                Schema::table($name, function (Blueprint $table) {
                    $table->dropConstrainedForeignId('school_id');
                });
            }
        }
        Schema::dropIfExists('schools');
    }
};
