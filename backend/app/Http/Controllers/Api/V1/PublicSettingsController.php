<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicSettingsController extends Controller
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        $publicSettings = Setting::getPublicSettings();

        // Default institutional branding if not configured
        $defaultBranding = [
            'school_name_bn' => 'বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ (বিএসআইএসসি)',
            'school_name_en' => "Baridhara Scholars' International School and College (BSISC)",
            'school_eiin' => '133988',
            'school_code' => '1242',
            'college_code' => '1760',
            'address' => 'DOHS, Baridhara, Dhaka Cantonment, Dhaka',
            'email' => 'info@bsisc.edu.bd',
            'phone' => '+880 1738-911879',
            'default_language' => 'bn',
            'primary_color' => '#0f2e5a',
            'secondary_color' => '#10b981',
            'academic_year' => '2026',
        ];

        $merged = \Illuminate\Support\Facades\Cache::remember('public_school_settings', 3600, function () use ($defaultBranding, $publicSettings) {
            return array_merge($defaultBranding, $publicSettings);
        });

        return response()->json([
            'success' => true,
            'data' => $merged,
        ])->header('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
    }

    public function clientInfo(Request $request): JsonResponse
    {
        $ip = $request->header('CF-Connecting-IP')
            ?: $request->header('X-Forwarded-For')
            ?: $request->header('X-Real-IP')
            ?: $request->ip();

        if (str_contains($ip, ',')) {
            $ip = trim(explode(',', $ip)[0]);
        }

        $now = now()->setTimezone('Asia/Dhaka');

        return response()->json([
            'success' => true,
            'ip' => $ip ?: '127.0.0.1',
            'timezone' => 'Asia/Dhaka',
            'bd_time_iso' => $now->toISOString(),
            'bd_time_formatted' => $now->format('h:i:s A'),
            'bd_date_formatted' => $now->format('d F Y'),
            'timestamp' => $now->timestamp,
        ]);
    }
}