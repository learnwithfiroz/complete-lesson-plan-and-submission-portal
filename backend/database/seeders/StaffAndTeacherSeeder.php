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

        // 2. Ensure Super Admin Account
        $admin = User::updateOrCreate(
            ['email' => 'admin@bsisc.edu.bd'],
            [
                'name' => 'System Administrator',
                'salutation' => 'Engr.',
                'gender' => 'Male',
                'phone' => '01711000001',
                'password' => Hash::make('Password123!'),
                'designation' => 'Lead Systems Engineer',
                'is_active' => true,
            ]
        );
        $admin->roles()->sync([$superAdminRole->id]);

        // 3. Read Raw TSV
        $tsvFile = __DIR__ . '/raw_staff.tsv';
        if (!file_exists($tsvFile)) return;

        $lines = explode("\n", trim(file_get_contents($tsvFile)));
        $usedEmails = ['admin@bsisc.edu.bd' => true];

        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line)) continue;

            $parts = explode("\t", $line);
            if (count($parts) < 5) continue;

            $fullName = trim($parts[0]);
            $gender = trim($parts[1]);
            $salutation = trim($parts[2]);
            $designation = trim($parts[3]);
            $mobile = trim($parts[4]);

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

            if (str_contains($desigLower, 'principal') && !str_contains($desigLower, 'vp') && !str_contains($desigLower, 'vice')) {
                $targetRoleId = $principalRole->id;
                $email = 'principal@bsisc.edu.bd';
            } elseif (str_contains($desigLower, 'vp') || str_contains($desigLower, 'vice principal') || str_contains($desigLower, 'coordinator')) {
                $targetRoleId = $coordRole->id;
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
            } else {
                $targetRoleId = $staffRole->id;
            }

            $counter = 1;
            while (isset($usedEmails[$email]) && $email !== 'principal@bsisc.edu.bd') {
                $counter++;
                $email = str_replace('@bsisc.edu.bd', $counter . '@bsisc.edu.bd', $baseEmail);
            }
            $usedEmails[$email] = true;

            // Password is their mobile number
            $passwordHash = Hash::make($mobile);

            // Find existing user by phone or email
            $user = User::where('phone', $mobile)
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
                    'name' => $fullName,
                    'salutation' => $salutation,
                    'gender' => $gender,
                    'email' => $email,
                    'phone' => $mobile,
                    'password' => $passwordHash,
                    'designation' => $designation,
                    'is_active' => true,
                ]);
            } else {
                $user->update([
                    'name' => $fullName,
                    'salutation' => $salutation,
                    'gender' => $gender,
                    'phone' => $mobile,
                    'password' => $passwordHash,
                    'designation' => $designation,
                    'is_active' => true,
                ]);
            }

            // Sync role
            $user->roles()->sync([$targetRoleId]);
        }

        echo "Successfully seeded " . count($lines) . " BSISC faculty and staff with mobile numbers and passwords!\n";
    }
}