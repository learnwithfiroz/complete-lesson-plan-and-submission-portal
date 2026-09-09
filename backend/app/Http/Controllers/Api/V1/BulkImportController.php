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

    public function exportTeachers(Request $request)
    {
        $query = User::with(['department', 'roles']);

        // Search filter
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('serial_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('designation', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->filled('role')) {
            $role = $request->input('role');
            $query->whereHas('roles', fn($q) => $q->where('name', $role));
        }

        // Role Group filter
        if ($request->filled('role_group')) {
            $roleGroup = $request->input('role_group');
            if ($roleGroup === 'teachers') {
                $query->whereHas('roles', fn($q) => $q->where('name', 'teacher'));
            } elseif ($roleGroup === 'leadership') {
                $query->whereHas('roles', fn($q) => $q->whereIn('name', ['principal', 'academic_coordinator']));
            } elseif ($roleGroup === 'staff') {
                $query->whereHas('roles', fn($q) => $q->where('name', 'staff'));
            } elseif ($roleGroup === 'support') {
                $query->whereHas('roles', fn($q) => $q->where('name', 'support_staff'));
            }
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->input('department_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', filter_var($request->input('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $users = $query->orderByRaw('serial_number IS NULL, serial_number ASC, name ASC')->get();

        // UTF-8 BOM for Excel Bengali readability
        $csv = "\xEF\xBB\xBF";
        $csv .= "SL,Employee_ID,Name,Salutation,Gender,Designation,Department,Phone,Email,Role,Status\n";

        foreach ($users as $u) {
            $roleNames = $u->roles->pluck('name')->implode(';');
            $deptName = $u->department?->name_bn ?: $u->department?->name_en ?: 'General';
            $status = $u->is_active ? 'Active' : 'Inactive';

            $fields = [
                $u->serial_number ?: '',
                $u->employee_id ?: '',
                '"' . str_replace('"', '""', $u->name) . '"',
                $u->salutation ?: '',
                $u->gender ?: '',
                '"' . str_replace('"', '""', $u->designation ?: 'Teacher') . '"',
                '"' . str_replace('"', '""', $deptName) . '"',
                $u->phone ?: '',
                $u->email ?: '',
                $roleNames,
                $status,
            ];
            $csv .= implode(',', $fields) . "\n";
        }

        $filename = 'BSISC_Teachers_Faculty_' . date('Y_m_d') . '.csv';
        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    public function downloadSampleTemplate()
    {
        $sampleCsv = "\xEF\xBB\xBF";
        $sampleCsv .= "SL,Employee_ID,Name,Salutation,Gender,Designation,Department,Phone,Email,Role\n";
        $sampleCsv .= "1,BSISC-101,Mohammad Tanvir Ahmed,Sir,Male,Senior Teacher (Mathematics),Math,01711000004,tanvir@bsisc.edu.bd,teacher\n";
        $sampleCsv .= "2,BSISC-102,Farhana Yasmin,Madam,Female,Assistant Teacher (English),English,01711000005,farhana@bsisc.edu.bd,teacher\n";
        $sampleCsv .= "3,BSISC-103,Prof. Shamima Nasrin,Madam,Female,Academic Coordinator,Science,01711000003,shamima@bsisc.edu.bd,academic_coordinator\n";

        return response($sampleCsv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="BSISC_Teacher_Import_Template.csv"',
        ]);
    }

    public function importTeachers(Request $request): JsonResponse
    {
        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return $this->errorResponse('অনুগ্রহ করে একটি সঠিক CSV/Excel ফাইল নির্বাচন করুন।', 422);
        }

        $file = $request->file('file');
        if ($file->getSize() > 5242880) { // 5MB
            return $this->errorResponse('ফাইলের সাইজ সর্বোচ্চ ৫ মেগাবাইট (5MB) হতে পারবে।', 422);
        }

        $rawContent = file_get_contents($file->getRealPath());

        // Remove BOM if present
        $rawContent = preg_replace('/^\xEF\xBB\xBF/', '', $rawContent);
        $lines = preg_split('/\r\n|\r|\n/', trim($rawContent));

        if (count($lines) < 2) {
            return $this->errorResponse('CSV/Excel ফাইলটিতে অন্তত একটি হেডার এবং একটি ডাটা সারি থাকতে হবে।', 422);
        }

        // Detect delimiter (comma, tab, semicolon)
        $firstLine = $lines[0];
        $delimiter = ',';
        if (substr_count($firstLine, "\t") > substr_count($firstLine, ',')) {
            $delimiter = "\t";
        } elseif (substr_count($firstLine, ';') > substr_count($firstLine, ',')) {
            $delimiter = ';';
        }

        $header = array_map(function ($h) {
            return strtolower(trim(str_replace([' ', '_', '-'], '', $h)));
        }, str_getcsv(array_shift($lines), $delimiter));

        $teacherRole = Role::firstOrCreate(['name' => 'teacher'], ['display_name_bn' => 'বিষয় শিক্ষক', 'display_name_en' => 'Teacher']);
        $coordRole = Role::firstOrCreate(['name' => 'academic_coordinator'], ['display_name_bn' => 'একাডেমিক সমন্বয়ক ও ভাইস প্রিন্সিপাল', 'display_name_en' => 'Academic Coordinator & Vice Principal']);
        $staffRole = Role::firstOrCreate(['name' => 'staff'], ['display_name_bn' => 'কর্মকর্তা ও স্টাফ', 'display_name_en' => 'Staff']);
        $supportStaffRole = Role::firstOrCreate(['name' => 'support_staff'], ['display_name_bn' => 'সহায়ক কর্মী', 'display_name_en' => 'Support Staff']);

        $departments = Department::all();
        $imported = 0;
        $updated = 0;
        $errors = [];

        DB::transaction(function () use ($lines, $header, $delimiter, $departments, $teacherRole, $coordRole, $staffRole, $supportStaffRole, &$imported, &$updated, &$errors) {
            foreach ($lines as $index => $line) {
                if (empty(trim($line))) continue;

                $row = str_getcsv($line, $delimiter);
                if (empty($row) || count($row) < 2) continue;

                $rowAssoc = [];
                foreach ($header as $hIdx => $hKey) {
                    $rowAssoc[$hKey] = isset($row[$hIdx]) ? trim($row[$hIdx]) : '';
                }

                $name = $rowAssoc['name'] ?? $rowAssoc['fullname'] ?? $rowAssoc['teachername'] ?? '';
                $phone = $rowAssoc['phone'] ?? $rowAssoc['mobile'] ?? $rowAssoc['contact'] ?? '';
                $email = $rowAssoc['email'] ?? $rowAssoc['mail'] ?? '';
                $empId = $rowAssoc['employeeid'] ?? $rowAssoc['empid'] ?? $rowAssoc['id'] ?? '';
                $sl = $rowAssoc['sl'] ?? $rowAssoc['serial'] ?? $rowAssoc['serialnumber'] ?? null;
                $gender = $rowAssoc['gender'] ?? 'Female';
                $salutation = $rowAssoc['salutation'] ?? ($gender === 'Male' ? 'Sir' : 'Madam');
                $designation = $rowAssoc['designation'] ?? $rowAssoc['desig'] ?? 'Teacher';
                $deptInput = $rowAssoc['department'] ?? $rowAssoc['dept'] ?? $rowAssoc['departmentcode'] ?? '';
                $roleInput = strtolower($rowAssoc['role'] ?? 'teacher');

                if (empty($name)) {
                    $errors[] = "সারি " . ($index + 2) . ": শিক্ষকের নাম দেওয়া আবশ্যক।";
                    continue;
                }

                // Resolve Department
                $deptId = null;
                if (!empty($deptInput)) {
                    $matchedDept = $departments->first(function ($d) use ($deptInput) {
                        return strcasecmp($d->code, $deptInput) === 0 ||
                               stripos($d->name_en, $deptInput) !== false ||
                               stripos($d->name_bn, $deptInput) !== false;
                    });
                    $deptId = $matchedDept?->id;
                }

                // Generate email if missing
                if (empty($email)) {
                    $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9]/', '.', $name));
                    $email = trim($cleanName, '.') . '@bsisc.edu.bd';
                }

                // Resolve password (default phone or Password123!)
                $rawPassword = !empty($phone) ? $phone : 'Password123!';
                $passwordHash = Hash::make($rawPassword);

                // Find existing user
                $user = null;
                if (!empty($phone)) {
                    $user = User::where('phone', $phone)->first();
                }
                if (!$user && !empty($empId)) {
                    $user = User::where('employee_id', $empId)->first();
                }
                if (!$user && !empty($email)) {
                    $user = User::where('email', $email)->first();
                }

                $userData = [
                    'name' => $name,
                    'salutation' => $salutation,
                    'gender' => $gender,
                    'designation' => $designation,
                    'department_id' => $deptId,
                    'is_active' => true,
                ];

                if (!empty($sl)) $userData['serial_number'] = (int)$sl;
                if (!empty($empId)) $userData['employee_id'] = $empId;
                if (!empty($phone)) $userData['phone'] = $phone;

                // Resolve Role
                $targetRole = $teacherRole;
                $desigLower = strtolower($designation);
                $isVpOrCoord = str_contains($roleInput, 'coord') || str_contains($roleInput, 'vp') || str_contains($desigLower, 'vp') || str_contains($desigLower, 'vice') || str_contains($desigLower, 'coordinator');
                
                if ($isVpOrCoord) {
                    $targetRoles = [$coordRole->id, $teacherRole->id];
                } elseif (str_contains($roleInput, 'support') || str_contains($desigLower, 'attendant') || str_contains($desigLower, 'driver') || str_contains($desigLower, 'guard')) {
                    $targetRoles = [$supportStaffRole->id];
                } elseif (str_contains($roleInput, 'staff') || str_contains($desigLower, 'officer') || str_contains($desigLower, 'account')) {
                    $targetRoles = [$staffRole->id];
                } else {
                    $targetRoles = [$teacherRole->id];
                }

                if ($user) {
                    $user->update($userData);
                    $user->roles()->sync($targetRoles);
                    $updated++;
                } else {
                    $userData['email'] = $email;
                    $userData['password'] = $passwordHash;
                    $newUser = User::create($userData);
                    $newUser->roles()->sync($targetRoles);
                    $imported++;
                }
            }
        });

        $msg = "সফলভাবে {$imported} জন নতুন শিক্ষক ইমপোর্ট এবং {$updated} জন প্রোফাইল আপডেট হয়েছে।";
        return $this->successResponse([
            'imported_count' => $imported,
            'updated_count' => $updated,
            'errors' => $errors,
        ], $msg);
    }

    public function importSubjects(Request $request): JsonResponse
    {
        if (!$request->hasFile('file') || !$request->file('file')->isValid()) {
            return $this->errorResponse('Please select a valid CSV or TXT file.', 422);
        }

        $file = $request->file('file');
        if ($file->getSize() > 2097152) { // 2MB
            return $this->errorResponse('File size cannot exceed 2MB.', 422);
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: pathinfo($file->getClientOriginalName(), PATHINFO_EXTENSION));
        if (!in_array($ext, ['csv', 'txt', 'tsv'])) {
            return $this->errorResponse('Only CSV or text files are supported.', 422);
        }

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