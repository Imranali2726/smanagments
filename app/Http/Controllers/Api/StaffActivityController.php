<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use App\Support\Tenant;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/** School admin: staff tracking (activity log, online status and a staff performance report). */
class StaffActivityController extends Controller
{
    public const STAFF_ROLES = ['admin', 'teacher', 'accountant', 'librarian', 'receptionist'];

    private const ONLINE_SECONDS = 300;

    public function logs(Request $request): JsonResponse
    {
        $q = $request->validate([
            'user_id' => 'nullable|integer', 'action' => 'nullable|in:login,login_failed,logout,create,update,delete',
            'search' => 'nullable|string|max:100', 'from' => 'nullable|date', 'to' => 'nullable|date', 'per_page' => 'nullable|integer|min:10|max:100',
        ]);
        $logs = ActivityLog::query()->with('user:id,name,role')
            ->when($q['user_id'] ?? null, fn ($b, $v) => $b->where('user_id', $v))
            ->when($q['action'] ?? null, fn ($b, $v) => $b->where('action', $v))
            ->when($q['search'] ?? null, fn ($b, $v) => $b->where(fn ($w) => $w->where('description', 'like', "%{$v}%")->orWhere('module', 'like', "%{$v}%")))
            ->when($q['from'] ?? null, fn ($b, $v) => $b->where('created_at', '>=', Carbon::parse($v)->startOfDay()))
            ->when($q['to'] ?? null, fn ($b, $v) => $b->where('created_at', '<=', Carbon::parse($v)->endOfDay()))
            ->orderByDesc('id')
            ->paginate($q['per_page'] ?? 30);

        $logs->getCollection()->transform(fn ($l) => [
            'id' => $l->id, 'at' => $l->created_at?->toIso8601String(), 'action' => $l->action, 'module' => $l->module,
            'description' => $l->description, 'ip' => $l->ip, 'device' => $l->device,
            'user' => $l->user ? ['id' => $l->user->id, 'name' => $l->user->name, 'role' => $l->actor_role ?: $l->user->role] : ['id' => null, 'name' => 'Deleted user', 'role' => $l->actor_role],
        ]);

        return response()->json($logs);
    }

    /** Everyone on the staff with online status, last login and today's active time. */
    public function users(Request $request): JsonResponse
    {
        $roles = $request->boolean('include_parents') ? array_merge(self::STAFF_ROLES, ['parent', 'student']) : self::STAFF_ROLES;
        $today = now()->toDateString();
        $users = User::query()->whereIn('role', $roles)->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'is_active', 'last_login_at', 'last_seen_at']);
        $ids = $users->pluck('id');
        $todayRows = DB::table('user_activity_days')->whereIn('user_id', $ids)->where('date', $today)->get()->keyBy('user_id');
        $week = DB::table('user_activity_days')->whereIn('user_id', $ids)->where('date', '>=', now()->subDays(6)->toDateString())
            ->groupBy('user_id')->select('user_id', DB::raw('SUM(active_seconds) s'), DB::raw('COUNT(*) d'))->get()->keyBy('user_id');
        $lastLogin = ActivityLog::query()->whereIn('user_id', $ids)->where('action', 'login')
            ->whereIn('id', ActivityLog::query()->where('action', 'login')->whereIn('user_id', $ids)->groupBy('user_id')->selectRaw('MAX(id)'))
            ->get(['user_id', 'ip', 'device'])->keyBy('user_id');
        $failed = ActivityLog::query()->whereIn('user_id', $ids)->where('action', 'login_failed')->where('created_at', '>=', now()->subDay())
            ->groupBy('user_id')->selectRaw('user_id, COUNT(*) c')->pluck('c', 'user_id');

        $data = $users->map(function ($u) use ($todayRows, $week, $lastLogin, $failed) {
            $seen = $u->last_seen_at ? Carbon::parse($u->last_seen_at) : null;

            return [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role, 'is_active' => (bool) $u->is_active,
                'online' => $seen && $seen->diffInSeconds(now()) <= self::ONLINE_SECONDS,
                'last_seen_at' => $seen?->toIso8601String(),
                'last_login_at' => $u->last_login_at ? Carbon::parse($u->last_login_at)->toIso8601String() : null,
                'last_login_ip' => $lastLogin[$u->id]->ip ?? null,
                'last_login_device' => $lastLogin[$u->id]->device ?? null,
                'today_seconds' => (int) ($todayRows[$u->id]->active_seconds ?? 0),
                'today_first_seen' => isset($todayRows[$u->id]) ? Carbon::parse($todayRows[$u->id]->first_seen_at)->toIso8601String() : null,
                'week_seconds' => (int) ($week[$u->id]->s ?? 0),
                'week_days' => (int) ($week[$u->id]->d ?? 0),
                'failed_logins_24h' => (int) ($failed[$u->id] ?? 0),
            ];
        })->sortByDesc(fn ($r) => ($r['online'] ? '1' : '0').($r['last_seen_at'] ?? ''))->values();

        return response()->json([
            'data' => $data,
            'summary' => [
                'online' => $data->where('online', true)->count(),
                'active_today' => $data->where('today_seconds', '>', 0)->count(),
                'total' => $data->count(),
                'never_logged_in' => $data->whereNull('last_login_at')->count(),
            ],
        ]);
    }

    /** Per staff member for a date range: days active, time, logins, and the work they entered. */
    public function performance(Request $request): JsonResponse
    {
        $q = $request->validate(['from' => 'nullable|date', 'to' => 'nullable|date|after_or_equal:from']);
        $from = Carbon::parse($q['from'] ?? now()->startOfMonth())->startOfDay();
        $to = Carbon::parse($q['to'] ?? now())->endOfDay();
        $sid = Tenant::id();
        $d1 = $from->toDateString();
        $d2 = $to->toDateString();

        $users = User::query()->whereIn('role', self::STAFF_ROLES)->orderBy('name')->get(['id', 'name', 'role']);
        $ids = $users->pluck('id');

        $days = DB::table('user_activity_days')->whereIn('user_id', $ids)->whereBetween('date', [$d1, $d2])
            ->groupBy('user_id')->select('user_id', DB::raw('COUNT(*) d'), DB::raw('SUM(active_seconds) s'))->get()->keyBy('user_id');
        $acts = ActivityLog::query()->whereIn('user_id', $ids)->whereBetween('created_at', [$from, $to])
            ->groupBy('user_id', 'action')->selectRaw('user_id, action, COUNT(*) c')->get()->groupBy('user_id');

        // Attendance sheets (one per section per day) marked by each user, and how many were marked late (on a later day).
        $att = DB::table('attendances')->where('school_id', $sid)->whereBetween('date', [$d1, $d2])->whereIn('marked_by', $ids)
            ->groupBy('marked_by', 'section_id', 'date')
            ->selectRaw('marked_by, section_id, date, MIN(DATE(created_at)) made')->get()->groupBy('marked_by');
        $marks = DB::table('marks')->where('school_id', $sid)->whereBetween('created_at', [$from, $to])->whereIn('entered_by', $ids)
            ->groupBy('entered_by')->selectRaw('entered_by, COUNT(*) c')->pluck('c', 'entered_by');
        $fees = DB::table('fee_payments')->where('school_id', $sid)->whereBetween('paid_on', [$d1, $d2])->whereIn('received_by', $ids)
            ->groupBy('received_by')->selectRaw('received_by, COUNT(*) c, SUM(amount) a')->get()->keyBy('received_by');

        // Teachers: homework given, and attendance of the sections where they are class teacher.
        $teachers = DB::table('teachers')->where('school_id', $sid)->whereIn('user_id', $ids)->pluck('id', 'user_id');
        $homework = DB::table('homework')->where('school_id', $sid)->whereBetween('assigned_date', [$d1, $d2])->whereIn('teacher_id', $teachers->values())
            ->groupBy('teacher_id')->selectRaw('teacher_id, COUNT(*) c')->pluck('c', 'teacher_id');
        $classSections = DB::table('sections')->where('sections.school_id', $sid)->whereIn('class_teacher_id', $teachers->values())
            ->join('school_classes', 'school_classes.id', '=', 'sections.school_class_id')
            ->get(['sections.id', 'sections.class_teacher_id', DB::raw("CONCAT(school_classes.name, ' - ', sections.name) as label")])->groupBy('class_teacher_id');
        // A "school day" is a day on which attendance was marked anywhere in the school.
        $schoolDays = DB::table('attendances')->where('school_id', $sid)->whereBetween('date', [$d1, $d2])->distinct()->pluck('date')->map(fn ($d) => substr((string) $d, 0, 10));
        $sectionDays = DB::table('attendances')->where('school_id', $sid)->whereBetween('date', [$d1, $d2])
            ->groupBy('section_id', 'date')->selectRaw('section_id, date')->get()
            ->groupBy('section_id')->map(fn ($g) => $g->pluck('date')->map(fn ($d) => substr((string) $d, 0, 10))->all());

        $rows = $users->map(function ($u) use ($days, $acts, $att, $marks, $fees, $teachers, $homework, $classSections, $schoolDays, $sectionDays) {
            $a = collect($acts[$u->id] ?? [])->pluck('c', 'action');
            $sheets = collect($att[$u->id] ?? []);
            $tid = $teachers[$u->id] ?? null;
            $own = $tid ? collect($classSections[$tid] ?? []) : collect();
            $expected = $own->count() * $schoolDays->count();
            $done = $own->sum(fn ($s) => count(array_intersect($sectionDays[$s->id] ?? [], $schoolDays->all())));

            return [
                'id' => $u->id, 'name' => $u->name, 'role' => $u->role,
                'days_active' => (int) ($days[$u->id]->d ?? 0),
                'active_seconds' => (int) ($days[$u->id]->s ?? 0),
                'logins' => (int) ($a['login'] ?? 0),
                'failed_logins' => (int) ($a['login_failed'] ?? 0),
                'changes' => (int) (($a['create'] ?? 0) + ($a['update'] ?? 0) + ($a['delete'] ?? 0)),
                'deletes' => (int) ($a['delete'] ?? 0),
                'attendance_sheets' => $sheets->count(),
                'attendance_late' => $sheets->filter(fn ($s) => $s->made > substr((string) $s->date, 0, 10))->count(),
                'marks_entered' => (int) ($marks[$u->id] ?? 0),
                'homework' => (int) ($tid ? ($homework[$tid] ?? 0) : 0),
                'fee_receipts' => (int) ($fees[$u->id]->c ?? 0),
                'fee_amount' => (float) ($fees[$u->id]->a ?? 0),
                'class_sections' => $own->pluck('label')->values(),
                'class_attendance' => $own->isNotEmpty() ? ['done' => $done, 'expected' => $expected] : null,
            ];
        });

        return response()->json([
            'from' => $d1, 'to' => $d2, 'school_days' => $schoolDays->count(),
            'data' => $rows->values(),
        ]);
    }
}
