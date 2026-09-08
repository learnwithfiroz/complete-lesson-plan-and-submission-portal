<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/{any}', function (Request $request) {
    $indexPath = public_path('index.html');
    if (File::exists($indexPath)) {
        return response()->file($indexPath);
    }

    if (!$request->wantsJson() && !str_contains($request->header('Accept', ''), 'application/json')) {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        return redirect()->away($frontendUrl);
    }

    return response()->json([
        'system' => 'School Lesson Plan Management System REST API',
        'status' => 'operational',
        'version' => '1.0.0',
        'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
        'timestamp' => now()->toIso8601String(),
    ]);
})->where('any', '^(?!api).*$');