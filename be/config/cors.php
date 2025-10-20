<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['*'], // Applies to all paths (can be limited to specific routes if needed)

    'allowed_methods' => [], // No methods allowed

    'allowed_origins' => [], // No origins allowed

    'allowed_origins_patterns' => [], // No patterns allowed

    'allowed_headers' => [], // No headers allowed

    'exposed_headers' => [], // No headers to expose

    'max_age' => 0, // No caching of preflight response

    'supports_credentials' => false, // Don't support credentials

];
