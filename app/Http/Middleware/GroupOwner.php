<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

/** Only the owner of a school group (multi-campus). */
class GroupOwner
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->attributes->get('real_role', $request->user()?->role) !== User::OWNER) {
            return response()->json(['message' => 'Only the owner of a school group can do this.'], 403);
        }

        return $next($request);
    }
}
