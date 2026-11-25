<?php

use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\GroupOwner;
use App\Http\Middleware\ResolveTenant;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Middleware\SuperAdmin;
use App\Http\Middleware\TenantUser;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Multi-school: find the school from the sub-domain on every request.
        $middleware->prepend(ResolveTenant::class);
        // The site runs behind Cloudflare: take the visitor's real IP and https scheme from
        // Cloudflare's forwarded headers (only when the request really comes from Cloudflare).
        $middleware->trustProxies(at: [
            '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
            '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17',
            '162.158.0.0/15', '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
            '2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
            '2a06:98c0::/29', '2c0f:f248::/32',
        ]);
        $middleware->api(prepend: [ForceJsonResponse::class]);
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'tenant.user' => TenantUser::class,
            'superadmin' => SuperAdmin::class,
            'owner' => GroupOwner::class,
        ]);
        // API only: never redirect guests to a login page.
        $middleware->redirectGuestsTo(fn (Request $request) => $request->is('api/*') ? null : '/');
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request, Throwable $e) => $request->is('api/*') || $request->expectsJson()
        );

        $exceptions->render(function (NotFoundHttpException $e, Request $request) {
            if ($request->is('api/*') && $e->getPrevious() instanceof ModelNotFoundException) {
                return response()->json(['message' => 'Record not found.'], 404);
            }
        });
    })->create();
