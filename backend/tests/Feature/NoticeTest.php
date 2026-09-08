<?php

namespace Tests\Feature;

use App\Models\Notice;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NoticeTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $teacher;
    protected User $coordinator;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->admin = User::where('email', 'admin@bsisc.edu.bd')->first();
        $this->teacher = User::where('email', 'teacher1@bsisc.edu.bd')->first();
        $this->coordinator = User::where('email', 'coordinator@bsisc.edu.bd')->first();
    }

    public function test_authenticated_user_can_fetch_live_ticker_notices(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson('/api/v1/notices/live-ticker');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    '*' => ['id', 'title_bn', 'title_en', 'category', 'priority', 'is_pinned']
                ]
            ]);
    }

    public function test_authenticated_user_can_fetch_paginated_notices(): void
    {
        $response = $this->actingAs($this->teacher)
            ->getJson('/api/v1/notices');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['current_page', 'last_page', 'total']
            ]);
    }

    public function test_authorized_user_can_create_notice(): void
    {
        $payload = [
            'title_bn' => 'পরীক্ষামূলক নোটিশ',
            'title_en' => 'Test Notice for Verification',
            'content_bn' => 'এটি একটি পরীক্ষামূলক নোটিশের বিস্তারিত বিবরণ।',
            'content_en' => 'This is the detailed description of test notice.',
            'category' => 'academic',
            'priority' => 'urgent',
            'target_audience' => 'teachers',
            'is_pinned' => true,
            'is_published' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/notices', $payload);

        $response->assertStatus(201)
            ->assertJsonFragment([
                'title_en' => 'Test Notice for Verification',
                'is_pinned' => true,
            ]);

        $this->assertDatabaseHas('notices', [
            'title_en' => 'Test Notice for Verification',
            'priority' => 'urgent',
        ]);
    }

    public function test_unauthorized_teacher_cannot_create_notice(): void
    {
        $payload = [
            'title_bn' => 'অবৈধ নোটিশ',
            'title_en' => 'Unauthorized Notice Creation',
            'content_bn' => 'বিবরণ',
            'content_en' => 'Description',
            'category' => 'general',
            'priority' => 'low',
            'target_audience' => 'all',
        ];

        $response = $this->actingAs($this->teacher)
            ->postJson('/api/v1/notices', $payload);

        $response->assertStatus(403);
    }

    public function test_authorized_user_can_toggle_pin(): void
    {
        $notice = Notice::first();

        $originalState = $notice->is_pinned;

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/v1/notices/{$notice->id}/toggle-pin");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'is_pinned' => !$originalState,
            ]);
    }

    public function test_authorized_user_can_update_notice(): void
    {
        $notice = Notice::first();

        $response = $this->actingAs($this->coordinator)
            ->putJson("/api/v1/notices/{$notice->id}", [
                'title_en' => 'Updated Notice Title By Coordinator',
            ]);

        $response->assertStatus(200)
            ->assertJsonFragment([
                'title_en' => 'Updated Notice Title By Coordinator',
            ]);
    }

    public function test_authorized_user_can_delete_notice(): void
    {
        $notice = Notice::create([
            'title_bn' => 'মুছে ফেলার নোটিশ',
            'title_en' => 'Notice to Delete',
            'content_bn' => 'বিবরণ',
            'content_en' => 'Description',
            'category' => 'general',
            'priority' => 'low',
            'target_audience' => 'all',
            'created_by' => $this->admin->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/v1/notices/{$notice->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('notices', ['id' => $notice->id]);
    }
}