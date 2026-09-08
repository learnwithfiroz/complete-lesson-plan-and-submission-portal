import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import type { LessonPlanFormData } from '../../types/lessonPlan';
import type { AcademicYear, SchoolClass, Subject } from '../../types/academic';

interface Props {
  formData: LessonPlanFormData;
  updateFormData: (fields: Partial<LessonPlanFormData>) => void;
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  subjects: Subject[];
}

export const Step1BasicInfo: React.FC<Props> = ({
  formData,
  updateFormData,
  academicYears,
  classes,
  subjects,
}) => {
  const { t, language } = useTranslation();

  const selectedClass = classes.find((c) => c.id === Number(formData.class_id));
  const availableSections = selectedClass?.sections || [];

  const selectedSubject = subjects.find((s) => s.id === Number(formData.subject_id));
  const availableChapters = selectedSubject?.chapters || [];

  const selectedYear = academicYears.find((y) => y.id === Number(formData.academic_year_id));
  const availableTerms = selectedYear?.terms || [];

  return (
    <div>
      <h5 className="border-bottom pb-2 mb-4 text-primary fw-bold">
        {t('lesson_plans.step1')} - {t('lesson_plans.basic_info')}
      </h5>

      <Row className="g-3">
        <Col md={8}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('lesson_plans.lesson_title')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={language === 'bn' ? 'যেমন: দ্বিঘাত সমীকরণ ও বাস্তব সমস্যা সমাধান' : 'e.g. Solving Quadratic Equations'}
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              required
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('lesson_plans.topic')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={language === 'bn' ? 'যেমন: অধ্যায় ৫ - সমীকরণ' : 'e.g. Chapter 5 - Equations'}
              value={formData.topic}
              onChange={(e) => updateFormData({ topic: e.target.value })}
              required
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('academic_years.year_name')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.academic_year_id}
              onChange={(e) => updateFormData({ academic_year_id: e.target.value ? Number(e.target.value) : '', term_id: '' })}
              required
            >
              <option value="">-- {t('common.select')} --</option>
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.is_current ? `(${t('academic_years.current_active')})` : ''}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('academic_years.term_name')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.term_id}
              onChange={(e) => updateFormData({ term_id: e.target.value ? Number(e.target.value) : '' })}
              disabled={!formData.academic_year_id}
              required
            >
              <option value="">-- {t('common.select')} --</option>
              {availableTerms.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {language === 'bn' ? tm.name_bn : tm.name_en}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('lesson_plans.lesson_date')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="date"
              value={formData.lesson_date}
              onChange={(e) => updateFormData({ lesson_date: e.target.value })}
              required
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('classes_sections.class_name')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.class_id}
              onChange={(e) => updateFormData({ class_id: e.target.value ? Number(e.target.value) : '', section_id: '' })}
              required
            >
              <option value="">-- {t('common.select')} --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {language === 'bn' ? c.name_bn : c.name_en}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('classes_sections.section_name')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.section_id}
              onChange={(e) => updateFormData({ section_id: e.target.value ? Number(e.target.value) : '' })}
              disabled={!formData.class_id}
              required
            >
              <option value="">-- {t('common.select')} --</option>
              {availableSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {language === 'bn' ? s.name_bn : s.name_en}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">
              {t('subjects_chapters.subject_name')} <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={formData.subject_id}
              onChange={(e) => updateFormData({ subject_id: e.target.value ? Number(e.target.value) : '', chapter_id: '' })}
              required
            >
              <option value="">-- {t('common.select')} --</option>
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {language === 'bn' ? sub.name_bn : sub.name_en} ({sub.code})
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('subjects_chapters.chapter_title')}</Form.Label>
            <Form.Select
              value={formData.chapter_id}
              onChange={(e) => updateFormData({ chapter_id: e.target.value ? Number(e.target.value) : '' })}
              disabled={!formData.subject_id || availableChapters.length === 0}
            >
              <option value="">-- {t('common.select')} --</option>
              {availableChapters.map((ch) => (
                <option key={ch.id} value={ch.id}>
                  Ch {ch.chapter_no}: {language === 'bn' ? ch.title_bn : ch.title_en}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={2} sm={4} xs={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.duration')} (Mins)</Form.Label>
            <Form.Control
              type="number"
              min={15}
              max={180}
              step={5}
              value={formData.duration_minutes}
              onChange={(e) => updateFormData({ duration_minutes: Number(e.target.value) })}
            />
          </Form.Group>
        </Col>

        <Col md={2} sm={4} xs={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.period')}</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={10}
              value={formData.period_number}
              onChange={(e) => updateFormData({ period_number: Number(e.target.value) })}
            />
          </Form.Group>
        </Col>

        <Col md={2} sm={4} xs={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('classes_sections.student_count')}</Form.Label>
            <Form.Control
              type="number"
              min={1}
              max={100}
              value={formData.student_count}
              onChange={(e) => updateFormData({ student_count: Number(e.target.value) })}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};