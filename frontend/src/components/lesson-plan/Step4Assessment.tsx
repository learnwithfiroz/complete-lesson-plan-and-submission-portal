import React from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import type { LessonPlanFormData } from '../../types/lessonPlan';

interface Props {
  formData: LessonPlanFormData;
  updateFormData: (fields: Partial<LessonPlanFormData>) => void;
}

export const Step4Assessment: React.FC<Props> = ({ formData, updateFormData }) => {
  const { t } = useTranslation();

  return (
    <div>
      <h5 className="border-bottom pb-2 mb-4 text-primary fw-bold">
        {t('lesson_plans.step4')} - {t('lesson_plans.assessment')} & Differentiation
      </h5>

      <Row className="g-3">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.formative_assessment')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="e.g. Exit ticket questionnaire, oral questioning during presentation..."
              value={formData.formative_assessment}
              onChange={(e) => updateFormData({ formative_assessment: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.success_criteria')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="e.g. Students can correctly factorize at least 4 out of 5 quadratic expressions..."
              value={formData.success_criteria}
              onChange={(e) => updateFormData({ success_criteria: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.remedial_activities')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Support strategies, peer mentoring, and simpler step-by-step guidance..."
              value={formData.remedial_activities}
              onChange={(e) => updateFormData({ remedial_activities: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.advanced_learner')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Extension problems, higher-order thinking challenge questions..."
              value={formData.advanced_learner_activities}
              onChange={(e) => updateFormData({ advanced_learner_activities: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.homework')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Exercises from textbook, practice worksheet, or reading assignment..."
              value={formData.homework}
              onChange={(e) => updateFormData({ homework: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={12}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.teacher_reflection')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Self-reflection notes to fill in after delivering this lesson..."
              value={formData.teacher_reflection}
              onChange={(e) => updateFormData({ teacher_reflection: e.target.value })}
            />
          </Form.Group>
        </Col>
      </Row>
    </div>
  );
};