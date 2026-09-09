<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\FormSchema;
use App\Models\FormSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PublicFormController extends Controller
{
    /**
     * Get public form schema by slug, id, or form_type default
     */
    public function show(string $slugOrId): JsonResponse
    {
        $schema = null;

        if (is_numeric($slugOrId)) {
            $schema = FormSchema::find($slugOrId);
        }

        if (!$schema) {
            $schema = FormSchema::where('slug', $slugOrId)->first();
        }

        if (!$schema && in_array(strtolower($slugOrId), ['admission', 'job', 'tender', 'custom'])) {
            $schema = FormSchema::where('form_type', strtolower($slugOrId))
                ->where('is_default', true)
                ->first() ?: FormSchema::where('form_type', strtolower($slugOrId))->latest()->first();
        }

        if (!$schema) {
            return response()->json([
                'success' => false,
                'message' => 'অনলাইন আবেদন ফরমটি পাওয়া যায়নি বা মেয়াদোত্তীর্ণ হয়েছে। (Form not found)',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $schema->id,
                'slug' => $schema->slug,
                'title' => $schema->title,
                'form_type' => $schema->form_type,
                'description' => $schema->description,
                'instructions' => $schema->instructions,
                'is_active' => (bool)$schema->is_active,
                'layout_style' => $schema->layout_style ?: 'wizard',
                'post_payment_action' => $schema->post_payment_action ?: 'application_voucher',
                'deadline' => $schema->deadline?->toISOString(),
                'submission_count' => $schema->submission_count,
                'schema_data' => $schema->schema_data,
                'share_url' => url('/forms/' . $schema->slug),
            ],
        ]);
    }

    /**
     * Submit candidate application form
     */
    public function submit(Request $request, string $slugOrId): JsonResponse
    {
        $schema = null;
        if (is_numeric($slugOrId)) {
            $schema = FormSchema::find($slugOrId);
        }
        if (!$schema) {
            $schema = FormSchema::where('slug', $slugOrId)->first();
        }
        if (!$schema && in_array(strtolower($slugOrId), ['admission', 'job', 'tender'])) {
            $schema = FormSchema::where('form_type', strtolower($slugOrId))->where('is_default', true)->first();
        }

        if (!$schema) {
            return response()->json([
                'success' => false,
                'message' => 'আবেদন ফরমটি খুঁজে পাওয়া যায়নি। (Form not found)',
            ], 404);
        }

        if (!$schema->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'এই ফরমটিতে বর্তমানে নতুন আবেদন গ্রহণ বন্ধ আছে। (Form responses closed)',
            ], 400);
        }

        if ($schema->deadline && now()->isAfter($schema->deadline)) {
            return response()->json([
                'success' => false,
                'message' => 'আবেদনের নির্ধারিত সময়সীমা উত্তীর্ণ হয়েছে। (Application deadline passed)',
            ], 400);
        }

        // Get submission form data
        $formData = $request->input('data', []);
        if (is_string($formData)) {
            $formData = json_decode($formData, true) ?: [];
        }

        // If direct post with regular inputs
        if (empty($formData)) {
            $formData = $request->except(['_token', 'attachment_files']);
        }

        // Extract applicant core details from common field keys
        $name = $formData['applicant_full_name'] 
            ?? $formData['applicant_name'] 
            ?? $formData['student_name_en'] 
            ?? $formData['student_name_bn'] 
            ?? $formData['candidate_name'] 
            ?? $formData['full_name'] 
            ?? $formData['name'] 
            ?? 'Applicant';

        $email = $formData['contact_email'] 
            ?? $formData['applicant_email'] 
            ?? $formData['student_email'] 
            ?? $formData['guardian_email'] 
            ?? $formData['email'] 
            ?? null;

        $phone = $formData['contact_mobile'] 
            ?? $formData['applicant_phone'] 
            ?? $formData['guardian_mobile'] 
            ?? $formData['guardian_phone'] 
            ?? $formData['student_phone'] 
            ?? $formData['mobile'] 
            ?? $formData['phone'] 
            ?? null;

        // Generate unique tracking reference number
        $trackingNumber = FormSubmission::generateTrackingNumber($schema->form_type);

        // Process File Uploads if present
        $attachments = [];
        if ($request->hasFile('attachments')) {
            $files = $request->file('attachments');
            if (is_array($files)) {
                foreach ($files as $key => $file) {
                    if ($file->isValid()) {
                        $storedPath = $file->store("form_submissions/{$schema->form_type}/" . date('Y'), 'public');
                        $attachments[$key] = [
                            'field_key' => $key,
                            'original_name' => $file->getClientOriginalName(),
                            'file_path' => $storedPath,
                            'file_url' => asset('storage/' . $storedPath),
                            'file_size' => $file->getSize(),
                            'mime_type' => $file->getMimeType(),
                        ];
                    }
                }
            }
        }

        // Process individual named file fields
        foreach ($request->allFiles() as $fieldKey => $file) {
            if ($fieldKey !== 'attachments' && $file->isValid()) {
                $storedPath = $file->store("form_submissions/{$schema->form_type}/" . date('Y'), 'public');
                $attachments[$fieldKey] = [
                    'field_key' => $fieldKey,
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => $storedPath,
                    'file_url' => asset('storage/' . $storedPath),
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                ];
                $formData[$fieldKey] = asset('storage/' . $storedPath);
            }
        }

        $submission = FormSubmission::create([
            'form_schema_id' => $schema->id,
            'tracking_number' => $trackingNumber,
            'applicant_name' => substr((string)$name, 0, 255),
            'applicant_email' => $email ? substr((string)$email, 0, 255) : null,
            'applicant_phone' => $phone ? substr((string)$phone, 0, 50) : null,
            'data' => $formData,
            'attachments' => $attachments,
            'status' => 'pending',
            'ip_address' => $request->ip(),
            'user_agent' => substr((string)$request->userAgent(), 0, 500),
        ]);

        // Increment schema submission counter
        $schema->increment('submission_count');

        return response()->json([
            'success' => true,
            'message' => 'আপনার আবেদন সফলভাবে গৃহীত হয়েছে! (Application submitted successfully)',
            'data' => [
                'id' => $submission->id,
                'tracking_number' => $submission->tracking_number,
                'applicant_name' => $submission->applicant_name,
                'applicant_email' => $submission->applicant_email,
                'applicant_phone' => $submission->applicant_phone,
                'form_title' => $schema->title,
                'form_type' => $schema->form_type,
                'status' => $submission->status,
                'submitted_at' => $submission->created_at->toISOString(),
                'post_payment_action' => $schema->post_payment_action,
                'tracking_url' => url('/track/' . $submission->tracking_number),
            ],
        ], 201);
    }

    /**
     * Track an application by tracking number
     */
    public function track(string $trackingNumber): JsonResponse
    {
        $submission = FormSubmission::with('schema:id,title,form_type,post_payment_action')
            ->where('tracking_number', trim($trackingNumber))
            ->first();

        if (!$submission) {
            return response()->json([
                'success' => false,
                'message' => 'প্রদত্ত ট্র্যাকিং নম্বরে কোনো আবেদন খুঁজে পাওয়া যায়নি। (Application not found)',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $submission->id,
                'tracking_number' => $submission->tracking_number,
                'applicant_name' => $submission->applicant_name,
                'applicant_email' => $submission->applicant_email,
                'applicant_phone' => $submission->applicant_phone,
                'status' => $submission->status,
                'form_title' => $submission->schema?->title,
                'form_type' => $submission->schema?->form_type,
                'post_payment_action' => $submission->schema?->post_payment_action,
                'submitted_at' => $submission->created_at->toISOString(),
                'updated_at' => $submission->updated_at->toISOString(),
                'data' => $submission->data,
                'attachments' => $submission->attachments,
                'admin_notes' => $submission->admin_notes,
            ],
        ]);
    }
}