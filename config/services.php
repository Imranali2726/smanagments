<?php

return [
    'sms' => [
        'driver' => env('SMS_DRIVER', 'log'),   // log | http
        'url' => env('SMS_API_URL'),
        'api_key' => env('SMS_API_KEY'),
        'sender' => env('SMS_SENDER_ID', 'SCHOOL'),
    ],

    'whatsapp' => [
        'driver' => env('WHATSAPP_DRIVER', 'log'),   // log | cloud
        'token' => env('WHATSAPP_TOKEN'),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'template' => env('WHATSAPP_TEMPLATE'),     // optional approved template name
        'language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'en'),
        'version' => env('WHATSAPP_API_VERSION', 'v21.0'),
    ],
];
