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
        $admDept = Department::where('code', 'ADM')->first();

        // Super Admin Account (Firoz Ahmed / System Administrator)
        $adminRole = Role::where('name', 'super_admin')->first();
        $admin = User::updateOrCreate(
            ['email' => 'admin@bsisc.edu.bd'],
            [
                'serial_number' => 0,
                'employee_id' => 'BSISC-ADMIN',
                'name' => 'System Administrator',
                'name_bn' => 'সিস্টেম অ্যাডমিনিস্ট্রেটর',
                'password' => Hash::make('01516174063'),
                'phone' => '01516174063',
                'designation' => 'Lead Systems Engineer',
                'department_id' => $admDept?->id,
                'is_active' => true,
            ]
        );
        if ($adminRole) {
            $admin->roles()->sync([$adminRole->id]);
        }
    }
}