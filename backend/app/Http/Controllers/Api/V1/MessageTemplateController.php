<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MessageTemplateController extends Controller
{
    use ApiResponseTrait;

    public const SETTING_KEY = 'message_templates';

    /**
     * Default built-in templates
     */
    public static function getDefaultTemplates(): array
    {
        return [
            [
                'id' => 'bangla_standard',
                'name' => '১. স্ট্যান্ডার্ড বাংলা তাগিদ (রবিবার সকালের ফলো-আপ)',
                'language' => 'bn',
                'category' => 'whatsapp_sms',
                'is_default' => true,
                'is_system' => true,
                'text' => "আসসালামু আলাইকুম {salutation} {name},\n\nবিএসআইএসসি (BSISC) থেকে অবহিত করা যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও আপনার কাছ থেকে জমা পাওয়া যায়নি। শনিবার রাত ১১:৫৯ ছিল নির্ধারিত সময়।\n\nঅনুগ্রহ করে আজ রবিবারের মধ্যে শিক্ষক পোর্টালে গিয়ে আপনার লেসন প্ল্যান ফাইলটি সাবমিট করুন:\n🌐 {portalUrl}\n\nধন্যবাদ,\nএকাডেমিক কো-অর্ডিনেটর ও কর্তৃপক্ষ\nবারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ",
            ],
            [
                'id' => 'with_login_credentials',
                'name' => '২. পোর্টাল লিংক ও পাসওয়ার্ড সহ সরাসরি তাগিদ (With Password & Login Info)',
                'language' => 'bn',
                'category' => 'whatsapp_sms',
                'is_default' => false,
                'is_system' => true,
                'text' => "আসসালামু আলাইকুম {salutation} {name},\n\nবিএসআইএসসি (BSISC) লেসন প্ল্যান ট্র্যাকিং সিস্টেম অনুযায়ী '{batchTitle}'-এর ফাইল এখনও জমা দেওয়া হয়নি। অনুগ্রহ করে নিচের লিংকে গিয়ে সরাসরি আপলোড করুন।\n\n🔑 আপনার লগইন বিবরণ:\n🌐 পোর্টাল লিংক: {portalUrl}\n👤 ইউজারনেম/মোবাইল: {phone}\n🆔 এমপ্লয়ী আইডি: {employeeId}\n🔒 পাসওয়ার্ড: {password} (বা আপনার পরিবর্তিত পাসওয়ার্ড)\n\nধন্যবাদ,\nএকাডেমিক কো-অর্ডিনেটর ও প্রশাসন\nবিএসআইএসসি",
            ],
            [
                'id' => 'urgent_principal',
                'name' => '৩. অধ্যক্ষ মহোদয়ের জরুরি নোটিশ (Urgent Directive)',
                'language' => 'bn',
                'category' => 'whatsapp',
                'is_default' => false,
                'is_system' => true,
                'text' => "[জরুরি প্রাতিষ্ঠানিক নোটিশ]\n\nসম্মানিত {salutation} {name},\nঅধ্যক্ষ মহোদয়ের নির্দেশক্রমে জানানো যাচ্ছে যে, '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা পড়েনি। রবিবারের মনিটরিং রিপোর্টের পূর্বে অনুগ্রহ করে অবিলম্বে আপনার লেসন প্ল্যান ফাইল আপলোড করুন।\n\nপোর্টাল লিংক:\n🌐 {portalUrl}\n\nধন্যবাদ,\nবিএসআইএসসি প্রশাসন",
            ],
            [
                'id' => 'bangla_short_with_pass',
                'name' => '৪. সংক্ষিপ্ত এসএমএস / হোয়াটসঅ্যাপ (লিংক ও পাসওয়ার্ড সহ)',
                'language' => 'bn',
                'category' => 'sms',
                'is_default' => false,
                'is_system' => true,
                'text' => "সম্মানিত {name}, '{batchTitle}'-এর লেসন প্ল্যান দ্রুত জমা দিন: {portalUrl} | ইউজার: {phone} | পাস: 123456 - BSISC",
            ],
            [
                'id' => 'english_formal',
                'name' => '5. English Official Reminder (With Login & Password)',
                'language' => 'en',
                'category' => 'whatsapp_sms',
                'is_default' => false,
                'is_system' => true,
                'text' => "Assalamu Alaikum {salutation} {name},\n\nThis is an official reminder from BSISC. Your Lesson Plan for '{batchTitle}' is currently pending submission. The designated deadline was Saturday 11:59 PM.\n\nPlease upload your lesson plan document via the teacher portal as soon as possible:\n🌐 Portal Link: {portalUrl}\n👤 Login ID: {phone} (EMP ID: {employeeId})\n🔒 Default Password: {password}\n\nThank you,\nAcademic Coordinator & Authority\nBaridhara Scholars' International School and College (BSISC)",
            ],
            [
                'id' => 'urgent_tonight',
                'name' => '৬. জরুরি শেষ তাগিদ (Final Urgent Follow-up)',
                'language' => 'bn',
                'category' => 'whatsapp_sms',
                'is_default' => false,
                'is_system' => true,
                'text' => "সম্মানিত {salutation} {name},\nবিএসআইএসসি লেসন প্ল্যান সাবমিশন পোর্টাল অনুযায়ী '{batchTitle}'-এর ফাইল জমা দেওয়া এখনও বাকি রয়েছে। রিপোর্ট চূড়ান্ত করার পূর্বে অনুগ্রহ করে দ্রুত জমা সম্পন্ন করুন: {portalUrl}\n- একাডেমিক শাখা, বিএসআইএসসি",
            ],
        ];
    }

    /**
     * Get all message templates
     */
    public function index(): JsonResponse
    {
        $raw = Setting::get(self::SETTING_KEY);
        $templates = $raw ? json_decode($raw, true) : null;

        if (!is_array($templates) || empty($templates)) {
            $templates = self::getDefaultTemplates();
        }

        return $this->successResponse($templates, 'মেসেজ টেমপ্লেট সফলভাবে লোড হয়েছে।');
    }

    /**
     * Create a new message template
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'text' => 'required|string|max:2000',
            'language' => 'nullable|string|in:bn,en',
            'category' => 'nullable|string|in:whatsapp,sms,whatsapp_sms,general',
        ]);

        $raw = Setting::get(self::SETTING_KEY);
        $templates = $raw ? json_decode($raw, true) : self::getDefaultTemplates();
        if (!is_array($templates)) {
            $templates = self::getDefaultTemplates();
        }

        $id = 'tpl_' . Str::slug(substr($request->name, 0, 20)) . '_' . time();

        $newTemplate = [
            'id' => $id,
            'name' => trim($request->name),
            'language' => $request->get('language', 'bn'),
            'category' => $request->get('category', 'whatsapp_sms'),
            'is_default' => false,
            'is_system' => false,
            'text' => trim($request->text),
            'updated_at' => now()->toDateTimeString(),
        ];

        $templates[] = $newTemplate;
        Setting::set(self::SETTING_KEY, json_encode($templates), 'communication', true);

        return $this->successResponse($newTemplate, 'নতুন মেসেজ টেমপ্লেট সফলভাবে সংরক্ষিত হয়েছে।');
    }

    /**
     * Update an existing message template
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:150',
            'text' => 'required|string|max:2000',
            'language' => 'nullable|string|in:bn,en',
            'category' => 'nullable|string|in:whatsapp,sms,whatsapp_sms,general',
            'is_default' => 'nullable|boolean',
        ]);

        $raw = Setting::get(self::SETTING_KEY);
        $templates = $raw ? json_decode($raw, true) : self::getDefaultTemplates();
        if (!is_array($templates)) {
            $templates = self::getDefaultTemplates();
        }

        $found = false;
        foreach ($templates as &$tpl) {
            if ($tpl['id'] === $id) {
                $tpl['name'] = trim($request->name);
                $tpl['text'] = trim($request->text);
                if ($request->has('language')) {
                    $tpl['language'] = $request->language;
                }
                if ($request->has('category')) {
                    $tpl['category'] = $request->category;
                }
                if ($request->has('is_default')) {
                    $tpl['is_default'] = (bool)$request->is_default;
                }
                $tpl['updated_at'] = now()->toDateTimeString();
                $found = true;
            } elseif ($request->get('is_default')) {
                // If setting this as default, unset others
                $tpl['is_default'] = false;
            }
        }

        if (!$found) {
            return $this->errorResponse('টেমপ্লেটটি পাওয়া যায়নি।', 404);
        }

        Setting::set(self::SETTING_KEY, json_encode($templates), 'communication', true);

        return $this->successResponse($templates, 'মেসেজ টেমপ্লেট সফলভাবে আপডেট করা হয়েছে।');
    }

    /**
     * Delete a template
     */
    public function destroy(string $id): JsonResponse
    {
        $raw = Setting::get(self::SETTING_KEY);
        $templates = $raw ? json_decode($raw, true) : self::getDefaultTemplates();
        if (!is_array($templates)) {
            $templates = self::getDefaultTemplates();
        }

        $filtered = array_values(array_filter($templates, fn($t) => $t['id'] !== $id));

        if (count($filtered) === count($templates)) {
            return $this->errorResponse('টেমপ্লেটটি পাওয়া যায়নি বা ইতিমধ্যে মুছে ফেলা হয়েছে।', 404);
        }

        Setting::set(self::SETTING_KEY, json_encode($filtered), 'communication', true);

        return $this->successResponse($filtered, 'মেসেজ টেমপ্লেট সফলভাবে মুছে ফেলা হয়েছে।');
    }

    /**
     * Reset all templates to system defaults
     */
    public function reset(): JsonResponse
    {
        $defaults = self::getDefaultTemplates();
        Setting::set(self::SETTING_KEY, json_encode($defaults), 'communication', true);

        return $this->successResponse($defaults, 'সকল টেমপ্লেট সফলভাবে ডিফল্ট অবস্থায় ফিরিয়ে আনা হয়েছে।');
    }

    /**
     * Bulk save all templates
     */
    public function saveAll(Request $request): JsonResponse
    {
        $request->validate([
            'templates' => 'required|array',
            'templates.*.id' => 'required|string',
            'templates.*.name' => 'required|string',
            'templates.*.text' => 'required|string',
        ]);

        Setting::set(self::SETTING_KEY, json_encode($request->templates), 'communication', true);

        return $this->successResponse($request->templates, 'সকল মেসেজ টেমপ্লেট সফলভাবে সংরক্ষিত হয়েছে।');
    }
}