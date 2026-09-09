import React, { useState, useEffect } from 'react';
import { Card, Button, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from '../../locales/i18n';
import { ArrowLeft, ArrowRight, Save, Send } from 'lucide-react';
import { academicApi } from '../../api/academic';
import { lessonPlansApi } from '../../api/lessonPlans';
import { toast } from 'react-toastify';
import type { AcademicYear, SchoolClass, Subject } from '../../types/academic';
import type { LessonPlanFormData } from '../../types/lessonPlan';
import { Step1BasicInfo } from '../../components/lesson-plan/Step1BasicInfo';
import { Step2LearningInfo } from '../../components/lesson-plan/Step2LearningInfo';
import { Step3ActivitiesTable } from '../../components/lesson-plan/Step3ActivitiesTable';
import { Step4Assessment } from '../../components/lesson-plan/Step4Assessment';
import { Step5PreviewSubmission } from '../../components/lesson-plan/Step5PreviewSubmission';

const initialFormData: LessonPlanFormData = {
  academic_year_id: '',
  term_id: '',
  class_id: '',
  section_id: '',
  subject_id: '',
  chapter_id: '',
  title: '',
  topic: '',
  lesson_date: new Date().toISOString().split('T')[0],
  duration_minutes: 45,
  period_number: 1,
  student_count: 40,
  curriculum_reference: '',
  competency: '',
  previous_knowledge: '',
  key_vocabulary: '',
  teaching_method: 'Interactive Discussion & Q/A, Lecture & Board Demonstration',
  teaching_materials: 'Whiteboard, Marker, Prescribed Textbook',
  digital_resources: '',
  reference_book: 'NCTB Prescribed Textbook',
  formative_assessment: 'Oral question-answering and guided problem solving on board',
  assessment_questions: '',
  success_criteria: 'Students can accurately solve practice problems',
  homework: 'Complete textbook exercise problems',
  remedial_activities: 'Individual teacher support and peer tutoring',
  advanced_learner_activities: 'Challenging real-world extension questions',
  inclusive_education_support: '',
  special_needs_support: '',
  teacher_reflection: '',
  additional_notes: '',
  outcomes: [
    { outcome_text: 'Understand the fundamental concepts and definitions', sort_order: 1 },
    { outcome_text: 'Apply formulas to solve standard mathematical problems', sort_order: 2 },
  ],
  activities: [
    { stage: 'introduction', duration_minutes: 5, teacher_activities: 'Warm-up hook questions to recall prior concepts', student_activities: 'Active response and discussion', sort_order: 1 },
    { stage: 'presentation', duration_minutes: 15, teacher_activities: 'Direct instruction and formula breakdown on board', student_activities: 'Note taking and conceptual understanding', sort_order: 2 },
    { stage: 'guided_practice', duration_minutes: 10, teacher_activities: 'Facilitate paired problem-solving exercises', student_activities: 'Collaborative problem solving in pairs', sort_order: 3 },
    { stage: 'group_work', duration_minutes: 10, teacher_activities: 'Assign application problems to groups', student_activities: 'Group work and board presentation', sort_order: 4 },
    { stage: 'conclusion', duration_minutes: 5, teacher_activities: 'Summarize key takeaways and assign homework', student_activities: 'Note down homework and clarify doubts', sort_order: 5 },
  ],
};

export const CreateLessonPlan: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<LessonPlanFormData>(initialFormData);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPrerequisites();
  }, [id]);

  const loadPrerequisites = async () => {
    setLoading(true);
    try {
      const [yearsRes, classesRes, subjectsRes] = await Promise.all([
        academicApi.getAcademicYears(),
        academicApi.getClasses(),
        academicApi.getSubjects(),
      ]);

      const yearsData = yearsRes.data || [];
      const classesData = classesRes.data || [];
      const subjectsData = subjectsRes.data || [];

      setAcademicYears(yearsData);
      setClasses(classesData);
      setSubjects(subjectsData);

      const activeYear = yearsData.find((y: AcademicYear) => y.is_current);
      if (activeYear && !id) {
        setFormData((prev) => ({
          ...prev,
          academic_year_id: activeYear.id,
          term_id: activeYear.terms?.[0]?.id || '',
        }));
      }

      // Check if template data passed via router state
      if (location.state && (location.state as any).templateData) {
        const tpl = (location.state as any).templateData;
        setFormData((prev) => ({
          ...prev,
          ...tpl,
          title: tpl.title || prev.title,
        }));
      }

      if (id) {
        const planRes = await lessonPlansApi.getLessonPlan(Number(id));
        const plan = planRes.data;
        setFormData({
          academic_year_id: plan.academic_year?.id || plan.academicYear?.id || '',
          term_id: plan.term?.id || '',
          class_id: plan.school_class?.id || plan.schoolClass?.id || '',
          section_id: plan.section?.id || '',
          subject_id: plan.subject?.id || '',
          chapter_id: plan.chapter?.id || '',
          title: plan.title || '',
          topic: plan.topic || '',
          lesson_date: plan.lesson_date || '',
          duration_minutes: plan.duration_minutes || 45,
          period_number: plan.period_number || 1,
          student_count: plan.student_count || 40,
          curriculum_reference: plan.curriculum_reference || '',
          competency: plan.competency || '',
          previous_knowledge: plan.previous_knowledge || '',
          key_vocabulary: plan.key_vocabulary || '',
          teaching_method: plan.teaching_method || '',
          teaching_materials: plan.teaching_materials || '',
          digital_resources: plan.digital_resources || '',
          reference_book: plan.reference_book || '',
          formative_assessment: plan.formative_assessment || '',
          assessment_questions: plan.assessment_questions || '',
          success_criteria: plan.success_criteria || '',
          homework: plan.homework || '',
          remedial_activities: plan.remedial_activities || '',
          advanced_learner_activities: plan.advanced_learner_activities || '',
          inclusive_education_support: plan.inclusive_education_support || '',
          special_needs_support: plan.special_needs_support || '',
          teacher_reflection: plan.teacher_reflection || '',
          additional_notes: plan.additional_notes || '',
          outcomes: plan.outcomes && plan.outcomes.length > 0 ? plan.outcomes : initialFormData.outcomes,
          activities: plan.activities && plan.activities.length > 0 ? plan.activities : initialFormData.activities,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lesson plan prerequisites');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (fields: Partial<LessonPlanFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.title || !formData.topic || !formData.academic_year_id || !formData.term_id || !formData.class_id || !formData.section_id || !formData.subject_id || !formData.lesson_date) {
        toast.warning('Please fill in all required fields on Step 1 (Title, Topic, Year, Term, Class, Section, Subject, Date)');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = async (submitAfterSave = false) => {
    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        submit_now: submitAfterSave,
      };

      let savedPlanId = Number(id);
      if (id) {
        await lessonPlansApi.updateLessonPlan(savedPlanId, payload);
      } else {
        const createRes = await lessonPlansApi.createLessonPlan(payload);
        savedPlanId = createRes.data.id;
      }

      if (formData.attachment instanceof File) {
        await lessonPlansApi.uploadAttachment(savedPlanId, formData.attachment);
      }

      if (submitAfterSave && id) {
        await lessonPlansApi.submit(savedPlanId, 'Plan submitted for review.');
      }

      toast.success(submitAfterSave ? 'Lesson plan submitted successfully!' : 'Lesson plan saved as draft!');
      navigate(`/lesson-plans/${savedPlanId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save lesson plan';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles = [
    t('lesson_plans.step1'),
    t('lesson_plans.step2'),
    t('lesson_plans.step3'),
    t('lesson_plans.step4'),
    t('lesson_plans.step5'),
  ];

  const progressPercent = (currentStep / 5) * 100;

  if (loading) {
    return <div className="p-4 text-center">Loading lesson plan editor...</div>;
  }

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0">
            {id ? t('lesson_plans.edit_title') : t('nav.create_lesson_plan')}
          </h4>
          <span className="text-muted small">5-Stage Lesson Plan Creation & Review Preparation</span>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/lesson-plans')}>
          <ArrowLeft size={16} className="me-1" /> {t('common.cancel')}
        </Button>
      </div>

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      {/* Step Progress Bar */}
      <Card className="mb-4 border shadow-sm">
        <Card.Body className="p-2 p-md-3">
          <div 
            className="d-flex justify-content-between text-muted small fw-semibold mb-2 overflow-x-auto gap-2 text-nowrap pb-1"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {stepTitles.map((title, idx) => (
              <span
                key={idx}
                className={`cursor-pointer px-2 py-1 rounded ${currentStep === idx + 1 ? 'text-primary fw-bold bg-primary-subtle' : currentStep > idx + 1 ? 'text-success' : ''}`}
                onClick={() => setCurrentStep(idx + 1)}
              >
                {idx + 1}. {title}
              </span>
            ))}
          </div>
          <ProgressBar now={progressPercent} variant="primary" style={{ height: '6px' }} />
        </Card.Body>
      </Card>

      {/* Step Content Card */}
      <Card className="border shadow-sm mb-4">
        <Card.Body className="p-4">
          {currentStep === 1 && (
            <Step1BasicInfo
              formData={formData}
              updateFormData={updateFormData}
              academicYears={academicYears}
              classes={classes}
              subjects={subjects}
            />
          )}

          {currentStep === 2 && (
            <Step2LearningInfo formData={formData} updateFormData={updateFormData} />
          )}

          {currentStep === 3 && (
            <Step3ActivitiesTable formData={formData} updateFormData={updateFormData} />
          )}

          {currentStep === 4 && (
            <Step4Assessment formData={formData} updateFormData={updateFormData} />
          )}

          {currentStep === 5 && (
            <Step5PreviewSubmission
              formData={formData}
              academicYears={academicYears}
              classes={classes}
              subjects={subjects}
            />
          )}
        </Card.Body>

        <Card.Footer className="bg-light p-3 d-flex justify-content-between align-items-center">
          <Button
            variant="outline-secondary"
            onClick={handlePrev}
            disabled={currentStep === 1 || submitting}
          >
            <ArrowLeft size={16} className="me-1" /> {t('common.previous')}
          </Button>

          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              onClick={() => handleSave(false)}
              disabled={submitting}
            >
              <Save size={16} className="me-1" /> {t('lesson_plans.save_draft')}
            </Button>

            {currentStep < 5 ? (
              <Button variant="primary" onClick={handleNext}>
                {t('common.next')} <ArrowRight size={16} className="ms-1" />
              </Button>
            ) : (
              <Button
                variant="success"
                onClick={() => handleSave(true)}
                disabled={submitting}
              >
                <Send size={16} className="me-1" /> {t('lesson_plans.submit')}
              </Button>
            )}
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};