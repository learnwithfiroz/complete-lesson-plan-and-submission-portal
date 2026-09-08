<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FormSchema;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FormSchemaController extends Controller
{
    /**
     * List all form schemas (optional filter by form_type)
     */
    public function index(Request $request): JsonResponse
    {
        $query = FormSchema::with('creator:id,name,email');

        if ($request->filled('form_type')) {
            $query->where('form_type', $request->query('form_type'));
        }

        $schemas = $query->orderBy('is_default', 'desc')
                         ->orderBy('updated_at', 'desc')
                         ->get();

        return response()->json([
            'success' => true,
            'message' => 'Form schemas retrieved successfully.',
            'data' => $schemas,
        ]);
    }

    /**
     * Get default schema by form_type (Public / Authenticated)
     */
    public function getDefault(string $formType = 'admission'): JsonResponse
    {
        $schema = FormSchema::where('form_type', $formType)
                            ->where('is_default', true)
                            ->first();

        if (!$schema) {
            $schema = FormSchema::where('form_type', $formType)->first();
        }

        if (!$schema) {
            return response()->json([
                'success' => false,
                'message' => "No schema found for form type '{$formType}'.",
                'data' => null,
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Default form schema retrieved.',
            'data' => $schema,
        ]);
    }

    /**
     * Show a specific schema by ID
     */
    public function show(FormSchema $formSchema): JsonResponse
    {
        $formSchema->load('creator:id,name,email');

        return response()->json([
            'success' => true,
            'data' => $formSchema,
        ]);
    }

    /**
     * Store a new form schema
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'form_type' => 'required|string|in:admission,job,tender',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
            'post_payment_action' => 'nullable|string',
            'layout_style' => 'nullable|string|in:wizard,single_page,tabbed',
            'schema_data' => 'required|array',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            if (!empty($validated['is_default'])) {
                FormSchema::where('form_type', $validated['form_type'])->update(['is_default' => false]);
            }

            $schema = FormSchema::create([
                'form_type' => $validated['form_type'],
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'is_default' => $validated['is_default'] ?? false,
                'post_payment_action' => $validated['post_payment_action'] ?? 'application_voucher',
                'layout_style' => $validated['layout_style'] ?? 'wizard',
                'schema_data' => $validated['schema_data'],
                'created_by' => $request->user()?->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Form schema created successfully.',
                'data' => $schema,
            ], 201);
        });
    }

    /**
     * Update an existing form schema
     */
    public function update(Request $request, FormSchema $formSchema): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_default' => 'boolean',
            'post_payment_action' => 'nullable|string',
            'layout_style' => 'nullable|string|in:wizard,single_page,tabbed',
            'schema_data' => 'sometimes|required|array',
        ]);

        return DB::transaction(function () use ($validated, $formSchema) {
            if (isset($validated['is_default']) && $validated['is_default']) {
                FormSchema::where('form_type', $formSchema->form_type)
                    ->where('id', '!=', $formSchema->id)
                    ->update(['is_default' => false]);
            }

            $formSchema->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Form schema updated successfully.',
                'data' => $formSchema->fresh(),
            ]);
        });
    }

    /**
     * Duplicate an existing form schema
     */
    public function duplicate(FormSchema $formSchema, Request $request): JsonResponse
    {
        $newSchema = $formSchema->replicate();
        $newSchema->title = $formSchema->title . ' (Copy - ' . date('d M Y H:i') . ')';
        $newSchema->is_default = false;
        $newSchema->created_by = $request->user()?->id;
        $newSchema->save();

        return response()->json([
            'success' => true,
            'message' => 'Form schema duplicated successfully.',
            'data' => $newSchema,
        ], 201);
    }

    /**
     * Delete a form schema
     */
    public function destroy(FormSchema $formSchema): JsonResponse
    {
        if ($formSchema->is_default) {
            return response()->json([
                'success' => false,
                'message' => 'Default form schema cannot be deleted. Please set another template as default first.',
            ], 422);
        }

        $formSchema->delete();

        return response()->json([
            'success' => true,
            'message' => 'Form schema deleted successfully.',
        ]);
    }
}
