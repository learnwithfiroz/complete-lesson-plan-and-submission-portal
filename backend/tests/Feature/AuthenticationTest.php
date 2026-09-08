<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $response = $this->postJson('/api/v1/login', [
            'email' => 'admin@bsisc.edu.bd',
            'password' => 'Password123!',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ])
            ->assertJsonStructure([
                'data' => [
                    'user' => [
                        'id',
                        'name',
                        'email',
                    ],
                    'token',
                ],
            ]);
    }

    public function test_user_can_login_with_phone_number_and_mobile_password(): void
    {
        $teacher = User::whereNotNull('phone')->where('phone', '!=', '')->first();
        $this->assertNotNull($teacher);

        $response = $this->postJson('/api/v1/login', [
            'email' => $teacher->phone,
            'password' => $teacher->phone,
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Login successful.',
            ])
            ->assertJsonPath('data.user.id', $teacher->id);
    }

    public function test_user_cannot_login_with_invalid_credentials(): void
    {
        $response = $this->postJson('/api/v1/login', [
            'email' => 'admin@bsisc.edu.bd',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
            ]);
    }

    public function test_authenticated_user_can_access_user_profile(): void
    {
        $user = User::where('email', 'teacher1@bsisc.edu.bd')->first();

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/user');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'email' => 'teacher1@bsisc.edu.bd',
                ],
            ]);
    }

    public function test_public_settings_endpoint_returns_school_branding(): void
    {
        $response = $this->getJson('/api/v1/settings/public');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'school_eiin' => '133988',
                    'school_code' => '1242',
                ],
            ]);
    }

    public function test_csrf_cookie_endpoint_is_accessible(): void
    {
        $response = $this->getJson('/sanctum/csrf-cookie');
        $response->assertStatus(204);
    }

    public function test_user_can_logout(): void
    {
        $user = User::where('email', 'admin@bsisc.edu.bd')->first();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/logout');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully.',
            ]);
    }
}
