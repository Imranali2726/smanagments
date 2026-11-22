<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('teacher_id')->constrained()->cascadeOnDelete();
            $table->char('month', 7);                       // YYYY-MM
            $table->decimal('basic_salary', 12, 2);
            $table->decimal('allowances', 12, 2)->default(0);
            $table->decimal('deductions', 12, 2)->default(0);
            $table->unsignedTinyInteger('absent_days')->default(0);
            $table->decimal('net_salary', 12, 2);
            $table->enum('status', ['pending', 'paid'])->default('pending')->index();
            $table->string('payment_method', 30)->nullable();
            $table->date('paid_on')->nullable();
            $table->string('notes')->nullable();
            $table->timestamps();
            $table->unique(['teacher_id', 'month']);
        });

        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category', 50)->index();        // Utilities, Rent, Stationery ...
            $table->decimal('amount', 12, 2);
            $table->date('expense_date')->index();
            $table->string('payment_method', 30)->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('notices', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->enum('audience', ['all', 'teachers', 'students', 'parents', 'staff'])->default('all');
            $table->foreignId('section_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('publish_date');
            $table->date('expiry_date')->nullable();
            $table->boolean('is_published')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('homework', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('attachment')->nullable();
            $table->date('assigned_date');
            $table->date('due_date')->nullable();
            $table->timestamps();
        });

        Schema::create('books', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('author')->nullable();
            $table->string('isbn', 30)->nullable()->unique();
            $table->string('category', 50)->nullable();
            $table->string('publisher')->nullable();
            $table->string('edition', 30)->nullable();
            $table->unsignedInteger('quantity')->default(1);
            $table->unsignedInteger('available')->default(1);
            $table->string('rack_no', 20)->nullable();
            $table->timestamps();
        });

        Schema::create('book_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('book_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained()->cascadeOnDelete();
            $table->date('issue_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->decimal('fine', 10, 2)->default(0);
            $table->enum('status', ['issued', 'returned', 'lost'])->default('issued')->index();
            $table->foreignId('issued_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_issues');
        Schema::dropIfExists('books');
        Schema::dropIfExists('homework');
        Schema::dropIfExists('notices');
        Schema::dropIfExists('expenses');
        Schema::dropIfExists('salary_payments');
    }
};
