<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FormSchema;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FormSchemaController extends Controller
{
    /**
     * Display a listing of form schemas.
     */
    public function index(Request $request): JsonResponse
    {
        $query = FormSchema::with('creator:id,name,email')
            ->withCount('submissions');

        if ($request->filled('form_type') && $request->form_type !== 'all') {
            $query->where('form_type', $request->form_type);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        $schemas = $query->orderByDesc('is_default')
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $schemas,
        ]);
    }

    /**
     * Get default schema for a specific form type.
     */
    public function getDefault(string $formType = 'admission'): JsonResponse
    {
        $schema = FormSchema::where('form_type', $formType)
            ->where('is_default', true)
            ->first();

        if (!$schema) {
            $schema = FormSchema::where('form_type', $formType)
                ->latest()
                ->first();
        }

        if (!$schema) {
            return response()->json([
                'success' => false,
                'message' => 'No schema found for form type: ' . $formType,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $schema,
        ]);
    }

    /**
     * Store a newly created form schema.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_type' => 'required|string|max:50',
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'is_default' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'post_payment_action' => 'nullable|string',
            'layout_style' => 'nullable|string|in:wizard,single_page,tabbed',
            'deadline' => 'nullable|date',
            'schema_data' => 'required|array',
        ]);

        $baseSlug = !empty($validated['slug']) ? Str::slug($validated['slug']) : (Str::slug($validated['title']) ?: $validated['form_type']);
        $slug = $baseSlug;
        $count = 1;
        while (FormSchema::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-" . ($count++);
        }

        if (!empty($validated['is_default']) && $validated['is_default']) {
            FormSchema::where('form_type', $validated['form_type'])->update(['is_default' => false]);
        }

        $schema = FormSchema::create([
            'form_type' => $validated['form_type'],
            'title' => $validated['title'],
            'slug' => $slug,
            'description' => $validated['description'] ?? null,
            'instructions' => $validated['instructions'] ?? null,
            'is_default' => $validated['is_default'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
            'post_payment_action' => $validated['post_payment_action'] ?? 'application_voucher',
            'layout_style' => $validated['layout_style'] ?? 'wizard',
            'deadline' => !empty($validated['deadline']) ? $validated['deadline'] : null,
            'schema_data' => $validated['schema_data'],
            'created_by' => $request->user()?->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Form schema saved successfully. Public link is active!',
            'data' => $schema,
            'share_url' => url('/forms/' . $schema->slug),
        ], 201);
    }

    /**
     * Display the specified form schema.
     */
    public function show(FormSchema $formSchema): JsonResponse
    {
        $formSchema->load('creator:id,name,email');
        $formSchema->loadCount('submissions');

        return response()->json([
            'success' => true,
            'data' => $formSchema,
        ]);
    }

    /**
     * Update the specified form schema.
     */
    public function update(Request $request, FormSchema $formSchema): JsonResponse
    {
        $validated = $request->validate([
            'form_type' => 'sometimes|required|string|max:50',
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'instructions' => 'nullable|string',
            'is_default' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'post_payment_action' => 'nullable|string',
            'layout_style' => 'nullable|string|in:wizard,single_page,tabbed',
            'deadline' => 'nullable|date',
            'schema_data' => 'sometimes|required|array',
        ]);

        if (!empty($validated['is_default']) && $validated['is_default']) {
            FormSchema::where('form_type', $formSchema->form_type)
                ->where('id', '!=', $formSchema->id)
                ->update(['is_default' => false]);
        }

        if (!empty($validated['slug']) && $validated['slug'] !== $formSchema->slug) {
            $baseSlug = Str::slug($validated['slug']);
            $slug = $baseSlug;
            $count = 1;
            while (FormSchema::where('slug', $slug)->where('id', '!=', $formSchema->id)->exists()) {
                $slug = "{$baseSlug}-" . ($count++);
            }
            $formSchema->slug = $slug;
        }

        $fields = [
            'form_type', 'title', 'description', 'instructions', 
            'is_default', 'is_active', 'post_payment_action', 'layout_style', 
            'deadline', 'schema_data'
        ];

        foreach ($fields as $f) {
            if ($request->has($f)) {
                $formSchema->{$f} = $request->get($f);
            }
        }

        $formSchema->save();

        return response()->json([
            'success' => true,
            'message' => 'Form schema updated successfully.',
            'data' => $formSchema,
            'share_url' => url('/forms/' . $formSchema->slug),
        ]);
    }

    /**
     * Duplicate an existing schema.
     */
    public function duplicate(FormSchema $formSchema): JsonResponse
    {
        $baseSlug = $formSchema->slug ? "{$formSchema->slug}-copy" : Str::slug($formSchema->title . ' Copy');
        $slug = $baseSlug;
        $count = 1;
        while (FormSchema::where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-" . ($count++);
        }

        $newSchema = $formSchema->replicate();
        $newSchema->title = $formSchema->title . ' (Copy)';
        $newSchema->slug = $slug;
        $newSchema->is_default = false;
        $newSchema->submission_count = 0;
        $newSchema->created_by = auth()->id();
        $newSchema->save();

        return response()->json([
            'success' => true,
            'message' => 'Form schema duplicated successfully.',
            'data' => $newSchema,
        ], 201);
    }

    /**
     * Remove the specified form schema.
     */
    public function destroy(FormSchema $formSchema): JsonResponse
    {
        $formSchema->delete();

        return response()->json([
            'success' => true,
            'message' => 'Form schema deleted successfully.',
        ]);
    }

    /**
     * List all candidate submissions for a specific form schema (Admin)
     */
    public function submissions(Request $request, FormSchema $formSchema): JsonResponse
    {
        $query = FormSubmission::where('form_schema_id', $formSchema->id);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('applicant_name', 'like', "%{$search}%")
                  ->orWhere('tracking_number', 'like', "%{$search}%")
                  ->orWhere('applicant_phone', 'like', "%{$search}%")
                  ->orWhere('applicant_email', 'like', "%{$search}%");
            });
        }

        $submissions = $query->orderByDesc('created_at')
            ->paginate($request->get('per_page', 25));

        return response()->json([
            'success' => true,
            'schema' => [
                'id' => $formSchema->id,
                'title' => $formSchema->title,
                'form_type' => $formSchema->form_type,
                'slug' => $formSchema->slug,
                'submission_count' => $formSchema->submission_count,
            ],
            'data' => $submissions->items(),
            'meta' => [
                'current_page' => $submissions->currentPage(),
                'last_page' => $submissions->lastPage(),
                'per_page' => $submissions->perPage(),
                'total' => $submissions->total(),
            ],
        ]);
    }

    /**
     * Update candidate submission status (Approve/Reject/Admit)
     */
    public function updateSubmissionStatus(Request $request, FormSubmission $submission): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,reviewed,shortlisted,approved,rejected,admitted',
            'admin_notes' => 'nullable|string',
        ]);

        $submission->status = $validated['status'];
        if ($request->has('admin_notes')) {
            $submission->admin_notes = $validated['admin_notes'];
        }
        $submission->save();

        return response()->json([
            'success' => true,
            'message' => 'আবেদনটির স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে। (Status updated)',
            'data' => $submission,
        ]);
    }
}