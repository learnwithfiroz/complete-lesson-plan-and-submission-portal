<?php

namespace Database\Seeders;

use App\Models\Department;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['name_bn' => 'বিজ্ঞান বিভাগ', 'name_en' => 'Science Department', 'code' => 'SCI', 'description' => 'Physics, Chemistry, Biology, Higher Math'],
            ['name_bn' => 'গণিত বিভাগ', 'name_en' => 'Mathematics Department', 'code' => 'MATH', 'description' => 'General Mathematics'],
            ['name_bn' => 'ইংরেজি বিভাগ', 'name_en' => 'English Department', 'code' => 'ENG', 'description' => 'English 1st & 2nd Paper'],
            ['name_bn' => 'বাংলা বিভাগ', 'name_en' => 'Bangla Department', 'code' => 'BAN', 'description' => 'Bangla 1st & 2nd Paper'],
            ['name_bn' => 'সামাজিক বিজ্ঞান বিভাগ', 'name_en' => 'Social Science Department', 'code' => 'SOC', 'description' => 'Bangladesh & Global Studies, History'],
            ['name_bn' => 'তথ্য ও যোগাযোগ প্রযুক্তি বিভাগ', 'name_en' => 'ICT Department', 'code' => 'ICT', 'description' => 'Information & Communication Technology'],
            ['name_bn' => 'ব্যবসায় শিক্ষা বিভাগ', 'name_en' => 'Business Studies Department', 'code' => 'BUS', 'description' => 'Accounting, Finance, Business Org'],
            ['name_bn' => 'ধর্ম ও নৈতিক শিক্ষা বিভাগ', 'name_en' => 'Religion & Moral Studies', 'code' => 'REL', 'description' => 'Islam & Moral, Hindu Studies'],
            ['name_bn' => 'চারু ও শারীরিক শিক্ষা বিভাগ', 'name_en' => 'Arts & Physical Education', 'code' => 'ART', 'description' => 'Arts & Crafts, Physical Education'],
            ['name_bn' => 'প্রশাসন ও সাধারণ শাখা', 'name_en' => 'Administration & General', 'code' => 'ADM', 'description' => 'Leadership, Administration & Support'],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(['code' => $dept['code']], $dept);
        }
    }
}