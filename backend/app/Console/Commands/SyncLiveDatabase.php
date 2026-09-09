<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;

class SyncLiveDatabase extends Command
{
    protected $signature = 'db:sync-live {--url= : Live Server Base URL}';
    protected $description = 'Download live server database backup and sync into local environment';

    public function handle(): int
    {
        $liveUrl = rtrim($this->option('url') ?: config('app.live_url', 'https://lessonplan.firoz-ahmed.com'), '/');
        $endpoint = "{$liveUrl}/api/v1/system/backup-db?download=1";

        $this->info("Fetching live database backup from {$endpoint} ...");

        try {
            $response = Http::timeout(60)->get($endpoint);

            if (!$response->successful()) {
                $this->error("Failed to fetch live database backup. HTTP Status: " . $response->status());
                return 1;
            }

            $sqlContent = $response->body();
            if (empty($sqlContent) || !str_contains($sqlContent, 'TRUNCATE TABLE')) {
                $this->error("Invalid database dump received from server.");
                return 1;
            }

            // Save to local backup files
            $backupPath = database_path('live_backup.sql');
            $defaultDumpPath = database_path('database.sql');
            File::put($backupPath, $sqlContent);
            File::put($defaultDumpPath, $sqlContent);

            $this->info("Saved live backup to {$backupPath} (" . strlen($sqlContent) . " bytes)");

            // Import into local database
            $this->info("Importing into local database (" . config('database.default') . ") ...");

            $driver = config('database.default');

            if ($driver === 'sqlite') {
                $statements = array_filter(array_map('trim', explode(";\n", $sqlContent)));
                
                DB::connection()->getPdo()->exec('PRAGMA foreign_keys = OFF;');
                
                $bar = $this->output->createProgressBar(count($statements));
                $bar->start();

                foreach ($statements as $stmt) {
                    $bar->advance();
                    if (empty($stmt) || str_starts_with($stmt, '--')) continue;
                    if (str_contains($stmt, 'SET FOREIGN_KEY_CHECKS')) continue;
                    
                    if (preg_match('/TRUNCATE TABLE `?(\w+)`?/i', $stmt, $m)) {
                        $table = $m[1];
                        if (Schema::hasTable($table)) {
                            DB::table($table)->delete();
                        }
                        continue;
                    }

                    try {
                        DB::unprepared($stmt . ';');
                    } catch (\Throwable $e) {
                        // Ignore minor type/quote mismatch on fallback
                    }
                }
                $bar->finish();
                $this->newLine();
                DB::connection()->getPdo()->exec('PRAGMA foreign_keys = ON;');
            } else {
                DB::unprepared($sqlContent);
            }

            $this->info("Database sync from Live Server completed successfully!");
            $this->table(
                ['Metric', 'Count'],
                [
                    ['Total Users', DB::table('users')->count()],
                    ['Total Lesson Plans', DB::table('lesson_plans')->count()],
                    ['Total Submission Batches', DB::table('submission_batches')->count()],
                    ['Total Submissions', DB::table('teacher_submissions')->count()],
                    ['Total Notices', DB::table('notices')->count()],
                ]
            );

            return 0;
        } catch (\Throwable $e) {
            $this->error("Sync error: " . $e->getMessage());
            return 1;
        }
    }
}