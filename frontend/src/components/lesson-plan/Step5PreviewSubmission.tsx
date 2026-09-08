import React from 'react';
import { Card, Table, Alert, Row, Col } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { Calendar, User, Clock, BookOpen } from 'lucide-react';
import type { LessonPlanFormData } from '../../types/lessonPlan';
import type { AcademicYear, SchoolClass, Subject } from '../../types/academic';

interface Props {
  formData: LessonPlanFormData;
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  subjects: Subject[];
}

export const Step5PreviewSubmission: React.FC<Props> = ({
  formData,
  academicYears,
  classes,
  subjects,
}) => {
  const { t, language } = useTranslation();

  const selectedClass = classes.find((c) => c.id === Number(formData.class_id));
  const selectedSection = selectedClass?.sections?.find((s) => s.id === Number(formData.section_id));
  const selectedSubject = subjects.find((s) => s.id === Number(formData.subject_id));
  const selectedChapter = selectedSubject?.chapters?.find((ch) => ch.id === Number(formData.chapter_id));
  const selectedYear = academicYears.find((y) => y.id === Number(formData.academic_year_id));
  const selectedTerm = selectedYear?.terms?.find((tm) => tm.id === Number(formData.term_id));

  const totalActivityDuration = formData.activities.reduce(
    (sum, a) => sum + (Number(a.duration_minutes) || 0),
    0
  );
  const isDurationMatched = totalActivityDuration === Number(formData.duration_minutes);

  return (
    <div>
      <h5 className="border-bottom pb-2 mb-4 text-primary fw-bold">
        {t('lesson_plans.step5')} - {t('lesson_plans.preview')} & Submission
      </h5>

      {!isDurationMatched && (
        <Alert variant="warning" className="d-flex align-items-center mb-4">
          <div>
            <strong>Duration Notice:</strong> Planned duration is {formData.duration_minutes} mins, but activity phases total {totalActivityDuration} mins.
          </div>
        </Alert>
      )}

      {/* Institutional Plan Header */}
      <Card className="border mb-4 shadow-sm">
        <Card.Header className="bg-primary text-white py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-0 fw-bold">{formData.title || 'Untitled Lesson Plan'}</h5>
              <div className="small opacity-75">{formData.topic || 'No topic specified'}</div>
            </div>
            <span className="badge bg-light text-dark px-3 py-2 fs-6">DRAFT PREVIEW</span>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3 mb-3">
            <Col md={3}>
              <div className="d-flex align-items-center text-muted small">
                <Calendar size={16} className="me-2 text-primary" /> {t('lesson_plans.lesson_date')}
              </div>
              <div className="fw-bold">{formData.lesson_date || 'N/A'}</div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center text-muted small">
                <Clock size={16} className="me-2 text-primary" /> {t('lesson_plans.duration')} / {t('lesson_plans.period')}
              </div>
              <div className="fw-bold">
                {formData.duration_minutes} Mins (Period {formData.period_number})
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center text-muted small">
                <BookOpen size={16} className="me-2 text-primary" /> {t('classes_sections.class_name')} & {t('classes_sections.section_name')}
              </div>
              <div className="fw-bold">
                {language === 'bn' ? selectedClass?.name_bn : selectedClass?.name_en}{' '}
                {selectedSection ? `(${language === 'bn' ? selectedSection.name_bn : selectedSection.name_en})` : ''}
              </div>
            </Col>
            <Col md={3}>
              <div className="d-flex align-items-center text-muted small">
                <User size={16} className="me-2 text-primary" /> {t('subjects_chapters.subject_name')}
              </div>
              <div className="fw-bold">
                {language === 'bn' ? selectedSubject?.name_bn : selectedSubject?.name_en} ({selectedYear?.name} {selectedTerm ? `- ${language === 'bn' ? selectedTerm.name_bn : selectedTerm.name_en}` : ''})
              </div>
            </Col>
          </Row>

          {selectedChapter && (
            <div className="p-2 bg-light rounded border mb-3 small">
              <strong>Chapter:</strong> Ch {selectedChapter.chapter_no}: {language === 'bn' ? selectedChapter.title_bn : selectedChapter.title_en}
            </div>
          )}

          {/* 1. Outcomes */}
          <h6 className="fw-bold text-dark border-bottom pb-1 mt-4">1. Learning Objectives & Outcomes</h6>
          {formData.previous_knowledge && (
            <p className="mb-2 small">
              <strong>Prior Knowledge:</strong> {formData.previous_knowledge}
            </p>
          )}
          {formData.outcomes.length > 0 ? (
            <ul className="small mb-3">
              {formData.outcomes.map((o, idx) => (
                <li key={idx}>{o.outcome_text}</li>
              ))}
            </ul>
          ) : (
            <div className="text-muted small mb-3">No specific outcomes specified.</div>
          )}

          {/* 2. Teaching Methods & Resources */}
          <h6 className="fw-bold text-dark border-bottom pb-1 mt-4">2. Methodology & Resources</h6>
          <Row className="mb-3 small">
            <Col md={6}>
              <strong>Teaching Method:</strong> {formData.teaching_method || 'Interactive Discussion & Demonstration'}
            </Col>
            <Col md={6}>
              <strong>Teaching Materials:</strong> {formData.teaching_materials || 'Standard classroom materials'}
            </Col>
          </Row>

          {/* 3. 5-Phase Procedure */}
          <h6 className="fw-bold text-dark border-bottom pb-1 mt-4">3. Step-by-Step Lesson Procedure</h6>
          <Table responsive bordered hover size="sm" className="small align-middle mb-3">
            <thead className="table-light">
              <tr>
                <th style={{ width: '130px' }}>Stage</th>
                <th style={{ width: '80px' }}>Time</th>
                <th>Teacher Activity</th>
                <th>Student Activity</th>
              </tr>
            </thead>
            <tbody>
              {formData.activities.map((act, idx) => (
                <tr key={idx}>
                  <td className="fw-bold text-capitalize">{act.stage.replace('_', ' ')}</td>
                  <td>{act.duration_minutes} mins</td>
                  <td>{act.teacher_activities}</td>
                  <td>{act.student_activities}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* 4. Assessment & Follow-up */}
          <h6 className="fw-bold text-dark border-bottom pb-1 mt-4">4. Assessment & Follow-up</h6>
          <Row className="small">
            <Col md={6}>
              <strong>Support for Struggling Learners:</strong> {formData.remedial_activities || 'N/A'}
            </Col>
            <Col md={6}>
              <strong>Extension for Advanced Learners:</strong> {formData.advanced_learner_activities || 'N/A'}
            </Col>
            <Col md={12} className="mt-2">
              <strong>Homework Assigned:</strong> {formData.homework || 'None'}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};