<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api([
            \Illuminate\Http\Middleware\HandleCors::class,
        ]);
        
        $middleware->alias([
            'permission' => \App\Http\Middleware\CheckPermission::class,
            'api.key' => \App\Http\Middleware\ValidateApiKey::class,
            'build.version' => \App\Http\Middleware\ValidateBuildVersion::class,
        ]);
        
        // Configure stateless API authentication - no redirects
        $middleware->redirectGuestsTo(fn () => response()->json([
            'success' => false,
            'message' => 'Unauthenticated.'
        ], 401));
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
