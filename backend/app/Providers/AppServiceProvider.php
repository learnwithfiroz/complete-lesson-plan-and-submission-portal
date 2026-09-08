<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

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
        // 1. Auto-create SQLite database file if default driver is sqlite and file does not exist
        if (config('database.default') === 'sqlite') {
            $dbPath = config('database.connections.sqlite.database');
            if (!empty($dbPath) && $dbPath !== ':memory:' && !File::exists($dbPath)) {
                File::ensureDirectoryExists(dirname($dbPath));
                File::put($dbPath, '');
            }
        }

        // 2. Auto-bootstrap database tables & seeders on first visit if not yet migrated
        try {
            if (!Schema::hasTable('users') || !Schema::hasTable('roles')) {
                Artisan::call('migrate', ['--force' => true]);
                Artisan::call('db:seed', ['--force' => true]);
            }
        } catch (\Throwable $e) {
            Log::warning('Auto database bootstrap skipped or failed: ' . $e->getMessage());
        }
    }
}

