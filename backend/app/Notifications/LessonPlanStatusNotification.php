<?php

namespace App\Notifications;

use App\Models\LessonPlan;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LessonPlanStatusNotification extends Notification
{
    use Queueable;

    public function __construct(
        public LessonPlan $lessonPlan,
        public string $action,
        public User $actor,
        public ?string $comment = null
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'lesson_plan_id' => $this->lessonPlan->id,
            'lesson_plan_code' => $this->lessonPlan->code,
            'lesson_plan_title' => $this->lessonPlan->title,
            'action' => $this->action,
            'actor_id' => $this->actor->id,
            'actor_name' => $this->actor->name,
            'comment' => $this->comment,
            'status' => $this->lessonPlan->status,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}