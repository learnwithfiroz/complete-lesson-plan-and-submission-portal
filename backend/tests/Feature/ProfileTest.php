<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);

        $this->user = User::first();
    }

    public function test_user_can_view_extended_profile(): void
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'email',
                    'salutation',
                    'gender',
                    'religion',
                    'blood_group',
                    'employee_type',
                    'home_district',
                ]
            ]);
    }

    public function test_user_can_update_extended_profile_fields(): void
    {
        $payload = [
            'name' => 'Masuma Mamataz',
            'name_bn' => 'মাসুমা মমতাজ',
            'email' => $this->user->email,
            'phone' => '01780017602',
            'salutation' => 'Madam',
            'gender' => 'Female',
            'religion' => 'Islam',
            'blood_group' => 'A+',
            'date_of_birth' => '1988-05-15',
            'join_date' => '2015-01-01',
            'nid' => '19881234567890',
            'nationality' => 'Bangladeshi',
            'father_name' => 'Md. Rafiqul Islam',
            'mother_name' => 'Fatema Begum',
            'present_address' => 'House 12, Road 4, Baridhara DOHS, Dhaka',
            'permanent_address' => 'Village: Sonapur, District: Cumilla',
            'home_district' => 'Cumilla',
            'emergency_contact_name' => 'Md. Rafiqul Islam',
            'emergency_contact_relation' => 'Father',
            'emergency_contact_phone' => '01711223344',
            'appointment_subject' => 'English Language',
            'teaching_subject' => 'English B.Ed, M.A.',
            'school_hours' => 'Teacher-BSI [08:05 - 14:30]',
            'employee_type' => 'Permanent',
            'bio' => 'Senior English Teacher with 10+ years experience.',
            'facebook_url' => 'https://facebook.com/masuma.teacher',
            'bank_account_no' => '0012-3456789',
            'bank_name' => 'Trust Bank, Baridhara Branch',
        ];

        $response = $this->actingAs($this->user)
            ->putJson('/api/v1/profile', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'name' => 'Masuma Mamataz',
                    'name_bn' => 'মাসুমা মমতাজ',
                    'blood_group' => 'A+',
                    'home_district' => 'Cumilla',
                ]
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $this->user->id,
            'name' => 'Masuma Mamataz',
            'name_bn' => 'মাসুমা মমতাজ',
            'blood_group' => 'A+',
            'home_district' => 'Cumilla',
            'bank_name' => 'Trust Bank, Baridhara Branch',
        ]);
    }

    public function test_user_can_upload_and_delete_avatar(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/profile/avatar', [
                'avatar' => $file,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'avatar',
                ]
            ]);

        $avatarPath = $this->user->fresh()->avatar;
        $this->assertNotNull($avatarPath);
        $this->assertStringStartsWith('/storage/avatars/', $avatarPath);

        // Delete Avatar
        $deleteResponse = $this->actingAs($this->user)
            ->deleteJson('/api/v1/profile/avatar');

        $deleteResponse->assertStatus(200);
        $this->assertNull($this->user->fresh()->avatar);
    }
}