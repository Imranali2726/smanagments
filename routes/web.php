<?php

use Illuminate\Support\Facades\Route;

// Public landing page of AAS School Manager.
// On a school's sub-domain the root opens that school's own website (edited from its admin panel).
Route::get('/', fn () => \App\Support\Tenant::id()
    ? response()->file(public_path('site.html'))
    : \App\Http\Controllers\Api\LandingController::page());

// A school's website on the main domain (local testing): /site?school=<subdomain>
Route::get('/site', fn () => response()->file(public_path('site.html')));

// Parent, student & teacher portal: a static single-page app in public/portal.
Route::get('/portal', fn () => redirect(url('portal/index.html')));

// Admin panel: a static single-page app in public/admin.
Route::get('/admin', fn () => redirect(url('admin/index.html')));
