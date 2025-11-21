<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Azure Blob Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Azure Blob Storage used for document management
    | Legacy: BlobStorageClient
    |
    */
    'azure' => [
        'storage' => [
            'connection_string' => env('AZURE_STORAGE_CONNECTION_STRING'),
            'url' => env('AZURE_BLOB_STORAGE_URL', 'https://devstoragehrms.blob.core.windows.net'),
            'container' => 'user-documents',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Time Doctor API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for Time Doctor API integration for attendance tracking
    | Legacy: TimeDoctorClient
    |
    */
    'timedoctor' => [
        'base_url' => env('TIMEDOCTOR_BASE_URL', 'https://api2.timedoctor.com/api/1.0/users'),
        'summary_stats_url' => env('TIMEDOCTOR_SUMMARY_STATS_URL', 'https://api2.timedoctor.com/api/1.1/stats/timesheet/summary'),
        'api_token' => env('TIMEDOCTOR_API_TOKEN'),
        'company_id' => env('TIMEDOCTOR_COMPANY_ID', 'YfQJah6-uiOk6nqu'),
    ],

];
