<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class StaffAndTeacherSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Roles exist
        $superAdminRole = Role::firstOrCreate(['name' => 'super_admin'], [
            'display_name_bn' => 'সুপার অ্যাডমিন',
            'display_name_en' => 'Super Administrator',
            'description' => 'Full administrative access',
        ]);

        $principalRole = Role::firstOrCreate(['name' => 'principal'], [
            'display_name_bn' => 'অধ্যক্ষ / প্রধান শিক্ষক',
            'display_name_en' => 'Principal / Head Teacher',
            'description' => 'Institution head with review/approval authority',
        ]);

        $coordRole = Role::firstOrCreate(['name' => 'academic_coordinator'], [
            'display_name_bn' => 'উপাধ্যক্ষ / একাডেমিক সমন্বয়ক',
            'display_name_en' => 'Vice Principal / Academic Coordinator',
            'description' => 'Academic Coordinator & Vice Principal',
        ]);

        $teacherRole = Role::firstOrCreate(['name' => 'teacher'], [
            'display_name_bn' => 'শিক্ষকবৃন্দ',
            'display_name_en' => 'Teaching Faculty',
            'description' => 'Subject Teacher / Senior Teacher / Instructor',
        ]);

        $staffRole = Role::firstOrCreate(['name' => 'staff'], [
            'display_name_bn' => 'কর্মকর্তা ও স্টাফ',
            'display_name_en' => 'Administrative Staff',
            'description' => 'Administrative and Office Staff',
        ]);

        $supportStaffRole = Role::firstOrCreate(['name' => 'support_staff'], [
            'display_name_bn' => 'সহায়ক কর্মী',
            'display_name_en' => 'Support Staff / Attendants',
            'description' => 'Class Attendant / Transport / Security / Hygiene Staff',
        ]);

        // 2. Fetch Departments for accurate department mapping
        $depts = Department::all()->keyBy('code');
        $sciDept = $depts['SCI'] ?? null;
        $mathDept = $depts['MATH'] ?? null;
        $engDept = $depts['ENG'] ?? null;
        $banDept = $depts['BAN'] ?? null;
        $ictDept = $depts['ICT'] ?? null;
        $busDept = $depts['BUS'] ?? null;
        $socDept = $depts['SOC'] ?? null;
        $relDept = $depts['REL'] ?? null;
        $artDept = $depts['ART'] ?? null;
        $admDept = $depts['ADM'] ?? null;

        // 3. Ensure Super Admin Account
        $admin = User::updateOrCreate(
            ['email' => 'admin@bsisc.edu.bd'],
            [
                'serial_number' => 0,
                'employee_id' => 'BSISC-ADMIN',
                'name' => 'System Administrator',
                'salutation' => 'Engr.',
                'gender' => 'Male',
                'phone' => '01516174063',
                'password' => Hash::make('01516174063'),
                'designation' => 'Lead Systems Engineer',
                'department_id' => $admDept?->id,
                'is_active' => true,
            ]
        );
        $admin->roles()->sync([$superAdminRole->id]);

        // 4. Read Raw TSV
        $tsvFile = __DIR__ . '/raw_staff.tsv';
        if (!file_exists($tsvFile)) return;

        $lines = explode("\n", trim(file_get_contents($tsvFile)));
        $usedEmails = ['admin@bsisc.edu.bd' => true];
        $seededUserIds = [$admin->id];

        $totalSeeded = 0;
        foreach ($lines as $index => $line) {
            $line = trim($line);
            if (empty($line)) continue;

            $parts = explode("\t", $line);
            if (count($parts) < 7) continue;

            $sl = (int)trim($parts[0]);
            $empId = trim($parts[1]);
            $fullName = trim($parts[2]);
            $gender = trim($parts[3]);
            $salutation = trim($parts[4]);
            $designation = trim($parts[5]);
            $mobile = trim($parts[6]);

            // Fix mobile number
            if ($mobile === '0' || empty($mobile)) {
                $mobile = '01711000002';
            }
            $mobile = preg_replace('/[^0-9]/', '', $mobile);

            // Clean Name for Email Generation
            $cleanName = preg_replace('/\b(Brig|Gen|SUP|BAR|ndc|psc|G\+|MPhil|LPR|Sgt|Snk|Cpl|MT|Ord|retd|Retd|Dr|Prof|MD|Md|Mst|Most|S\.?\s*M\.?)\b/i', '', $fullName);
            $cleanName = preg_replace('/[,\.\(\)\-\+]/', ' ', $cleanName);
            $cleanName = trim(preg_replace('/\s+/', ' ', $cleanName));

            $slug = Str::slug($cleanName, '.');
            if (empty($slug) || strlen($slug) < 3) {
                $slug = 'user.' . substr($mobile, -4);
            }

            $baseEmail = $slug . '@bsisc.edu.bd';
            $email = $baseEmail;

            $desigLower = strtolower($designation);
            $targetRoleId = $staffRole->id;
            $deptId = $admDept?->id;

            // Department resolution based on designation keywords
            if (str_contains($desigLower, 'math')) {
                $deptId = $mathDept?->id;
            } elseif (str_contains($desigLower, 'physics') || str_contains($desigLower, 'chemistry') || str_contains($desigLower, 'biology') || str_contains($desigLower, 'science')) {
                $deptId = $sciDept?->id;
            } elseif (str_contains($desigLower, 'english')) {
                $deptId = $engDept?->id;
            } elseif (str_contains($desigLower, 'bangla') || str_contains($desigLower, 'bengali')) {
                $deptId = $banDept?->id;
            } elseif (str_contains($desigLower, 'ict') || str_contains($desigLower, 'computer')) {
                $deptId = $ictDept?->id;
            } elseif (str_contains($desigLower, 'accounting') || str_contains($desigLower, 'finance') || str_contains($desigLower, 'business') || str_contains($desigLower, 'commerce')) {
                $deptId = $busDept?->id;
            } elseif (str_contains($desigLower, 'islam') || str_contains($desigLower, 'religion') || str_contains($desigLower, 'hindu') || str_contains($desigLower, 'moral')) {
                $deptId = $relDept?->id;
            } elseif (str_contains($desigLower, 'art') || str_contains($desigLower, 'physical') || str_contains($desigLower, 'sports') || str_contains($desigLower, 'music') || str_contains($desigLower, 'craft')) {
                $deptId = $artDept?->id;
            } elseif (str_contains($desigLower, 'social') || str_contains($desigLower, 'history') || str_contains($desigLower, 'geography') || str_contains($desigLower, 'civics') || str_contains($desigLower, 'bgs')) {
                $deptId = $socDept?->id;
            }

            // Role resolution
            if ($mobile === '01516174063' || $fullName === 'FIROZ AHMED' || $email === 'admin@bsisc.edu.bd') {
                $targetRoleId = $superAdminRole->id;
                $email = 'admin@bsisc.edu.bd';
                $deptId = $admDept?->id;
            } elseif (str_contains($desigLower, 'principal') && !str_contains($desigLower, 'vp') && !str_contains($desigLower, 'vice')) {
                $targetRoleId = $principalRole->id;
                $email = 'principal@bsisc.edu.bd';
                $deptId = $admDept?->id;
            } elseif (str_contains($desigLower, 'vp') || str_contains($desigLower, 'vice principal') || str_contains($desigLower, 'coordinator')) {
                $targetRoleId = $coordRole->id;
                $deptId = $admDept?->id;
            } elseif (
                str_contains($desigLower, 'teacher') ||
                str_contains($desigLower, 'instructor') ||
                str_contains($desigLower, 'instr') ||
                str_contains($desigLower, 'co-teacher') ||
                str_contains($desigLower, 'lecturer')
            ) {
                $targetRoleId = $teacherRole->id;
            } elseif (
                str_contains($desigLower, 'attendant') ||
                str_contains($desigLower, 'driver') ||
                str_contains($desigLower, 'guard') ||
                str_contains($desigLower, 'hygiene') ||
                str_contains($desigLower, 'cleaner') ||
                str_contains($desigLower, 'electrician') ||
                str_contains($desigLower, 'plumber') ||
                str_contains($desigLower, 'carpenter') ||
                str_contains($desigLower, 'mason') ||
                str_contains($desigLower, 'messenger') ||
                str_contains($desigLower, 'gardener') ||
                str_contains($desigLower, 'caretaker')
            ) {
                $targetRoleId = $supportStaffRole->id;
                $deptId = $admDept?->id;
            } else {
                $targetRoleId = $staffRole->id;
                $deptId = $admDept?->id;
            }

            $counter = 1;
            while (isset($usedEmails[$email]) && $email !== 'principal@bsisc.edu.bd' && $email !== 'admin@bsisc.edu.bd') {
                $counter++;
                $email = str_replace('@bsisc.edu.bd', $counter . '@bsisc.edu.bd', $baseEmail);
            }
            $usedEmails[$email] = true;

            // Password is their mobile number
            $passwordHash = Hash::make($mobile);

            // Find existing user by phone, employee_id, or serial_number
            $user = User::where('serial_number', $sl)
                ->orWhere('phone', $mobile)
                ->orWhere('email', $email)
                ->first();

            if (!$user) {
                // Ensure email is globally unique in database
                $checkEmail = $email;
                $counter = 1;
                while (User::where('email', $checkEmail)->exists()) {
                    $counter++;
                    $checkEmail = str_replace('@bsisc.edu.bd', $counter . '@bsisc.edu.bd', $baseEmail);
                }
                $email = $checkEmail;

                $user = User::create([
                    'serial_number' => $sl,
                    'employee_id' => $empId,
                    'name' => $fullName,
                    'salutation' => $salutation,
                    'gender' => $gender,
                    'email' => $email,
                    'phone' => $mobile,
                    'password' => $passwordHash,
                    'designation' => $designation,
                    'department_id' => $deptId,
                    'is_active' => true,
                ]);
            } else {
                $user->update([
                    'serial_number' => $sl,
                    'employee_id' => $empId,
                    'name' => $fullName,
                    'salutation' => $salutation,
                    'gender' => $gender,
                    'phone' => $mobile,
                    'password' => $passwordHash,
                    'designation' => $designation,
                    'department_id' => $deptId,
                    'is_active' => true,
                ]);
            }

            // Sync role
            $user->roles()->sync([$targetRoleId]);
            $seededUserIds[] = $user->id;
            $totalSeeded++;
        }

        // Delete any ghost / dummy users not in the official 178 list or super admin safely
        $dummyUsers = User::whereNotIn('id', $seededUserIds)->get();
        if ($dummyUsers->isNotEmpty()) {
            $dummyIds = $dummyUsers->pluck('id')->toArray();
            
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
            \App\Models\LessonPlan::whereIn('teacher_id', $dummyIds)->update(['teacher_id' => $admin->id]);
            \App\Models\LessonPlan::whereIn('created_by', $dummyIds)->update(['created_by' => $admin->id]);
            \App\Models\LessonPlan::whereIn('updated_by', $dummyIds)->update(['updated_by' => $admin->id]);
            \App\Models\TeacherAssignment::whereIn('teacher_id', $dummyIds)->delete();
            \App\Models\TeacherSubmission::whereIn('teacher_id', $dummyIds)->delete();
            \Illuminate\Support\Facades\DB::table('role_user')->whereIn('user_id', $dummyIds)->delete();
            \Illuminate\Support\Facades\DB::table('personal_access_tokens')->whereIn('tokenable_id', $dummyIds)->where('tokenable_type', 'App\\Models\\User')->delete();
            User::whereIn('id', $dummyIds)->forceDelete();
            \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');
        }

        echo "Successfully seeded " . $totalSeeded . " BSISC faculty and staff with exact SL, EMP ID, departments, and removed any extra users!\n";
    }
}