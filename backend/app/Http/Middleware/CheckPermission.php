<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\ApiResponseTrait;

class CheckPermission
{
    use ApiResponseTrait;

    public function handle(Request $request, Closure $next, ...$permissions): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated.');
        }

        if (!$user->hasAnyPermission($permissions)) {
            return $this->forbiddenResponse('You do not have the required permission to perform this action.');
        }

        return $next($request);
    }
}