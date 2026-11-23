<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Some single-column unique indexes were still global, so a second school could not be
 * created (e.g. both schools need an academic session "2026-2027" or a class "Grade 1").
 * Make them unique per school instead.
 */
return new class extends Migration
{
    private const COLUMNS = [
        'academic_sessions' => 'name',
        'school_classes' => 'name',
        'fee_types' => 'name',
        'leave_types' => 'name',
        'fee_invoices' => 'invoice_no',
        'fee_payments' => 'receipt_no',
        'admission_applications' => 'application_no',
    ];

    public function up(): void
    {
        foreach (self::COLUMNS as $table => $column) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'school_id')) {
                continue;
            }
            $indexes = collect(Schema::getIndexes($table))->pluck('name')->all();
            Schema::table($table, function (Blueprint $t) use ($table, $column, $indexes) {
                if (in_array("{$table}_{$column}_unique", $indexes, true)) {
                    $t->dropUnique("{$table}_{$column}_unique");
                }
                if (! in_array("{$table}_school_{$column}_unique", $indexes, true)) {
                    $t->unique(['school_id', $column], "{$table}_school_{$column}_unique");
                }
            });
        }
    }

    public function down(): void
    {
        foreach (self::COLUMNS as $table => $column) {
            if (! Schema::hasTable($table)) {
                continue;
            }
            Schema::table($table, function (Blueprint $t) use ($table, $column) {
                $t->dropUnique("{$table}_school_{$column}_unique");
                $t->unique($column);
            });
        }
    }
};
