import React from 'react';
import { Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { Plus, Trash2, Paperclip, UploadCloud, CheckCircle2 } from 'lucide-react';
import type { LessonPlanFormData } from '../../types/lessonPlan';

interface Props {
  formData: LessonPlanFormData;
  updateFormData: (fields: Partial<LessonPlanFormData>) => void;
}

const TEACHING_METHODS = [
  'Interactive Discussion & Q/A',
  'Lecture & Board Demonstration',
  'Guided Pair Work & Group Activity',
  'Problem-Based Practical Solving',
  'Digital Smartboard Presentation',
  'Inquiry-Based Discovery Learning',
];

export const Step2LearningInfo: React.FC<Props> = ({ formData, updateFormData }) => {
  const { t } = useTranslation();

  const addOutcome = () => {
    const updated = [
      ...formData.outcomes,
      { outcome_text: '', sort_order: formData.outcomes.length + 1 },
    ];
    updateFormData({ outcomes: updated });
  };

  const updateOutcomeText = (index: number, text: string) => {
    const updated = [...formData.outcomes];
    updated[index] = { ...updated[index], outcome_text: text };
    updateFormData({ outcomes: updated });
  };

  const removeOutcome = (index: number) => {
    const updated = formData.outcomes.filter((_, i) => i !== index);
    updateFormData({ outcomes: updated });
  };

  const toggleTeachingMethod = (method: string) => {
    const current = formData.teaching_method ? formData.teaching_method.split(', ') : [];
    let updated: string[];
    if (current.includes(method)) {
      updated = current.filter((m) => m !== method);
    } else {
      updated = [...current, method];
    }
    updateFormData({ teaching_method: updated.join(', ') });
  };

  const currentMethods = formData.teaching_method ? formData.teaching_method.split(', ') : [];

  return (
    <div>
      <h5 className="border-bottom pb-2 mb-4 text-primary fw-bold">
        {t('lesson_plans.step2')} - {t('lesson_plans.learning_info')}
      </h5>

      <Row className="g-4">
        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.previous_knowledge')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="What students should already know before this lesson..."
              value={formData.previous_knowledge}
              onChange={(e) => updateFormData({ previous_knowledge: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.competency')}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="National curriculum competency or learning standard..."
              value={formData.competency}
              onChange={(e) => updateFormData({ competency: e.target.value })}
            />
          </Form.Group>
        </Col>

        {/* Measurable Outcomes Table */}
        <Col md={12}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <Form.Label className="fw-semibold mb-0">
                {t('lesson_plans.learning_outcomes')} (Measurable Student Objectives)
              </Form.Label>
              <div className="text-muted small">
                By the end of the lesson, what will students know, understand, and be able to do?
              </div>
            </div>
            <Button size="sm" variant="outline-primary" onClick={addOutcome}>
              <Plus size={14} className="me-1" /> Add Outcome
            </Button>
          </div>

          {formData.outcomes.length === 0 ? (
            <div className="p-3 bg-light text-center rounded border border-dashed text-muted mb-3">
              No specific outcomes added yet. Click "+ Add Outcome" to specify measurable objectives.
            </div>
          ) : (
            <Table responsive bordered hover size="sm" className="align-middle mb-3">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Outcome Description (Actionable Statement)</th>
                  <th style={{ width: '60px' }}></th>
                </tr>
              </thead>
              <tbody>
                {formData.outcomes.map((out, idx) => (
                  <tr key={idx}>
                    <td className="text-center fw-bold">{idx + 1}</td>
                    <td>
                      <Form.Control
                        size="sm"
                        type="text"
                        placeholder="e.g. Solve quadratic equations by algebraic factorization"
                        value={out.outcome_text}
                        onChange={(e) => updateOutcomeText(idx, e.target.value)}
                        required
                      />
                    </td>
                    <td className="text-center">
                      <Button
                        size="sm"
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => removeOutcome(idx)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Col>

        {/* Teaching Methods Multi-Tags */}
        <Col md={12}>
          <Form.Label className="fw-semibold">{t('lesson_plans.teaching_method')}</Form.Label>
          <div className="d-flex flex-wrap gap-2 mb-2">
            {TEACHING_METHODS.map((m) => {
              const isChecked = currentMethods.includes(m);
              return (
                <Badge
                  key={m}
                  bg={isChecked ? 'primary' : 'light'}
                  text={isChecked ? 'white' : 'dark'}
                  className="border p-2 cursor-pointer"
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleTeachingMethod(m)}
                >
                  {isChecked ? '✓ ' : '+ '} {m}
                </Badge>
              );
            })}
          </div>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.teaching_materials')}</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Whiteboard, Geometry box, Formula Chart"
              value={formData.teaching_materials}
              onChange={(e) => updateFormData({ teaching_materials: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.digital_resources')}</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. PowerPoint slide deck, YouTube video link"
              value={formData.digital_resources}
              onChange={(e) => updateFormData({ digital_resources: e.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group>
            <Form.Label className="fw-semibold">{t('lesson_plans.reference_book')}</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. NCTB Prescribed Textbook, Page 142-146"
              value={formData.reference_book}
              onChange={(e) => updateFormData({ reference_book: e.target.value })}
            />
          </Form.Group>
        </Col>

        {/* Supplementary / Main Document Attachment */}
        <Col md={12}>
          <div className="p-3 bg-light rounded border">
            <Form.Label className="fw-bold d-flex align-items-center mb-1">
              <Paperclip size={18} className="me-2 text-primary" />
              পাঠ পরিকল্পনা ফাইল / ডকুমেন্ট সংযুক্তকরণ (Attach Lesson Plan Document)
            </Form.Label>
            <p className="text-muted small mb-2">
              আপনার তৈরিকৃত পাঠ পরিকল্পনার PDF, Word, Excel অথবা হাতে লেখা পাতার ছবি সরাসরি সংযুক্ত করতে পারেন (সর্বোচ্চ ২০ MB)।
            </p>

            {formData.attachment ? (
              <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border">
                <div className="d-flex align-items-center">
                  <CheckCircle2 size={20} className="text-success me-2" />
                  <span className="fw-semibold small">{formData.attachment.name}</span>
                  <span className="text-muted small ms-2">
                    ({(formData.attachment.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => updateFormData({ attachment: null })}
                >
                  <Trash2 size={14} className="me-1" /> Remove
                </Button>
              </div>
            ) : (
              <div>
                <Form.Label
                  htmlFor="step2-file-upload"
                  className="btn btn-sm btn-outline-primary mb-0 cursor-pointer d-inline-flex align-items-center"
                >
                  <UploadCloud size={16} className="me-1" />
                  ফাইল সিলেক্ট করুন (Choose PDF / Word / Image)
                </Form.Label>
                <input
                  id="step2-file-upload"
                  type="file"
                  className="d-none"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      updateFormData({ attachment: e.target.files[0] });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};