<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait HasActivityLog
{
    public static function logActivity(string $action, ?string $modelType = null, ?int $modelId = null, ?array $payload = null): void
    {
        try {
            ActivityLog::create([
                'user_id' => auth()->id(),
                'action' => $action,
                'model_type' => $modelType,
                'model_id' => $modelId,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'payload' => $payload ? json_encode($payload) : null,
            ]);
        } catch (\Throwable $e) {
            // Silently ignore logging errors to prevent blocking main transaction
            \Illuminate\Support\Facades\Log::warning('Failed to write activity log: ' . $e->getMessage());
        }
    }
}