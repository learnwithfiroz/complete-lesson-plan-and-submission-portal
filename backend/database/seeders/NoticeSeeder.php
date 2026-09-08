<?php

namespace Database\Seeders;

use App\Models\Notice;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class NoticeSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@bsisc.edu.bd')->first() ?? User::first();
        $principal = User::where('email', 'principal@bsisc.edu.bd')->first() ?? $admin;
        $coordinator = User::where('email', 'coordinator@bsisc.edu.bd')->first() ?? $admin;

        $notices = [
            [
                'title_bn' => 'জরুরি: প্রথম সাময়িক পরীক্ষার পাঠ পরিকল্পনা জমাদানের শেষ সময়সীমা',
                'title_en' => 'URGENT: Term 1 Lesson Plan Submission Deadline for Teachers',
                'content_bn' => 'সকল সম্মানিত শিক্ষকবৃন্দকে জানানো যাচ্ছে যে, ২০২৬ শিক্ষাবর্ষের ১ম সাময়িক পরীক্ষার জন্য সকল নির্ধারিত বিষয়ের পূর্ণাঙ্গ পাঠ পরিকল্পনা আগামী ১৫ সেপ্টেম্বর ২০২৬ এর মধ্যে সিস্টেমে জমা দেওয়া বাধ্যতামূলক। পাঠ পরিকল্পনায় শিক্ষাক্রমের শিখনফল এবং ব্লুমস ট্যাক্সোনমি স্তর যথাযথভাবে উল্লেখ থাকতে হবে।',
                'content_en' => 'All esteemed faculty members of BSISC (EIIN: 133988) are hereby requested to submit their comprehensive lesson plans for Term 1 by September 15, 2026. Please ensure all pedagogical outcomes, activity timings, and Bloom\'s Taxonomy domains are thoroughly mapped.',
                'category' => 'urgent',
                'priority' => 'urgent',
                'target_audience' => 'teachers',
                'is_pinned' => true,
                'is_published' => true,
                'publish_date' => Carbon::now()->subDays(1),
                'expiry_date' => Carbon::now()->addDays(30),
                'created_by' => $principal->id,
            ],
            [
                'title_bn' => 'পাঠ পরিকল্পনায় ব্লুমস ট্যাক্সোনমি ও অ্যাক্টিভিটি টাইম ক্যালকুলেটর ব্যবহারের নির্দেশিকা',
                'title_en' => 'Guidelines on Bloom\'s Taxonomy & Activity Duration Calculator',
                'content_bn' => 'সমন্বয়ক পরিষদ কর্তৃক অনুমোদিত নতুন মানদণ্ড অনুযায়ী প্রতিটি পাঠ পরিকল্পনায় ওয়ার্ম-আপ, শিক্ষক উপস্থাপন, দলগত কাজ এবং মূল্যায়নের সময়সীমা নির্ধারিত মোট সময়ের সাথে শতভাগ সামঞ্জস্যপূর্ণ হতে হবে। সিস্টেমের লাইভ টাইম ক্যালকুলেটর ব্যবহার করার পরামর্শ দেওয়া হচ্ছে।',
                'content_en' => 'In accordance with Academic Council standards, all lesson plans must balance duration across Warm-up, Teacher Presentation, Guided Practice, and Plenary. Teachers are instructed to utilize the system\'s real-time duration calculator to eliminate timing discrepancies.',
                'category' => 'curriculum',
                'priority' => 'high',
                'target_audience' => 'teachers',
                'is_pinned' => true,
                'is_published' => true,
                'publish_date' => Carbon::now()->subDays(2),
                'expiry_date' => Carbon::now()->addDays(60),
                'created_by' => $coordinator->id,
            ],
            [
                'title_bn' => 'শিক্ষক ও সমন্বয়কদের নিয়ে বিশেষ একাডেমিক মতবিনিময় সভা',
                'title_en' => 'Special Academic Review & Coordination Meeting with Principal',
                'content_bn' => 'আগামীকাল বেলা ১২:০০ ঘটিকায় কলেজ সম্মেলন কক্ষে অধ্যক্ষ মহোদয়ের সভাপতিত্বে বিশেষ একাডেমিক সমন্বয় সভা অনুষ্ঠিত হবে। সকল বিভাগীয় প্রধান ও সমন্বয়কদের ডিজিটাল পাঠ পরিকল্পনা অগ্রগতি প্রতিবেদন সঙ্গে আনার জন্য অনুরোধ করা হলো।',
                'content_en' => 'A mandatory curriculum review meeting will be held tomorrow at 12:00 PM in the College Conference Room presided over by the Principal. All Department Heads and Coordinators are requested to bring their current lesson plan approval and review status reports.',
                'category' => 'academic',
                'priority' => 'high',
                'target_audience' => 'coordinators',
                'is_pinned' => false,
                'is_published' => true,
                'publish_date' => Carbon::now()->subHours(6),
                'expiry_date' => Carbon::now()->addDays(7),
                'created_by' => $principal->id,
            ],
            [
                'title_bn' => 'বিএসআইএসসি ডিজিটাল পাঠ পরিকল্পনা ব্যবস্থাপনা প্ল্যাটফর্ম ১.০ চালু',
                'title_en' => 'BSISC Digital Lesson Plan Management System v1.0 Launched',
                'content_bn' => 'বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজের (স্কুল কোড: ১২৪২, কলেজ কোড: ১৭৬০) সকল সম্মানিত শিক্ষক, সমন্বয়ক ও প্রশাসনের জন্য অত্যাধুনিক ডিজিটাল পাঠ পরিকল্পনা ও পর্যবেক্ষণ প্ল্যাটফর্ম আনুষ্ঠানিকভাবে চালু হয়েছে।',
                'content_en' => 'We are pleased to announce the full operational rollout of the BSISC Digital Lesson Plan System for Baridhara Scholars\' International School & College (DOHS Baridhara, Dhaka Cantonment). This system empowers dynamic curriculum design, multi-stage reviews, calendar scheduling, and instant DomPDF reporting.',
                'category' => 'general',
                'priority' => 'normal',
                'target_audience' => 'all',
                'is_pinned' => false,
                'is_published' => true,
                'publish_date' => Carbon::now()->subDays(3),
                'expiry_date' => Carbon::now()->addDays(90),
                'created_by' => $admin->id,
            ],
            [
                'title_bn' => 'বিজ্ঞান বিভাগের ল্যাব ক্লাস পরিকল্পনা ও সুরক্ষা নীতিমালা সংযুক্তি',
                'title_en' => 'Science Department: Practical Lab Safety Protocol in Lesson Plans',
                'content_bn' => 'নবম ও দশম শ্রেণীর পদার্থ, রসায়ন এবং জীববিজ্ঞান বিষয়ের শিক্ষকদের ব্যবহারিক ক্লাসের পাঠ পরিকল্পনায় বিশেষ সুরক্ষা নির্দেশিকা ও প্রয়োজনীয় রাসায়নিক/যন্ত্রপাতির তালিকা সংযুক্ত করার নির্দেশ দেওয়া হচ্ছে।',
                'content_en' => 'Science faculty members teaching Classes IX-XII are required to explicitly attach laboratory safety measures and required apparatus checklists in Step 3 (Activities & Resources) of their lesson plans.',
                'category' => 'curriculum',
                'priority' => 'normal',
                'target_audience' => 'teachers',
                'is_pinned' => false,
                'is_published' => true,
                'publish_date' => Carbon::now()->subDays(4),
                'expiry_date' => Carbon::now()->addDays(45),
                'created_by' => $coordinator->id,
            ],
        ];

        foreach ($notices as $n) {
            Notice::updateOrCreate(
                ['title_en' => $n['title_en']],
                $n
            );
        }
    }
}