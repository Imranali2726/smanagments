<?php

namespace App\Providers;

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // unique / exists validation only looks inside the current school.
        $this->app->extend('validation.presence', fn ($verifier, $app) => new \App\Support\TenantPresenceVerifier($app['db']));
    }

    public function boot(): void
    {
        // Safe index length for older MySQL / MariaDB versions.
        Schema::defaultStringLength(191);
    }
}
