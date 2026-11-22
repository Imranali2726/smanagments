<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Extended modules: online admission, student history, exam schedule, homework submissions,
 * download center, income, online payment submissions, payment methods, front office,
 * leave management, messaging, inventory & assets, hostel.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('academic_session_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('school_class_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('section_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event', 30);          // admitted, promoted, transferred, status_changed
            $table->string('description')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('admission_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_no', 30)->nullable()->unique();
            $table->string('first_name');
            $table->string('last_name')->nullable();
            $table->enum('gender', ['male', 'female', 'other']);
            $table->date('date_of_birth')->nullable();
            $table->string('b_form', 20)->nullable();
            $table->string('previous_school')->nullable();
            $table->foreignId('school_class_id')->nullable()->constrained()->nullOnDelete();
            $table->string('guardian_name');
            $table->string('guardian_relation', 30)->default('Father');
            $table->string('guardian_phone', 30);
            $table->string('guardian_email')->nullable();
            $table->string('guardian_cnic', 20)->nullable();
            $table->string('guardian_occupation')->nullable();
            $table->text('address')->nullable();
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->foreignId('student_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('exam_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->date('exam_date');
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('room', 30)->nullable();
            $table->decimal('total_marks', 6, 2)->default(100);
            $table->decimal('pass_marks', 6, 2)->nullable();
            $table->timestamps();
            $table->unique(['exam_id', 'school_class_id', 'subject_id']);
        });

        Schema::create('homework_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('homework_id')->constrained('homework')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->text('content')->nullable();
            $table->string('attachment')->nullable();
            $table->timestamp('submitted_at');
            $table->enum('status', ['submitted', 'late', 'evaluated'])->default('submitted');
            $table->decimal('marks', 6, 2)->nullable();
            $table->text('feedback')->nullable();
            $table->foreignId('evaluated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();
            $table->unique(['homework_id', 'student_id']);
        });

        Schema::create('study_materials', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->enum('type', ['assignment', 'syllabus', 'study_material', 'circular', 'other'])->default('study_material');
            $table->foreignId('school_class_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->nullOnDelete();
            $table->text('description')->nullable();
            $table->string('file')->nullable();
            $table->string('link')->nullable();
            $table->boolean('is_public')->default(true);   // visible to students & parents
            $table->foreignId('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('category', 50)->index();     // Book Sales, Donation, Event, Canteen ...
            $table->decimal('amount', 12, 2);
            $table->date('income_date')->index();
            $table->string('received_from')->nullable();
            $table->string('payment_method', 30)->nullable();
            $table->string('reference')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('payment_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');                     // e.g. Meezan Bank, JazzCash
            $table->string('account_title')->nullable();
            $table->string('account_number')->nullable();
            $table->text('instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('payment_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('fee_invoice_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('payment_method_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('amount', 12, 2);
            $table->string('method', 30);
            $table->string('reference')->nullable();     // transaction id
            $table->date('paid_on');
            $table->string('proof')->nullable();         // screenshot / deposit slip
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->foreignId('fee_payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();
        });

        // ---------------- Front office ----------------
        Schema::create('admission_enquiries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30);
            $table->string('email')->nullable();
            $table->string('student_name')->nullable();
            $table->foreignId('school_class_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source', 30)->default('walk_in');
            $table->date('enquiry_date');
            $table->date('follow_up_date')->nullable();
            $table->enum('status', ['open', 'follow_up', 'converted', 'closed'])->default('open')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('visitors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->string('cnic', 20)->nullable();
            $table->string('purpose');
            $table->string('person_to_meet')->nullable();
            $table->unsignedSmallInteger('number_of_persons')->default(1);
            $table->date('visit_date')->index();
            $table->time('in_time')->nullable();
            $table->time('out_time')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('phone_calls', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone', 30);
            $table->enum('call_type', ['incoming', 'outgoing']);
            $table->date('call_date')->index();
            $table->string('duration', 20)->nullable();
            $table->text('description')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->timestamps();
        });

        Schema::create('postal_records', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['receive', 'dispatch']);
            $table->string('reference_no', 50)->nullable();
            $table->string('title');
            $table->string('from_title')->nullable();
            $table->string('to_title')->nullable();
            $table->text('address')->nullable();
            $table->date('postal_date')->index();
            $table->string('attachment')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('complaints', function (Blueprint $table) {
            $table->id();
            $table->string('complainant_name');
            $table->string('phone', 30)->nullable();
            $table->string('complaint_type', 50)->nullable();
            $table->string('source', 30)->nullable();
            $table->text('description');
            $table->date('complaint_date')->index();
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['open', 'in_progress', 'resolved', 'closed'])->default('open')->index();
            $table->text('action_taken')->nullable();
            $table->date('resolved_at')->nullable();
            $table->timestamps();
        });

        // ---------------- Leave management ----------------
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();             // Casual, Sick, Annual ...
            $table->unsignedSmallInteger('days_allowed')->default(0);   // per session, 0 = unlimited
            $table->enum('applies_to', ['staff', 'student', 'both'])->default('both');
            $table->timestamps();
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('leave_type_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('applied_by')->nullable()->constrained('users')->nullOnDelete();
            $table->date('from_date');
            $table->date('to_date');
            $table->unsignedSmallInteger('days');
            $table->text('reason');
            $table->string('attachment')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('remarks')->nullable();
            $table->timestamps();
        });

        // ---------------- Messaging ----------------
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('messages')->cascadeOnDelete();
            $table->string('subject')->nullable();
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            $table->index(['receiver_id', 'read_at']);
        });

        // ---------------- Inventory & assets ----------------
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('contact_person')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('category', 50)->nullable()->index();
            $table->string('unit', 20)->default('pcs');
            $table->decimal('quantity', 12, 2)->default(0);
            $table->decimal('reorder_level', 12, 2)->default(0);
            $table->decimal('unit_price', 12, 2)->default(0);
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->decimal('quantity', 12, 2);           // for adjustment: the new stock level
            $table->decimal('unit_price', 12, 2)->nullable();
            $table->date('movement_date')->index();
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('issued_to')->nullable();
            $table->string('reference')->nullable();
            $table->string('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('asset_code', 50)->nullable()->unique();
            $table->string('category', 50)->nullable()->index();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_cost', 12, 2)->default(0);
            $table->foreignId('supplier_id')->nullable()->constrained()->nullOnDelete();
            $table->string('location')->nullable();
            $table->enum('condition', ['new', 'good', 'fair', 'poor', 'damaged', 'disposed'])->default('good');
            $table->string('assigned_to')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ---------------- Hostel ----------------
        Schema::create('hostels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('type', ['boys', 'girls', 'mixed'])->default('boys');
            $table->text('address')->nullable();
            $table->string('warden_name')->nullable();
            $table->string('warden_phone', 30)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('hostel_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_id')->constrained()->cascadeOnDelete();
            $table->string('room_no', 20);
            $table->string('room_type', 50)->nullable();
            $table->unsignedSmallInteger('capacity')->default(1);
            $table->decimal('cost_per_month', 10, 2)->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['hostel_id', 'room_no']);
        });

        Schema::create('hostel_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hostel_room_id')->constrained()->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->date('from_date');
            $table->date('to_date')->nullable();
            $table->enum('status', ['active', 'left'])->default('active')->index();
            $table->string('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        foreach (['hostel_allocations', 'hostel_rooms', 'hostels'] as $t) {
            Schema::dropIfExists($t);
        }
        foreach (['assets', 'stock_movements', 'inventory_items', 'suppliers', 'messages',
            'leave_requests', 'leave_types', 'complaints', 'postal_records', 'phone_calls', 'visitors',
            'admission_enquiries', 'payment_submissions', 'payment_methods', 'incomes', 'study_materials',
            'homework_submissions', 'exam_schedules', 'admission_applications', 'student_histories'] as $t) {
            Schema::dropIfExists($t);
        }
    }
};
