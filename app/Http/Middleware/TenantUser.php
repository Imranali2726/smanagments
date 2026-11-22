<?php

namespace App\Http\Middleware;

use App\Models\School;
use App\Models\User;
use App\Support\Tenant;
use Closure;
use Illuminate\Http\Request;

/**
 * After auth: ties the logged-in user to their school and enforces the
 * school's status, subscription expiry and enabled modules.
 */
class TenantUser
{
    private const ALWAYS_ALLOWED = ['api/me', 'api/logout', 'api/logout-all'];

    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->role === User::SUPER_ADMIN) {
            if (Tenant::id()) {
                return response()->json(['message' => 'The super admin signs in on the main domain.'], 403);
            }
            if (! in_array($request->path(), self::ALWAYS_ALLOWED, true) && ! $request->is('api/platform/*')) {
                return response()->json(['message' => 'Open a school\'s own address to work inside it.'], 403);
            }

            return $next($request);
        }

        $school = Tenant::school();
        if ($school && (int) $user->school_id !== (int) $school->id) {
            return response()->json(['message' => 'This account does not belong to this school.'], 403);
        }
        if (! $school) {
            // Main domain (e.g. local development, mobile app): use the user's own school.
            $school = School::find($user->school_id);
            if (! $school) {
                return response()->json(['message' => 'Your account is not linked to a school.'], 403);
            }
            Tenant::set($school);
        }

        if (! in_array($request->path(), self::ALWAYS_ALLOWED, true)) {
            if ($school->status !== 'active') {
                return response()->json(['message' => 'This school\'s account is suspended. Please contact AAS School Manager.', 'code' => 'school_suspended'], 403);
            }
            if ($school->isExpired()) {
                return response()->json(['message' => 'This school\'s subscription expired on '.$school->expires_at->format('d M Y').'. Please renew to continue.', 'code' => 'school_expired'], 403);
            }
            $module = Tenant::moduleForPath($request->path());
            if ($module && ! $school->moduleEnabled($module)) {
                return response()->json(['message' => 'This module is not enabled for your school.', 'code' => 'module_disabled'], 403);
            }
        }

        return $next($request);
    }
}
