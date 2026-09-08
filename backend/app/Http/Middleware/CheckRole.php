<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Traits\ApiResponseTrait;

class CheckRole
{
    use ApiResponseTrait;

    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return $this->unauthorizedResponse('Unauthenticated.');
        }

        if (!$user->hasAnyRole($roles)) {
            return $this->forbiddenResponse('You do not have the required role to access this resource.');
        }

        return $next($request);
    }
}