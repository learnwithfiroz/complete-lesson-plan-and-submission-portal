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

        // 2. Auto-create SQLite database file if not present
        $sqlitePath = database_path('database.sqlite');
        if (!File::exists($sqlitePath)) {
            @File::put($sqlitePath, '');
        }
    }
}


