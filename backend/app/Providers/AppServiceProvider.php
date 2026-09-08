<?php

namespace App\Providers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
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
        // 1. Auto-create essential storage & database directories
        $essentialPaths = [
            storage_path('framework/sessions'),
            storage_path('framework/views'),
            storage_path('framework/cache'),
            storage_path('app/public/submissions'),
            storage_path('app/public/avatars'),
            storage_path('app/public/notices'),
            storage_path('logs'),
            database_path(),
        ];
        foreach ($essentialPaths as $path) {
            if (!File::exists($path)) {
                @File::makeDirectory($path, 0777, true, true);
            }
        }

        // 2. Auto-create SQLite database file
        $sqlitePath = database_path('database.sqlite');
        if (!File::exists($sqlitePath)) {
            @File::put($sqlitePath, '');
        }

        // 3. Fallback database connection if MySQL is inaccessible
        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            config(['database.default' => 'sqlite']);
            config(['database.connections.sqlite.database' => $sqlitePath]);
            DB::purge();
        }

        // 4. Auto-bootstrap database tables & seeders on first visit if not yet migrated
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

