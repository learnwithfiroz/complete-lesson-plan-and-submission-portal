<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultPassword = Hash::make('Password123!');

        $sciDept = Department::where('code', 'SCI')->first();
        $mathDept = Department::where('code', 'MATH')->first();
        $engDept = Department::where('code', 'ENG')->first();
        $banDept = Department::where('code', 'BAN')->first();
        $ictDept = Department::where('code', 'ICT')->first();

        // 1. Super Admin
        $adminRole = Role::where('name', 'super_admin')->first();
        $admin = User::updateOrCreate(
            ['email' => 'admin@bsisc.edu.bd'],
            [
                'name' => 'System Administrator',
                'name_bn' => 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
                'password' => $defaultPassword,
                'phone' => '01711000001',
                'designation' => 'Lead Systems Engineer',
                'is_active' => true,
            ]
        );
        $admin->roles()->sync([$adminRole->id]);

        // 2. Principal / Head Teacher
        $principalRole = Role::where('name', 'principal')->first();
        $principal = User::updateOrCreate(
            ['email' => 'principal@bsisc.edu.bd'],
            [
                'name' => 'Brigadier General (Retd.) Dr. M. Rahman',
                'name_bn' => 'ব্রিগেডিয়ার জেনারেল (অব.) ড. এম. রহমান',
                'password' => $defaultPassword,
                'phone' => '01711000002',
                'designation' => 'Principal & Head of Institution',
                'is_active' => true,
            ]
        );
        $principal->roles()->sync([$principalRole->id]);

        // 3. Academic Coordinators / Vice Principals
        $coordinatorRole = Role::where('name', 'academic_coordinator')->first();
        $coord1 = User::updateOrCreate(
            ['email' => 'coordinator@bsisc.edu.bd'],
            [
                'name' => 'Prof. Shamima Nasrin',
                'name_bn' => 'অধ্যাপক শামীমা নাসরিন',
                'password' => $defaultPassword,
                'phone' => '01711000003',
                'designation' => 'Academic Coordinator (Secondary & College)',
                'department_id' => $sciDept?->id,
                'is_active' => true,
            ]
        );
        $coord1->roles()->sync([$coordinatorRole->id]);

        $coord2 = User::updateOrCreate(
            ['email' => 'masuma.mamataz@bsisc.edu.bd'],
            [
                'name' => 'Masuma Mamataz',
                'name_bn' => 'মাসুমা মমতাজ',
                'password' => $defaultPassword,
                'phone' => '01780017602',
                'designation' => 'Vice Principal (Senior Division)',
                'department_id' => $sciDept?->id,
                'is_active' => true,
            ]
        );
        $coord2->roles()->sync([$coordinatorRole->id]);

        // 4. Faculty & Senior Teachers
        $teacherRole = Role::where('name', 'teacher')->first();

        $teachers = [
            [
                'email' => 'aziza.taher@bsisc.edu.bd',
                'name' => 'Aziza Taher',
                'name_bn' => 'আজিজা তাহের',
                'phone' => '01720041189',
                'designation' => 'Senior Teacher (Mathematics)',
                'department_id' => $mathDept?->id,
            ],
            [
                'email' => 'zebin.akter@bsisc.edu.bd',
                'name' => 'Zebin Akter',
                'name_bn' => 'জেবিন আক্তার',
                'phone' => '01670250173',
                'designation' => 'Senior Teacher (English)',
                'department_id' => $engDept?->id,
            ],
            [
                'email' => 'teacher1@bsisc.edu.bd',
                'name' => 'Mohammad Tanvir Ahmed',
                'name_bn' => 'মোহাম্মদ তানভীর আহমেদ',
                'phone' => '01711000004',
                'designation' => 'Senior Teacher (Mathematics)',
                'department_id' => $mathDept?->id,
            ],
            [
                'email' => 'teacher2@bsisc.edu.bd',
                'name' => 'Farhana Yasmin',
                'name_bn' => 'ফারহানা ইয়াসমিন',
                'phone' => '01711000005',
                'designation' => 'Assistant Teacher (English)',
                'department_id' => $engDept?->id,
            ],
            [
                'email' => 'teacher3@bsisc.edu.bd',
                'name' => 'Kazi Nazmul Huda',
                'name_bn' => 'কাজী নাজমুল হুদা',
                'phone' => '01711000006',
                'designation' => 'Senior Teacher (Physics & Science)',
                'department_id' => $sciDept?->id,
            ],
            [
                'email' => 'teacher4@bsisc.edu.bd',
                'name' => 'Nusrat Jahan',
                'name_bn' => 'নুসরাত জাহান',
                'phone' => '01711000007',
                'designation' => 'Assistant Teacher (Bangla)',
                'department_id' => $banDept?->id,
            ],
            [
                'email' => 'teacher5@bsisc.edu.bd',
                'name' => 'Mahbubur Rahman',
                'name_bn' => 'মাহবুবুর রহমান',
                'phone' => '01711000008',
                'designation' => 'Lecturer (ICT)',
                'department_id' => $ictDept?->id,
            ],
        ];

        foreach ($teachers as $tData) {
            $t = User::updateOrCreate(
                ['email' => $tData['email']],
                array_merge($tData, [
                    'password' => $defaultPassword,
                    'is_active' => true,
                ])
            );
            $t->roles()->sync([$teacherRole->id]);
        }
    }
}