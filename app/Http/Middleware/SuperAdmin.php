<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;

class SuperAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if ($request->user()?->role !== User::SUPER_ADMIN) {
            return response()->json(['message' => 'Only the platform super admin can do this.'], 403);
        }

        return $next($request);
    }
}
