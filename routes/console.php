<?php

use App\Services\FeeService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('fees:apply-late-fines', function (FeeService $fees) {
    $count = $fees->applyLateFines();
    $this->info("Late fine applied to {$count} overdue invoice(s).");
})->purpose('Add the configured late fee to overdue unpaid invoices');

Artisan::command('fees:generate {month?}', function (FeeService $fees, ?string $month = null) {
    $result = $fees->generate(['month' => $month ?? now()->format('Y-m')]);
    $this->info("{$result['created']} invoice(s) created, {$result['skipped']} skipped.");
})->purpose('Generate monthly fee invoices for all active students');

// Run with: php artisan schedule:work   (or a cron calling schedule:run every minute)
Schedule::command('fees:generate')->monthlyOn(1, '06:00');
Schedule::command('fees:apply-late-fines')->dailyAt('01:00');
