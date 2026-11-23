<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Multi-campus: a school group (one owner, many campuses). Each campus is a
 * normal school (tenant) with its own data; the group links them together
 * and an "owner" login can see all of them.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::table('schools', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('id')->constrained('school_groups')->nullOnDelete();
            $table->string('campus_name')->nullable()->after('name');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('group_id')->nullable()->after('school_id')->constrained('school_groups')->nullOnDelete();
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin','owner','admin','teacher','student','parent','accountant','librarian','receptionist') NOT NULL");
        }
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'owner')->delete();
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY role ENUM('super_admin','admin','teacher','student','parent','accountant','librarian','receptionist') NOT NULL");
        }
        Schema::table('users', fn (Blueprint $t) => $t->dropConstrainedForeignId('group_id'));
        Schema::table('schools', function (Blueprint $t) {
            $t->dropConstrainedForeignId('group_id');
            $t->dropColumn('campus_name');
        });
        Schema::dropIfExists('school_groups');
    }
};
