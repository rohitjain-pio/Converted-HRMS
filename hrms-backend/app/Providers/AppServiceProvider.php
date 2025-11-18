<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for MySQL string length issue in WAMP
        Schema::defaultStringLength(191);

        // Configure rate limiters
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(3)->by($request->input('email') . '|' . $request->ip())
                ->response(function (Request $request, array $headers) {
                    return response()->json([
                        'status_code' => 429,
                        'message' => 'Too many login attempts. Please try again later.',
                        'data' => null,
                        'is_success' => false,
                    ], 429, $headers);
                });
        });
    }
}
