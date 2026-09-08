<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class BulkImportController extends Controller
{
    use ApiResponseTrait;

    public function importTeachers(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));

        if (count($data) < 2) {
            return $this->errorResponse('CSV file must contain a header row and at least one data row.', 422);
        }

        $header = array_map('trim', array_shift($data));
        $teacherRole = Role::where('name', 'teacher')->first();

        $imported = 0;
        $errors = [];

        DB::transaction(function () use ($data, $header, $teacherRole, &$imported, &$errors) {
            foreach ($data as $index => $row) {
                if (empty($row) || count($row) < 3) continue;

                $rowAssoc = array_combine(array_slice($header, 0, count($row)), $row);
                $name = trim($rowAssoc['Name'] ?? $rowAssoc['name'] ?? '');
                $email = trim($rowAssoc['Email'] ?? $rowAssoc['email'] ?? '');
                $deptCode = trim($rowAssoc['DepartmentCode'] ?? $rowAssoc['department_code'] ?? '');
                $designation = trim($rowAssoc['Designation'] ?? $rowAssoc['designation'] ?? 'Teacher');
                $phone = trim($rowAssoc['Phone'] ?? $rowAssoc['phone'] ?? '');

                if (empty($name) || empty($email)) {
                    $errors[] = "Row " . ($index + 2) . ": Name and Email are required.";
                    continue;
                }

                if (User::where('email', $email)->exists()) {
                    $errors[] = "Row " . ($index + 2) . ": Email {$email} already registered.";
                    continue;
                }

                $department = Department::where('code', $deptCode)->first();

                $user = User::create([
                    'name' => $name,
                    'email' => $email,
                    'password' => Hash::make('Password123!'),
                    'department_id' => $department?->id,
                    'designation' => $designation,
                    'phone' => $phone,
                    'is_active' => true,
                ]);

                if ($teacherRole) {
                    $user->roles()->attach($teacherRole);
                }

                $imported++;
            }
        });

        return $this->successResponse([
            'imported_count' => $imported,
            'errors' => $errors,
        ], "Successfully imported {$imported} teachers.");
    }

    public function importSubjects(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));

        if (count($data) < 2) {
            return $this->errorResponse('CSV file must contain a header and data rows.', 422);
        }

        $header = array_map('trim', array_shift($data));
        $imported = 0;
        $errors = [];

        DB::transaction(function () use ($data, $header, &$imported, &$errors) {
            foreach ($data as $index => $row) {
                if (empty($row) || count($row) < 3) continue;

                $rowAssoc = array_combine(array_slice($header, 0, count($row)), $row);
                $code = trim($rowAssoc['Code'] ?? $rowAssoc['code'] ?? '');
                $nameEn = trim($rowAssoc['NameEn'] ?? $rowAssoc['name_en'] ?? '');
                $nameBn = trim($rowAssoc['NameBn'] ?? $rowAssoc['name_bn'] ?? '');
                $deptCode = trim($rowAssoc['DepartmentCode'] ?? $rowAssoc['department_code'] ?? '');

                if (empty($code) || empty($nameEn)) {
                    $errors[] = "Row " . ($index + 2) . ": Code and English Name are required.";
                    continue;
                }

                $dept = Department::where('code', $deptCode)->first();

                Subject::updateOrCreate(
                    ['code' => $code],
                    [
                        'name_en' => $nameEn,
                        'name_bn' => $nameBn ?: $nameEn,
                        'department_id' => $dept?->id,
                        'is_active' => true,
                    ]
                );

                $imported++;
            }
        });

        return $this->successResponse([
            'imported_count' => $imported,
            'errors' => $errors,
        ], "Successfully imported {$imported} subjects.");
    }
}