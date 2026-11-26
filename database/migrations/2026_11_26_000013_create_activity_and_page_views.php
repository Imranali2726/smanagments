<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Staff tracking (activity log, online status, daily usage) and landing page visitor analytics.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('actor_role', 20)->nullable();
            $table->string('action', 20);              // login, login_failed, logout, create, update, delete
            $table->string('module', 60)->nullable();  // e.g. Students, Fee payments
            $table->string('description', 255);
            $table->string('subject_id', 40)->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('device', 120)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['school_id', 'created_at']);
            $table->index(['user_id', 'created_at']);
        });

        Schema::create('user_activity_days', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->timestamp('first_seen_at')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->unsignedInteger('active_seconds')->default(0);
            $table->unique(['user_id', 'date']);
            $table->index(['school_id', 'date']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('last_seen_at')->nullable();
        });

        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('event', 20)->default('view'); // view, whatsapp, video, login
            $table->string('path', 120)->default('/');
            $table->char('visitor', 16);                  // daily anonymous hash (no cookies)
            $table->string('source', 30)->nullable();     // Facebook, Google, WhatsApp, Direct…
            $table->string('referrer_host', 120)->nullable();
            $table->string('device', 10)->nullable();     // mobile, tablet, desktop
            $table->char('country', 2)->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['event', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('last_seen_at'));
        Schema::dropIfExists('user_activity_days');
        Schema::dropIfExists('activity_logs');
    }
};
