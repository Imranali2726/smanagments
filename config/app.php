<?php

// Only the values that differ from Laravel's defaults. Laravel merges the rest automatically.
return [
    'name' => env('APP_NAME', 'AAS School Manager'),
    'timezone' => env('APP_TIMEZONE', 'Asia/Karachi'),

    // Main domain. Schools open at <subdomain>.<domain>, e.g. bfs.localhost or bfs.aasschoolmanager.com
    'domain' => env('APP_DOMAIN', 'localhost'),
];
