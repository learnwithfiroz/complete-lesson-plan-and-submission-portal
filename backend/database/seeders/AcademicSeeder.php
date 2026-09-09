<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Chapter;
use App\Models\Department;
use App\Models\SchoolClass;
use App\Models\Section;
use App\Models\Subject;
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
        Term::updateOrCreate(
            ['academic_year_id' => $year2026->id, 'name_en' => 'Half Yearly / 1st Term'],
            ['name_bn' => 'অর্ধবার্ষিক / ১ম টার্ম', 'start_date' => '2026-01-01', 'end_date' => '2026-06-30', 'is_current' => true]
        );

        Term::updateOrCreate(
            ['academic_year_id' => $year2026->id, 'name_en' => 'Annual / Final Term'],
            ['name_bn' => 'বার্ষিক / চূড়ান্ত টার্ম', 'start_date' => '2026-07-01', 'end_date' => '2026-12-31', 'is_current' => false]
        );

        $rawRows = [
            ['EnglishVM', 'Std-III', 'A1', 'General (1370)', 1, 'MORNING | 07:45 - 11:10', '2003 - Mostafizur Rahman', 'English Medium', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishMedium', 'Std-XI', 'AS', 'General (1385)', 1, 'MORNING | 07:45 - 11:10', '100079 - Shahnaz Parvin', 'English Medium', 'Moutushi Barua', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-X', 'A', 'General (1384)', 1, 'MORNING | 07:45 - 11:10', '100020 - Mohammad Riazul Islam', 'English Medium', 'Moutushi Barua', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-IX', 'A', 'General (1383)', 1, 'MORNING | 07:45 - 13:40', '100079 - Shahnaz Parvin', 'English Medium', 'Moutushi Barua', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-XII', 'A2', 'General (1386)', 1, 'MORNING | 07:45 - 11:10', '100048 - Sujit Banik', 'English Medium', 'Moutushi Barua', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-VIII', 'A1', 'General (1381)', 1, 'MORNING | 07:45 - 13:40', '100063 - Sharmin Sharfuddin', 'English Medium', 'Moutushi Barua', 'Masuma Mamataz'],
            ['EnglishMedium', 'Nursery', 'Nightingale', 'General (1354)', 1, 'DAY | 11:20 - 14:20', '100065 - Moumita Paul', 'English Medium', 'Mohammad Zakir Hossain', ''],
            ['EnglishVM', 'Std-VII', 'A1', 'General (1379)', 1, 'MORNING | 07:45 - 13:40', '100061 - S. M. Nasrullah', 'English Medium', 'Moutushi Barua', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-III', 'B', 'General (1387)', 1, 'MORNING | 07:45 - 11:10', '2006 - Md. Mahfujul Islam', 'English Version', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVM', 'Std-VI', 'A2', 'General (1377)', 1, 'MORNING | 07:45 - 13:40', '20260106 - MAMUNUR RASHID', 'English Medium', 'Tanzina Akhter Ratna', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-V', 'A1', 'General (1375)', 1, 'MORNING | 07:45 - 11:10', '100035 - Farzana Mostafa Mouly', 'English Medium', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVersion', 'Class-IV', 'B', 'General (1389)', 1, 'MORNING | 08:15 - 11:10', '20260102 - Israt Jahan Lamia', 'English Version', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVM', 'Std-IV', 'A1', 'General (1373)', 1, 'MORNING | 07:45 - 11:10', '100062 - Jannatul Ferdous', 'English Medium', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVersion', 'Class-V', 'B', 'General (1391)', 1, 'MORNING | 07:45 - 11:10', '100069 - Abul Basar', 'English Version', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVersion', 'Class-VIII', 'B', 'General (1397)', 1, 'MORNING | 07:45 - 13:40', '2007 - Habiba Islam Rumpa', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-X', 'B', 'SCIENCE (1414)', 1, 'MORNING | 08:00 - 14:00', '100021 - S. M. Mohi Uddin', 'English Version', 'Musammat Qumrunnahar Kaberi', 'Masuma Mamataz'],
            ['EnglishMedium', 'KG', 'Jupiter', 'General (1358)', 1, 'MORNING | 07:45 - 11:10', '2010 - Ummay Salma', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVersion', 'Class-X', 'B1', 'SCIENCE (1401)', 1, 'MORNING | 09:00 - 13:00', '100021 - S. M. Mohi Uddin', 'English Version', 'Musammat Qumrunnahar Kaberi', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-IX', 'B1', 'SCIENCE (1399)', 1, 'MORNING | 07:45 - 14:20', '100064 - Md. Reshadur Rahman', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-I', 'Lotus', 'General (1362)', 1, 'MORNING | 07:45 - 11:10', '100085 - Mustabsirah Juyiena', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVersion', 'Class-VI', 'B', 'General (1393)', 1, 'MORNING | 07:45 - 13:40', '2011 - Pabitra Ghosh', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-VII', 'B', 'General (1395)', 1, 'MORNING | 07:46 - 13:40', '100071 - Mohammad Mamun Bhuiyan', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-II', 'A', 'General (1366)', 1, 'MORNING | 07:45 - 11:10', '2002 - Md Mahfujar Rahman', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVersion', 'Class-VII', 'C', 'General (1396)', 2, 'MORNING | 07:45 - 13:40', '2009 - Tonmoy Kumar Ghosh', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-III', 'C', 'General (1388)', 2, 'MORNING | 07:45 - 11:10', '100062 - Jannatul Ferdous', 'English Version', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVersion', 'Class-VIII', 'C', 'General (1398)', 2, 'MORNING | 07:45 - 13:40', '100033 - Md Ebrul Hassan', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-IV', 'C', 'General (1390)', 2, 'MORNING | 07:45 - 11:10', '100039 - Syeda Nasrin Aktar', 'English Version', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVersion', 'Class-VI', 'C', 'General (1394)', 2, 'MORNING | 07:45 - 13:40', '100050 - Mahbuba Yeasmin', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-VII', 'A2', 'General (1380)', 2, 'MORNING | 07:45 - 13:40', '100046 - Dipankar Ojha', 'English Medium', 'Moutushi Barua', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-X', 'C', 'COMMERCE (1402)', 2, 'MORNING | 09:00 - 13:00', '100067 - Abdus Sattar', 'English Version', 'Musammat Qumrunnahar Kaberi', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-IX', 'B2', 'SCIENCE (1413)', 2, 'MORNING | 07:45 - 14:20', '100044 - Md Ruhul Amin', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-V', 'C', 'General (1392)', 2, 'MORNING | 07:45 - 11:10', '100052 - Rumana Akter', 'English Version', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVM', 'Std-VI', 'A1', 'General (1378)', 2, 'MORNING | 07:45 - 13:40', '20260402 - Tanzila Bint Aziz', 'English Medium', 'Tanzina Akhter Ratna', 'Masuma Mamataz'],
            ['EnglishMedium', 'Nursery', 'Robin', 'General (1355)', 2, 'DAY | 11:20 - 14:20', '100024 - Sharmin Rahman', 'English Medium', 'Mohammad Zakir Hossain', ''],
            ['EnglishMedium', 'KG', 'Mars', 'General (1359)', 2, 'DAY | 11:20 - 14:20', '20260703 - Nusrat Jahan Shetu', 'English Medium', 'Mohammad Zakir Hossain', ''],
            ['EnglishVM', 'Std-I', 'Magnolia', 'General (1363)', 2, 'MORNING | 07:45 - 11:10', '20260105 - Jannat Ara', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVM', 'Std-II', 'B', 'General (1367)', 2, 'MORNING | 07:45 - 11:10', '20260219 - Tasnim Ali Shamma', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVM', 'Std-III', 'A2', 'General (1371)', 2, 'MORNING | 07:45 - 11:10', '2001 - Md Wahed Nur', 'English Medium', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVM', 'Std-IV', 'A2', 'General (1374)', 2, 'MORNING | 07:45 - 11:10', '100045 - Mohammad Abu Nayim', 'English Medium', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVM', 'Std-V', 'A2', 'General (1376)', 2, 'MORNING | 07:45 - 11:10', '100056 - Md Fakhrul Hasan', 'English Medium', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVM', 'Std-VIII', 'A2', 'General (1382)', 2, 'MORNING | 07:45 - 11:10', '100029 - Aminul Hasan', 'English Medium', 'Shahida Akter Popy', 'Masuma Mamataz'],
            ['EnglishVM', 'Std-II', 'C', 'General (1368)', 3, 'MORNING | 07:45 - 11:10', '100081 - Shamima Sultana Dipa', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVM', 'Std-III', 'A3', 'General (1372)', 3, 'MORNING | 07:45 - 11:10', '20250415 - MD Monirujjaman', 'English Medium', 'Shahida Akter Popy', 'Aklima Begum'],
            ['EnglishVM', 'Std-I', 'Marigold', 'General (1364)', 3, 'MORNING | 07:45 - 11:10', '100040 - Masuma Akhtary', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishMedium', 'KG', 'Venus', 'General (1360)', 3, 'MORNING | 07:45 - 23:10', '100078 - Ajama Shanuhoo', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVersion', 'Class-IX', 'C', 'COMMERCE (1400)', 3, 'MORNING | 07:45 - 14:20', '100068 - Nahid Sultana', 'English Version', 'Fatima Nasrin', 'Masuma Mamataz'],
            ['EnglishVersion', 'Class-X', 'B2', 'SCIENCE (1403)', 3, 'MORNING | 09:00 - 13:00', '100038 - Md Rashed-Uz-Zaman', 'English Version', 'Musammat Qumrunnahar Kaberi', 'Masuma Mamataz'],
            ['EnglishMedium', 'Nursery', 'Doel', 'General (1356)', 3, 'MORNING | 07:45 - 23:10', '100084 - Farjana Akhter Emu', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVM', 'Std-II', 'D', 'General (1369)', 4, 'MORNING | 07:45 - 11:10', '2009 - Tonmoy Kumar Ghosh', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishVM', 'Std-I', 'Lily', 'General (1365)', 4, 'MORNING | 07:45 - 11:10', '2013 - Mst Tamanna Jahan', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
            ['EnglishMedium', 'KG', 'Moon', 'General (1361)', 4, 'DAY | 11:20 - 14:20', '20251109 - Shifat Akter', 'English Medium', 'Mohammad Zakir Hossain', ''],
            ['EnglishMedium', 'Nursery', 'Kingfisher', 'General (1357)', 4, 'MORNING | 19:45 - 11:10', '2015 - Syeda Mishma', 'English Medium', 'Mohammad Zakir Hossain', 'Aklima Begum'],
        ];

        $numericMap = [
            'Nursery' => 0, 'KG' => 0,
            'Std-I' => 1, 'Class-I' => 1,
            'Std-II' => 2, 'Class-II' => 2,
            'Std-III' => 3, 'Class-III' => 3,
            'Std-IV' => 4, 'Class-IV' => 4,
            'Std-V' => 5, 'Class-V' => 5,
            'Std-VI' => 6, 'Class-VI' => 6,
            'Std-VII' => 7, 'Class-VII' => 7,
            'Std-VIII' => 8, 'Class-VIII' => 8,
            'Std-IX' => 9, 'Class-IX' => 9,
            'Std-X' => 10, 'Class-X' => 10,
            'Std-XI' => 11, 'Class-XI' => 11,
            'Std-XII' => 12, 'Class-XII' => 12,
        ];

        $banglaClassMap = [
            'Nursery' => 'নার্সারি', 'KG' => 'কেজি (KG)',
            'Std-I' => '১ম শ্রেণি (Std-I)', 'Class-I' => '১ম শ্রেণি (Class-I)',
            'Std-II' => '২য় শ্রেণি (Std-II)', 'Class-II' => '২য় শ্রেণি (Class-II)',
            'Std-III' => '৩য় শ্রেণি (Std-III)', 'Class-III' => '৩য় শ্রেণি (Class-III)',
            'Std-IV' => '৪র্থ শ্রেণি (Std-IV)', 'Class-IV' => '৪র্থ শ্রেণি (Class-IV)',
            'Std-V' => '৫ম শ্রেণি (Std-V)', 'Class-V' => '৫ম শ্রেণি (Class-V)',
            'Std-VI' => '৬ষ্ঠ শ্রেণি (Std-VI)', 'Class-VI' => '৬ষ্ঠ শ্রেণি (Class-VI)',
            'Std-VII' => '৭ম শ্রেণি (Std-VII)', 'Class-VII' => '৭ম শ্রেণি (Class-VII)',
            'Std-VIII' => '৮ম শ্রেণি (Std-VIII)', 'Class-VIII' => '৮ম শ্রেণি (Class-VIII)',
            'Std-IX' => '৯ম শ্রেণি (Std-IX)', 'Class-IX' => '৯ম শ্রেণি (Class-IX)',
            'Std-X' => '১০ম শ্রেণি (Std-X)', 'Class-X' => '১০ম শ্রেণি (Class-X)',
            'Std-XI' => '১১শ শ্রেণি (Std-XI)', 'Class-XI' => '১১শ শ্রেণি (Class-XI)',
            'Std-XII' => '১২শ শ্রেণি (Std-XII)', 'Class-XII' => '১২শ শ্রেণি (Class-XII)',
        ];

        $users = User::all();

        foreach ($rawRows as $r) {
            $cat = $r[0];
            $clsName = $r[1];
            $secName = $r[2];
            $group = $r[3];
            $order = (int)$r[4];
            $shiftRaw = $r[5];
            $teacherRaw = $r[6];
            $version = $r[7];
            $coord = $r[8];
            $vp = $r[9];

            $shift = 'MORNING';
            $shiftTime = '07:45 - 11:10';
            if (strpos($shiftRaw, '|') !== false) {
                [$s, $st] = explode('|', $shiftRaw, 2);
                $shift = trim($s);
                $shiftTime = trim($st);
            } elseif (!empty($shiftRaw)) {
                $shift = $shiftRaw;
            }

            $empId = '';
            $tName = $teacherRaw;
            if (strpos($teacherRaw, ' - ') !== false) {
                [$empId, $tName] = explode(' - ', $teacherRaw, 2);
            }
            $empId = trim($empId);
            $tName = trim($tName);

            $teacherUser = null;
            if (!empty($empId)) {
                $teacherUser = $users->first(function ($u) use ($empId) {
                    return $u->employee_id == $empId || $u->serial_number == $empId;
                });
            }
            if (!$teacherUser && !empty($tName)) {
                $teacherUser = $users->first(function ($u) use ($tName) {
                    return stripos($u->name, $tName) !== false || stripos($tName, $u->name) !== false;
                });
            }

            $numVal = $numericMap[$clsName] ?? 1;
            $bnName = $banglaClassMap[$clsName] ?? $clsName;

            $schoolClass = SchoolClass::firstOrCreate(
                ['name_en' => $clsName],
                [
                    'name_bn' => $bnName,
                    'numeric_value' => $numVal,
                    'version' => $version,
                    'is_active' => true,
                ]
            );
            $schoolClass->update([
                'name_bn' => $bnName,
                'numeric_value' => $numVal,
                'version' => $version,
                'is_active' => true,
            ]);

            Section::updateOrCreate(
                [
                    'class_id' => $schoolClass->id,
                    'name_en' => $secName,
                ],
                [
                    'name_bn' => $secName . ' শাখা',
                    'capacity' => 45,
                    'version' => $version,
                    'shift' => $shift,
                    'shift_time' => $shiftTime,
                    'group_name' => $group,
                    'order_no' => $order,
                    'class_teacher_id' => $teacherUser?->id,
                    'class_teacher_name' => $teacherUser ? $teacherUser->name : $tName,
                    'coordinator_name' => $coord,
                    'vp_name' => $vp,
                ]
            );
        }

        // Subjects & Chapters
        $mathDept = Department::where('code', 'MATH')->first();
        $sciDept = Department::where('code', 'SCI')->first();
        $engDept = Department::where('code', 'ENG')->first();
        $banDept = Department::where('code', 'BAN')->first();
        $ictDept = Department::where('code', 'ICT')->first();

        $std9Class = SchoolClass::where('name_en', 'Std-IX')->first();
        $std10Class = SchoolClass::where('name_en', 'Std-X')->first();
        $std8Class = SchoolClass::where('name_en', 'Std-VIII')->first();

        $subjectsData = [
            ['dept_id' => $mathDept?->id, 'class_id' => $std9Class?->id, 'code' => 'MATH-09', 'name_bn' => 'সাধারণ গণিত', 'name_en' => 'General Mathematics'],
            ['dept_id' => $mathDept?->id, 'class_id' => $std10Class?->id, 'code' => 'MATH-10', 'name_bn' => 'উচ্চতর গণিত', 'name_en' => 'Higher Mathematics'],
            ['dept_id' => $sciDept?->id, 'class_id' => $std9Class?->id, 'code' => 'PHY-09', 'name_bn' => 'পদার্থবিজ্ঞান', 'name_en' => 'Physics'],
            ['dept_id' => $sciDept?->id, 'class_id' => $std10Class?->id, 'code' => 'CHE-10', 'name_bn' => 'রসায়ন', 'name_en' => 'Chemistry'],
            ['dept_id' => $engDept?->id, 'class_id' => $std9Class?->id, 'code' => 'ENG1-09', 'name_bn' => 'ইংরেজি ১ম পত্র', 'name_en' => 'English 1st Paper'],
            ['dept_id' => $banDept?->id, 'class_id' => $std8Class?->id, 'code' => 'BAN1-08', 'name_bn' => 'বাংলা ১ম পত্র', 'name_en' => 'Bangla 1st Paper'],
            ['dept_id' => $ictDept?->id, 'class_id' => $std8Class?->id, 'code' => 'ICT-08', 'name_bn' => 'তথ্য ও যোগাযোগ প্রযুক্তি', 'name_en' => 'ICT'],
        ];

        foreach ($subjectsData as $sd) {
            $sub = Subject::updateOrCreate(
                ['code' => $sd['code']],
                [
                    'department_id' => $sd['dept_id'],
                    'class_id' => $sd['class_id'],
                    'name_bn' => $sd['name_bn'],
                    'name_en' => $sd['name_en'],
                ]
            );

            Chapter::updateOrCreate(
                ['subject_id' => $sub->id, 'chapter_no' => 1],
                ['title_bn' => 'অধ্যায় ১: মৌলিক ধারণা ও ভিত্তি', 'title_en' => 'Chapter 1: Fundamental Concepts']
            );
            Chapter::updateOrCreate(
                ['subject_id' => $sub->id, 'chapter_no' => 2],
                ['title_bn' => 'অধ্যায় ২: বাস্তব প্রয়োগ ও সমস্যা সমাধান', 'title_en' => 'Chapter 2: Real-world Applications']
            );
        }
    }
}
