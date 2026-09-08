<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lesson Plan - {{ $plan->code }}</title>
    <style>
        @page {
            margin: 20px 25px;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11px;
            color: #1e293b;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f2e5a;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .school-title {
            font-size: 16px;
            font-weight: bold;
            color: #0f2e5a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .school-sub {
            font-size: 10px;
            color: #64748b;
        }
        .doc-badge {
            display: inline-block;
            background-color: #0f2e5a;
            color: #ffffff;
            padding: 3px 12px;
            font-weight: bold;
            border-radius: 4px;
            font-size: 11px;
            margin-top: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 5px 8px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background-color: #f1f5f9;
            color: #0f2e5a;
            font-weight: bold;
            font-size: 10px;
        }
        .meta-table td {
            font-size: 10.5px;
        }
        .meta-label {
            background-color: #f8fafc;
            font-weight: bold;
            width: 18%;
            color: #334155;
        }
        .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #0f2e5a;
            background-color: #e2e8f0;
            padding: 4px 8px;
            margin-top: 10px;
            margin-bottom: 6px;
            border-left: 3px solid #0f2e5a;
        }
        .status-tag {
            font-weight: bold;
            text-transform: uppercase;
            color: #10b981;
        }
        .footer-sig {
            margin-top: 30px;
            width: 100%;
        }
        .sig-box {
            text-align: center;
            border-top: 1px dashed #94a3b8;
            padding-top: 5px;
            font-size: 10px;
            color: #475569;
        }
    </style>
</head>
<body>

    <div class="header">
        <table style="border: none; margin-bottom: 0;">
            <tr style="border: none;">
                <td style="border: none; width: 70px; vertical-align: middle; text-align: center;">
                    @if(file_exists(public_path('images/logo.png')))
                        <img src="data:image/png;base64,{{ base64_encode(file_get_contents(public_path('images/logo.png'))) }}" style="width: 55px; height: 55px;" alt="Logo">
                    @endif
                </td>
                <td style="border: none; text-align: center; vertical-align: middle;">
                    <div class="school-title">Baridhara Scholars' International School and College (BSISC)</div>
                    <div class="school-sub">DOHS, Baridhara, Dhaka Cantonment, Dhaka</div>
                    <div class="school-sub" style="font-weight: bold; color: #0f2e5a; margin-top: 2px;">
                        School EIIN: 133988 &nbsp;|&nbsp; School Code: 1242 &nbsp;|&nbsp; College Code: 1760
                    </div>
                </td>
            </tr>
        </table>
        <div class="doc-badge" style="margin-top: 6px;">OFFICIAL INSTRUCTIONAL LESSON PLAN</div>
    </div>

    <!-- Metadata Table -->
    <table class="meta-table">
        <tr>
            <td class="meta-label">Plan Code:</td>
            <td><strong>{{ $plan->code }}</strong></td>
            <td class="meta-label">Status:</td>
            <td><span class="status-tag">{{ strtoupper($plan->status) }}</span></td>
        </tr>
        <tr>
            <td class="meta-label">Teacher Name:</td>
            <td>{{ $plan->teacher->name }} ({{ $plan->teacher->designation ?? 'Teacher' }})</td>
            <td class="meta-label">Department:</td>
            <td>{{ $plan->teacher->department->name_en ?? 'General' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Academic Year:</td>
            <td>{{ $plan->academicYear->name }} ({{ $plan->term->name_en ?? 'Term' }})</td>
            <td class="meta-label">Class & Section:</td>
            <td>Class {{ $plan->schoolClass->name_en }} (Section: {{ $plan->section->name_en ?? 'All' }})</td>
        </tr>
        <tr>
            <td class="meta-label">Subject:</td>
            <td><strong>{{ $plan->subject->name_en }}</strong> ({{ $plan->subject->code }})</td>
            <td class="meta-label">Date & Period:</td>
            <td>{{ $plan->lesson_date }} | Period {{ $plan->period_number }} ({{ $plan->duration_minutes }} Mins)</td>
        </tr>
        <tr>
            <td class="meta-label">Lesson Title:</td>
            <td colspan="3"><strong>{{ $plan->title }}</strong></td>
        </tr>
        <tr>
            <td class="meta-label">Topic / Unit:</td>
            <td colspan="3">{{ $plan->topic }} @if($plan->chapter) - Chapter {{ $plan->chapter->chapter_no }}: {{ $plan->chapter->title_en }} @endif</td>
        </tr>
    </table>

    <!-- 1. Learning Objectives & Outcomes -->
    <div class="section-title">1. LEARNING OBJECTIVES & COMPETENCIES</div>
    <table>
        <tr>
            <td class="meta-label">Prior Knowledge:</td>
            <td>{{ $plan->previous_knowledge ?? 'Baseline knowledge reviewed' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Curriculum Ref / Competency:</td>
            <td>{{ $plan->competency ?? 'Standard national curriculum competency' }}</td>
        </tr>
    </table>

    @if($plan->outcomes && count($plan->outcomes) > 0)
    <table>
        <thead>
            <tr>
                <th style="width: 30px;">#</th>
                <th>Measurable Learning Outcome (By the end of lesson, student will be able to...)</th>
            </tr>
        </thead>
        <tbody>
            @foreach($plan->outcomes as $idx => $outcome)
            <tr>
                <td style="text-align: center;">{{ $idx + 1 }}</td>
                <td>{{ $outcome->outcome_text }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endif

    <!-- 2. Teaching Methodology & Resources -->
    <div class="section-title">2. TEACHING METHODOLOGY & RESOURCES</div>
    <table>
        <tr>
            <td class="meta-label">Teaching Method:</td>
            <td>{{ $plan->teaching_method ?? 'Interactive Discussion & Demonstration' }}</td>
            <td class="meta-label">Materials:</td>
            <td>{{ $plan->teaching_materials ?? 'Textbook, Whiteboard, Charts' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Digital Resources:</td>
            <td>{{ $plan->digital_resources ?? 'Smartboard presentation' }}</td>
            <td class="meta-label">Reference Book:</td>
            <td>{{ $plan->reference_book ?? 'NCTB Prescribed Textbook' }}</td>
        </tr>
    </table>

    <!-- 3. Step-by-Step Lesson Procedure -->
    <div class="section-title">3. STEP-BY-STEP LESSON ACTIVITIES (5-STAGE PROCEDURE)</div>
    <table>
        <thead>
            <tr>
                <th style="width: 80px;">Stage</th>
                <th style="width: 45px;">Time</th>
                <th>Teacher's Action & Instructions</th>
                <th>Students' Response & Task</th>
                <th>Assessment</th>
            </tr>
        </thead>
        <tbody>
            @foreach($plan->activities as $act)
            <tr>
                <td><strong>{{ ucfirst(str_replace('_', ' ', $act->stage)) }}</strong></td>
                <td style="text-align: center;">{{ $act->duration_minutes }}m</td>
                <td>{{ $act->teacher_activities }}</td>
                <td>{{ $act->student_activities }}</td>
                <td>{{ $act->assessment_method ?? '-' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <!-- 4. Assessment & Differentiation -->
    <div class="section-title">4. ASSESSMENT, DIFFERENTIATION & HOMEWORK</div>
    <table>
        <tr>
            <td class="meta-label">Formative Assessment:</td>
            <td>{{ $plan->formative_assessment ?? 'Questioning & oral feedback' }}</td>
            <td class="meta-label">Success Criteria:</td>
            <td>{{ $plan->success_criteria ?? 'Accurate answers to exercise problems' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Support for Struggling:</td>
            <td>{{ $plan->remedial_activities ?? 'Individual guidance and peer tutoring' }}</td>
            <td class="meta-label">Advanced Learners:</td>
            <td>{{ $plan->advanced_learner_activities ?? 'Challenging extension problems' }}</td>
        </tr>
        <tr>
            <td class="meta-label">Homework Assigned:</td>
            <td colspan="3">{{ $plan->homework ?? 'Complete review exercises' }}</td>
        </tr>
    </table>

    <!-- Signatures -->
    <table style="border: none; margin-top: 35px;">
        <tr style="border: none;">
            <td style="border: none; width: 30%;" class="sig-box">
                {{ $plan->teacher->name }}<br>
                <strong>Prepared by (Teacher)</strong>
            </td>
            <td style="border: none; width: 40%;"></td>
            <td style="border: none; width: 30%;" class="sig-box">
                Academic Coordinator / Principal<br>
                <strong>Reviewed & Approved</strong>
            </td>
        </tr>
    </table>

</body>
</html>