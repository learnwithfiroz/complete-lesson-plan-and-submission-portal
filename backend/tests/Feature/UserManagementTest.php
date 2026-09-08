<?php

namespace Tests\Feature;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_super_admin_can_list_users(): void
    {
        $admin = User::where('email', 'admin@bsisc.edu.bd')->first();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/users');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'data' => [
                    '*' => [
                        'id',
                        'name',
                        'email',
                        'roles',
                    ],
                ],
                'meta' => [
                    'current_page',
                    'total',
                ],
            ]);
    }

    public function test_super_admin_can_filter_teachers_separately(): void
    {
        $admin = User::where('email', 'admin@bsisc.edu.bd')->first();

        $response = $this->actingAs($admin, 'sanctum')->getJson('/api/v1/users?role_group=teachers');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $users = $response->json('data');
        $this->assertNotEmpty($users);

        foreach ($users as $user) {
            $roleNames = array_column($user['roles'], 'name');
            $this->assertContains('teacher', $roleNames);
        }
    }

    public function test_teacher_cannot_list_users(): void
    {
        $teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first();

        $response = $this->actingAs($teacher, 'sanctum')->getJson('/api/v1/users');

        $response->assertStatus(403);
    }

    public function test_super_admin_can_create_new_teacher_user(): void
    {
        $admin = User::where('email', 'admin@bsisc.edu.bd')->first();
        $teacherRole = Role::where('name', 'teacher')->first();
        $dept = Department::first();

        $payload = [
            'name' => 'New Test Teacher',
            'email' => 'newteacher@bsisc.edu.bd',
            'password' => 'Password123!',
            'phone' => '+880 1700-112233',
            'designation' => 'Assistant Teacher',
            'department_id' => $dept->id,
            'role_ids' => [$teacherRole->id],
            'is_active' => true,
        ];

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/users', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'newteacher@bsisc.edu.bd',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newteacher@bsisc.edu.bd',
            'name' => 'New Test Teacher',
        ]);
    }

    public function test_super_admin_can_toggle_user_status(): void
    {
        $admin = User::where('email', 'admin@bsisc.edu.bd')->first();
        $teacher = User::where('email', 'teacher2@bsisc.edu.bd')->first();

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/users/{$teacher->id}/toggle-status");

        $response->assertStatus(200);
        $this->assertDatabaseHas('users', [
            'id' => $teacher->id,
            'is_active' => false,
        ]);
    }

    public function test_super_admin_cannot_deactivate_own_account(): void
    {
        $admin = User::where('email', 'admin@bsisc.edu.bd')->first();

        $response = $this->actingAs($admin, 'sanctum')->patchJson("/api/v1/users/{$admin->id}/toggle-status");

        $response->assertStatus(422);
    }
}
