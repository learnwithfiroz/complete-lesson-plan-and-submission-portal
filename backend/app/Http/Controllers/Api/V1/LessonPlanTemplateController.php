<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\LessonPlan;
use App\Models\LessonPlanTemplate;
use App\Services\LessonPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonPlanTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $templates = LessonPlanTemplate::with(['subject', 'department', 'creator'])
            ->where(function ($q) use ($user) {
                $q->where('is_system', true)
                  ->orWhere('created_by', $user->id);
            })
            ->where('is_active', true)
            ->orderBy('is_system', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $templates,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'subject_id' => 'nullable|exists:subjects,id',
            'department_id' => 'nullable|exists:departments,id',
            'template_data' => 'required|array',
        ]);

        $user = $request->user();
        $isSystem = $user->hasRole(['super_admin', 'principal', 'academic_coordinator']) && $request->boolean('is_system', false);

        $template = LessonPlanTemplate::create([
            'title' => $request->title,
            'subject_id' => $request->subject_id,
            'department_id' => $request->department_id,
            'created_by' => $user->id,
            'is_system' => $isSystem,
            'is_active' => true,
            'template_data' => $request->template_data,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Lesson plan template created successfully.',
            'data' => $template,
        ], 201);
    }

    public function show(LessonPlanTemplate $template): JsonResponse
    {
        $template->load(['subject', 'department', 'creator']);
        return response()->json([
            'status' => 'success',
            'data' => $template,
        ]);
    }

    public function destroy(Request $request, LessonPlanTemplate $template): JsonResponse
    {
        $user = $request->user();
        if (!$user->hasRole(['super_admin', 'principal']) && $template->created_by !== $user->id) {
            return response()->json(['message' => 'Unauthorized to delete this template.'], 403);
        }

        $template->delete();
        return response()->json(['message' => 'Template deleted successfully.']);
    }
}