<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // School calendar: events, holidays, meetings, sports days...
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['event', 'holiday', 'exam', 'meeting', 'sports', 'other'])->default('event')->index();
            $table->date('start_date')->index();
            $table->date('end_date')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('location')->nullable();
            $table->enum('audience', ['all', 'staff', 'parents', 'students'])->default('all');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // Behaviour & discipline log (positive / negative remarks on students).
        Schema::create('student_remarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['positive', 'negative', 'note'])->default('note')->index();
            $table->string('category', 50)->nullable();
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('remark_date');
            $table->string('action_taken')->nullable();
            $table->boolean('visible_to_parent')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_remarks');
        Schema::dropIfExists('events');
    }
};
