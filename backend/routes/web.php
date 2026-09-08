<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;

Route::get('/{any}', function (Request $request) {
    if ($request->wantsJson() || str_contains($request->header('Accept', ''), 'application/json')) {
        return response()->json([
            'system' => 'School Lesson Plan Management System REST API',
            'status' => 'operational',
            'version' => '1.0.0',
            'timestamp' => now()->toIso8601String(),
        ]);
    }

    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response(file_get_contents($indexPath), 200, [
            'Content-Type' => 'text/html; charset=utf-8',
        ]);
    }

    return response()->json([
        'system' => 'School Lesson Plan Management System REST API',
        'status' => 'operational',
        'version' => '1.0.0',
    ]);
})->where('any', '^(?!api).*$');