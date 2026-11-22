<?php

namespace App\Http\Middleware;

use App\Models\School;
use App\Support\Tenant;
use Closure;
use Illuminate\Http\Request;

/**
 * Global: picks the school from the sub-domain (bfs.aasschoolmanager.com).
 * The main domain has no school: it serves the landing page and super admin.
 */
class ResolveTenant
{
    public function handle(Request $request, Closure $next)
    {
        Tenant::set(null);

        if ($sub = Tenant::subdomainFromHost($request->getHost())) {
            $school = School::where('subdomain', $sub)->first();
            if (! $school) {
                return $request->is('api/*') || $request->expectsJson()
                    ? response()->json(['message' => 'No school is registered at this address.'], 404)
                    : response('<h2 style="font-family:sans-serif;text-align:center;margin-top:20vh">No school is registered at this address.</h2>', 404);
            }
            Tenant::set($school);
            $request->attributes->set('tenant_host', true);
        }

        return $next($request);
    }
}
