<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

trait ApiResponseTrait
{
    public function successResponse(mixed $data = null, string $message = 'Operation completed successfully.', int $code = Response::HTTP_OK, array $meta = []): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data ?? (object)[],
        ];

        if (!empty($meta)) {
            $response['meta'] = $meta;
        }

        return response()->json($response, $code);
    }

    public function errorResponse(string $message = 'An error occurred.', int $code = Response::HTTP_BAD_REQUEST, array $errors = []): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    public function unauthorizedResponse(string $message = 'Unauthenticated.'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_UNAUTHORIZED);
    }

    public function forbiddenResponse(string $message = 'You do not have permission to perform this action.'): JsonResponse
    {
        return $this->errorResponse($message, Response::HTTP_FORBIDDEN);
    }

    public function paginatedResponse(mixed $paginated, string $message = 'Data retrieved successfully.', int $code = Response::HTTP_OK, array $extraMeta = []): JsonResponse
    {
        $meta = [
            'current_page' => $paginated->currentPage(),
            'last_page' => $paginated->lastPage(),
            'per_page' => $paginated->perPage(),
            'total' => $paginated->total(),
            'from' => $paginated->firstItem(),
            'to' => $paginated->lastItem(),
        ];

        if (!empty($extraMeta)) {
            $meta = array_merge($meta, $extraMeta);
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginated->items(),
            'meta' => $meta,
        ], $code);
    }
}