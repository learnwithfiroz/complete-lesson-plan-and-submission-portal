<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Chapter;
use App\Models\Department;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
use App\Models\TeacherAssignment;
use App\Models\Term;
use App\Models\User;
use Illuminate\Database\Seeder;

class AcademicSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Academic Year 2026
        $year2026 = AcademicYear::updateOrCreate(
            ['name' => '2026'],
            ['start_date' => '2026-01-01', 'end_date' => '2026-12-31', 'is_current' => true]
        );

        // 2. Terms
        $term1 = Term::updateOrCreate(
            ['academic_year_id' => $year2026->id, 'name_en' => 'Half Yearly / 1st Term'],
            ['name_bn' => 'অর্ধবার্ষিক / ১ম টার্ম', 'start_date' => '2026-01-01', 'end_date' => '2026-06-30', 'is_current' => true]
        );

        $term2 = Term::updateOrCreate(
            ['academic_year_id' => $year2026->id, 'name_en' => 'Annual / Final Term'],
            ['name_bn' => 'বার্ষিক / চূড়ান্ত টার্ম', 'start_date' => '2026-07-01', 'end_date' => '2026-12-31', 'is_current' => false]
        );

        // 3. Classes
        $classes = [
            ['name_bn' => '৬ষ্ঠ শ্রেণি', 'name_en' => 'Class Six', 'numeric_value' => 6],
            ['name_bn' => '৭ম শ্রেণি', 'name_en' => 'Class Seven', 'numeric_value' => 7],
            ['name_bn' => '৮ম শ্রেণি', 'name_en' => 'Class Eight', 'numeric_value' => 8],
            ['name_bn' => '৯ম শ্রেণি', 'name_en' => 'Class Nine', 'numeric_value' => 9],
            ['name_bn' => '১০ম শ্রেণি', 'name_en' => 'Class Ten', 'numeric_value' => 10],
        ];

        $classModels = [];
        foreach ($classes as $c) {
            $classModels[$c['numeric_value']] = SchoolClass::updateOrCreate(['numeric_value' => $c['numeric_value']], $c);
        }

        // 4. Sections
        $sections = [
            ['name_bn' => 'শাপলা (দিবা)', 'name_en' => 'Shapla (Day)', 'capacity' => 45],
            ['name_bn' => 'পদ্মা (প্রভাতি)', 'name_en' => 'Padma (Morning)', 'capacity' => 45],
            ['name_bn' => 'মেঘনা (প্রভাতি)', 'name_en' => 'Meghna (Morning)', 'capacity' => 40],
        ];

        $sectionModels = [];
        foreach ($classModels as $num => $cl) {
            foreach ($sections as $s) {
                $sectionModels[$num][] = Section::updateOrCreate(
                    ['class_id' => $cl->id, 'name_en' => $s['name_en']],
                    ['name_bn' => $s['name_bn'], 'capacity' => $s['capacity']]
                );
            }
        }

        // 5. Subjects & Chapters
        $mathDept = Department::where('code', 'MATH')->first();
        $sciDept = Department::where('code', 'SCI')->first();
        $engDept = Department::where('code', 'ENG')->first();
        $banDept = Department::where('code', 'BAN')->first();
        $ictDept = Department::where('code', 'ICT')->first();

        $subjectsData = [
            ['dept_id' => $mathDept?->id, 'class_num' => 9, 'code' => 'MATH-09', 'name_bn' => 'সাধারণ গণিত', 'name_en' => 'General Mathematics'],
            ['dept_id' => $mathDept?->id, 'class_num' => 10, 'code' => 'MATH-10', 'name_bn' => 'উচ্চতর গণিত', 'name_en' => 'Higher Mathematics'],
            ['dept_id' => $sciDept?->id, 'class_num' => 9, 'code' => 'PHY-09', 'name_bn' => 'পদার্থবিজ্ঞান', 'name_en' => 'Physics'],
            ['dept_id' => $sciDept?->id, 'class_num' => 10, 'code' => 'CHE-10', 'name_bn' => 'রসায়ন', 'name_en' => 'Chemistry'],
            ['dept_id' => $engDept?->id, 'class_num' => 9, 'code' => 'ENG1-09', 'name_bn' => 'ইংরেজি ১ম পত্র', 'name_en' => 'English 1st Paper'],
            ['dept_id' => $banDept?->id, 'class_num' => 8, 'code' => 'BAN1-08', 'name_bn' => 'বাংলা ১ম পত্র', 'name_en' => 'Bangla 1st Paper'],
            ['dept_id' => $ictDept?->id, 'class_num' => 8, 'code' => 'ICT-08', 'name_bn' => 'তথ্য ও যোগাযোগ প্রযুক্তি', 'name_en' => 'ICT'],
        ];

        $subjectModels = [];
        foreach ($subjectsData as $sd) {
            $classObj = $classModels[$sd['class_num']];
            $sub = Subject::updateOrCreate(
                ['code' => $sd['code']],
                [
                    'department_id' => $sd['dept_id'],
                    'class_id' => $classObj->id,
                    'name_bn' => $sd['name_bn'],
                    'name_en' => $sd['name_en'],
                ]
            );
            $subjectModels[$sd['code']] = $sub;

            // Add sample chapters
            Chapter::updateOrCreate(
                ['subject_id' => $sub->id, 'chapter_no' => 1],
                ['title_bn' => 'অধ্যায় ১: মৌলিক ধারণা ও ভিত্তি', 'title_en' => 'Chapter 1: Fundamental Concepts']
            );
            Chapter::updateOrCreate(
                ['subject_id' => $sub->id, 'chapter_no' => 2],
                ['title_bn' => 'অধ্যায় ২: বাস্তব প্রয়োগ ও সমস্যা সমাধান', 'title_en' => 'Chapter 2: Real-world Applications']
            );
        }

        // 6. Teacher Assignments
        $t1 = User::where('email', 'teacher1@bsisc.edu.bd')->first(); // Math teacher
        $t2 = User::where('email', 'teacher2@bsisc.edu.bd')->first(); // English teacher
        $t3 = User::where('email', 'teacher3@bsisc.edu.bd')->first(); // Science teacher

        if ($t1 && isset($subjectModels['MATH-09'])) {
            TeacherAssignment::updateOrCreate([
                'teacher_id' => $t1->id,
                'academic_year_id' => $year2026->id,
                'class_id' => $classModels[9]->id,
                'section_id' => $sectionModels[9][0]->id,
                'subject_id' => $subjectModels['MATH-09']->id,
            ]);
        }

        if ($t2 && isset($subjectModels['ENG1-09'])) {
            TeacherAssignment::updateOrCreate([
                'teacher_id' => $t2->id,
                'academic_year_id' => $year2026->id,
                'class_id' => $classModels[9]->id,
                'section_id' => $sectionModels[9][1]->id,
                'subject_id' => $subjectModels['ENG1-09']->id,
            ]);
        }

        if ($t3 && isset($subjectModels['PHY-09'])) {
            TeacherAssignment::updateOrCreate([
                'teacher_id' => $t3->id,
                'academic_year_id' => $year2026->id,
                'class_id' => $classModels[9]->id,
                'section_id' => $sectionModels[9][0]->id,
                'subject_id' => $subjectModels['PHY-09']->id,
            ]);
        }
    }
}