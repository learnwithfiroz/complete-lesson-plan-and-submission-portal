<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

class SystemDeployController extends Controller
{
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

            // 2. Clear and optimize caches
            Artisan::call('optimize:clear');
            $clearOutput = Artisan::output();

            Log::info('Automated cPanel Database Migration & Optimize executed successfully.', [
                'ip' => $request->ip(),
                'migrate_output' => $migrateOutput,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Database migrations and optimization completed successfully!',
                'migrate_output' => trim($migrateOutput),
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