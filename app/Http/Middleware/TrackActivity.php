<?php

namespace App\Http\Middleware;

use App\Models\ActivityLog;
use App\Models\User;
use App\Support\Tenant;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Staff tracking: after every API request of a signed-in user,
 *  - keeps "last seen" and the day's active time up to date (at most once a minute), and
 *  - writes a line to the activity log for every successful add / change / delete.
 */
class TrackActivity
{
    /** Requests that are not worth a line in the log (or are logged elsewhere). */
    private const SKIP = ['api/login', 'api/login/two-factor', 'api/logout', 'api/logout-all', 'api/messages/read*', 'api/notifications/read*', 'api/public/*', 'api/platform/*'];

    /** Nicer names for some API paths. */
    private const NAMES = [
        'attendance' => 'Student attendance', 'staff-attendance' => 'Staff attendance', 'marks' => 'Exam marks', 'fees' => 'Fees',
        'fee-invoices' => 'Fee invoices', 'fee-payments' => 'Fee payments', 'payment-submissions' => 'Online fee payments',
        'admission-applications' => 'Online admissions', 'school-classes' => 'Classes', 'class-subjects' => 'Class subjects',
        'two-factor' => 'Two-factor login', 'change-password' => 'Password', 'profile' => 'Profile', 'website' => 'School website',
    ];

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);
        try {
            $this->track($request, $response->getStatusCode());
        } catch (\Throwable $e) {
            report($e); // tracking must never break the request
        }

        return $response;
    }

    private function track(Request $request, int $status): void
    {
        $user = $request->user();
        if (! $user || $user->role === User::SUPER_ADMIN || $status >= 400) {
            return;
        }
        $this->presence($user);

        $method = $request->method();
        if (! in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true) || $request->is(...self::SKIP)) {
            return;
        }
        $path = preg_replace('#^api/#', '', $request->path());
        $segments = explode('/', $path);
        $first = $segments[0];
        $module = self::NAMES[$first] ?? ucfirst(str_replace(['-', '_'], ' ', $first));
        $id = collect($segments)->first(fn ($s) => ctype_digit($s));
        $tail = collect($segments)->slice(1)->reject(fn ($s) => ctype_digit($s))->implode(' ');

        $action = match ($method) { 'DELETE' => 'delete', 'POST' => ($id ? 'update' : 'create'), default => 'update' };
        $verb = ['create' => 'Added', 'update' => 'Updated', 'delete' => 'Deleted'][$action];
        if ($tail !== '') {
            $verb = ucfirst(str_replace(['-', '_'], ' ', $tail));   // e.g. "Approve", "Generate", "Bulk"
            $action = $action === 'delete' ? 'delete' : 'update';
        }
        $label = trim((string) collect(['name', 'title', 'full_name', 'subject', 'invoice_no', 'receipt_no'])
            ->map(fn ($k) => is_string($request->input($k)) ? $request->input($k) : null)->filter()->first());
        $desc = $verb.($label !== '' ? ' “'.mb_substr($label, 0, 80).'”' : ($id ? " record #{$id}" : ($tail === '' ? ' a record' : '')));
        if ($first === 'change-password') {
            $desc = 'Changed own password';
        }

        ActivityLog::record($user, $action, $desc, $request, ['module' => mb_substr($module, 0, 60), 'subject_id' => $id]);
    }

    /** Last seen + active time today. Written at most once a minute per user. */
    private function presence(User $user): void
    {
        if (! Cache::add("presence:{$user->id}", 1, 60)) {
            return;
        }
        $now = now();
        $today = $now->toDateString();
        $row = DB::table('user_activity_days')->where('user_id', $user->id)->where('date', $today)->first();
        if ($row) {
            $gap = $now->getTimestamp() - strtotime($row->last_seen_at);
            DB::table('user_activity_days')->where('id', $row->id)->update([
                'last_seen_at' => $now,
                'active_seconds' => $row->active_seconds + ($gap > 0 && $gap <= 300 ? $gap : 60),
            ]);
        } else {
            DB::table('user_activity_days')->insert([
                'school_id' => Tenant::id() ?? $user->school_id, 'user_id' => $user->id, 'date' => $today,
                'first_seen_at' => $now, 'last_seen_at' => $now, 'active_seconds' => 60,
            ]);
        }
        DB::table('users')->where('id', $user->id)->update(['last_seen_at' => $now]);
    }
}
