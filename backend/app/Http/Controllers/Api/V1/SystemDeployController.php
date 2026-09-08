<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SystemDeployController extends Controller
{
    /**
     * Get system environment, database status, and readiness overview
     */
    public function systemStatus(Request $request): JsonResponse
    {
        $dbConnected = false;
        $dbTablesCount = 0;
        $usersCount = 0;
        $dbError = null;

        try {
            DB::connection()->getPdo();
            $dbConnected = true;

            if (Schema::hasTable('users')) {
                $usersCount = User::count();
            }

            if (config('database.default') === 'sqlite') {
                $tables = DB::select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
                $dbTablesCount = count($tables);
            } else {
                $tables = DB::select('SHOW TABLES');
                $dbTablesCount = count($tables);
            }
        } catch (\Throwable $e) {
            $dbError = $e->getMessage();
        }

        $storageWritable = is_writable(storage_path());
        $storageLinked = File::exists(public_path('storage'));

        return response()->json([
            'success' => true,
            'system' => 'School Lesson Plan Management System',
            'version' => '1.0.0',
            'php_version' => PHP_VERSION,
            'environment' => app()->environment(),
            'app_url' => config('app.url'),
            'app_key_set' => !empty(config('app.key')),
            'database' => [
                'driver' => config('database.default'),
                'connected' => $dbConnected,
                'tables_count' => $dbTablesCount,
                'users_count' => $usersCount,
                'error' => $dbError,
            ],
            'storage' => [
                'writable' => $storageWritable,
                'linked' => $storageLinked,
            ],
            'needs_initialization' => !$dbConnected || $dbTablesCount === 0 || $usersCount === 0,
        ]);
    }

    /**
     * Auto Setup / 1-Click Database Initializer and Seeder
     */
    public function autoSetup(Request $request): JsonResponse
    {
        $action = $request->input('action', 'init'); // init, fresh_seed, migrate_only, sqlite_fallback, storage_link

        try {
            $outputs = [];

            // If action is sqlite_fallback, force sqlite database file creation
            if ($action === 'sqlite_fallback' || config('database.default') === 'sqlite') {
                $dbPath = config('database.connections.sqlite.database');
                if (!empty($dbPath) && $dbPath !== ':memory:') {
                    File::ensureDirectoryExists(dirname($dbPath));
                    if (!File::exists($dbPath)) {
                        File::put($dbPath, '');
                        $outputs[] = 'Created SQLite database file at ' . $dbPath;
                    }
                }
            }

            // 1. Run migrations
            if ($action === 'fresh_seed') {
                Artisan::call('migrate:fresh', ['--force' => true, '--seed' => true]);
                $outputs[] = trim(Artisan::output());
            } elseif ($action === 'migrate_only') {
                Artisan::call('migrate', ['--force' => true]);
                $outputs[] = trim(Artisan::output());
            } elseif ($action === 'seed_only' || $action === 'seed_users' || $action === 'seed_staff') {
                Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\DepartmentSeeder']);
                Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\UserSeeder']);
                Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\StaffAndTeacherSeeder']);
                $outputs[] = trim(Artisan::output());
            } else {
                // Default: migrate and ensure seeders run
                Artisan::call('migrate', ['--force' => true]);
                $outputs[] = trim(Artisan::output());

                Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\DepartmentSeeder']);
                Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\UserSeeder']);
                Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\StaffAndTeacherSeeder']);
                $outputs[] = trim(Artisan::output());
            }

            // 2. Ensure storage link safely (without throwing if exec/symlink is disabled on cPanel)
            try {
                if (!File::exists(public_path('storage'))) {
                    @Artisan::call('storage:link');
                    $outputs[] = trim(Artisan::output());
                }
            } catch (\Throwable $e) {
                $outputs[] = 'Storage link skipped: ' . $e->getMessage();
            }

            // 3. Clear and optimize caches safely
            try {
                Artisan::call('optimize:clear');
                $outputs[] = trim(Artisan::output());
            } catch (\Throwable $e) {
                $outputs[] = 'Optimize clear skipped: ' . $e->getMessage();
            }

            $usersCount = Schema::hasTable('users') ? User::count() : 0;

            return response()->json([
                'success' => true,
                'message' => 'Database successfully created, migrated, and initialized!',
                'users_created' => $usersCount,
                'log' => $outputs,
                'default_credentials' => [
                    'admin' => ['email' => 'admin@bsisc.edu.bd', 'password' => '01516174063'],
                    'principal' => ['phone' => '01711000002', 'password' => '01711000002'],
                    'vp_masuma' => ['phone' => '01780017602', 'password' => '01780017602'],
                    'teacher_aziza' => ['phone' => '01720041189', 'password' => '01720041189'],
                    'teacher_zebin' => ['phone' => '01670250173', 'password' => '01670250173'],
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('AutoSetup Failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Setup encountered an error: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Run database migrations and cache optimization securely after deployment
     */
    public function autoMigrate(Request $request): JsonResponse
    {
        $deployKey = $request->query('key') ?: $request->header('X-Deploy-Key');
        $expectedKey = env('DEPLOY_SECRET_KEY', env('APP_KEY'));

        if (empty($deployKey) || $deployKey !== $expectedKey) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Invalid or missing deploy key.',
            ], 403);
        }

        try {
            // 1. Run migrations safely
            Artisan::call('migrate', ['--force' => true]);
            $migrateOutput = Artisan::output();

            // 2. Safely sync/seed departments and users
            Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\DepartmentSeeder']);
            Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\UserSeeder']);
            Artisan::call('db:seed', ['--force' => true, '--class' => 'Database\Seeders\StaffAndTeacherSeeder']);
            $seedOutput = Artisan::output();

            // 3. Clear and optimize caches
            Artisan::call('optimize:clear');
            $clearOutput = Artisan::output();

            Log::info('Automated cPanel Database Migration & Optimize executed successfully.', [
                'ip' => $request->ip(),
                'migrate_output' => $migrateOutput,
                'seed_output' => $seedOutput,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Database migrations and optimization completed successfully!',
                'migrate_output' => trim($migrateOutput),
                'seed_output' => trim($seedOutput),
                'clear_output' => trim($clearOutput),
            ]);
        } catch (\Exception $e) {
            Log::error('Automated Migration Failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Database migration failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}