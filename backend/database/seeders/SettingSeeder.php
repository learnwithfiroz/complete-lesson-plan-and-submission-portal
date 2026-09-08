<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            ['key' => 'school_name_bn', 'value' => 'বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ (বিএসআইএসসি)', 'group' => 'general', 'is_public' => true],
            ['key' => 'school_name_en', 'value' => "Baridhara Scholars' International School and College (BSISC)", 'group' => 'general', 'is_public' => true],
            ['key' => 'school_eiin', 'value' => '133988', 'group' => 'general', 'is_public' => true],
            ['key' => 'school_code', 'value' => '1242', 'group' => 'general', 'is_public' => true],
            ['key' => 'college_code', 'value' => '1760', 'group' => 'general', 'is_public' => true],
            ['key' => 'address', 'value' => 'DOHS, Baridhara, Dhaka Cantonment, Dhaka', 'group' => 'general', 'is_public' => true],
            ['key' => 'email', 'value' => 'info@bsisc.edu.bd', 'group' => 'general', 'is_public' => true],
            ['key' => 'phone', 'value' => '+880 1738-911879', 'group' => 'general', 'is_public' => true],
            ['key' => 'principal_name', 'value' => 'Brigadier General (Retd.) Dr. M. Rahman', 'group' => 'general', 'is_public' => true],
            ['key' => 'default_language', 'value' => 'bn', 'group' => 'general', 'is_public' => true],
            ['key' => 'theme_primary', 'value' => '#0f2e5a', 'group' => 'branding', 'is_public' => true],
            ['key' => 'theme_secondary', 'value' => '#10b981', 'group' => 'branding', 'is_public' => true],
            ['key' => 'school_logo', 'value' => '/logo.png', 'group' => 'branding', 'is_public' => true],
            ['key' => 'workflow_auto_reminder_days', 'value' => '3', 'group' => 'workflow', 'is_public' => false],
            ['key' => 'lesson_duration_default', 'value' => '45', 'group' => 'workflow', 'is_public' => true],
        ];

        foreach ($settings as $s) {
            Setting::updateOrCreate(['key' => $s['key']], $s);
        }
    }
}