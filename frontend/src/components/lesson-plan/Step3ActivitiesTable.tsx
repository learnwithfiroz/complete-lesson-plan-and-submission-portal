import React from 'react';
import { Table, Button, Form, Alert, Badge } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { Plus, Trash2, Clock } from 'lucide-react';
import type { ActivityStage, LessonPlanActivity, LessonPlanFormData } from '../../types/lessonPlan';

interface Props {
  formData: LessonPlanFormData;
  updateFormData: (fields: Partial<LessonPlanFormData>) => void;
}

const STAGE_OPTIONS: { stage: ActivityStage; label: string; defaultDuration: number }[] = [
  { stage: 'introduction', label: '1. Introduction & Warm-up (Hook & Prior Recall)', defaultDuration: 5 },
  { stage: 'presentation', label: '2. Teacher Presentation (Direct Instruction)', defaultDuration: 15 },
  { stage: 'guided_practice', label: '3. Guided Practice (Interactive Solving)', defaultDuration: 10 },
  { stage: 'group_work', label: '4. Group / Pair Work (Collaborative Task)', defaultDuration: 10 },
  { stage: 'assessment', label: '5. Assessment & Exit Ticket (Formative Check)', defaultDuration: 5 },
  { stage: 'conclusion', label: '6. Conclusion & Homework Wrap-up', defaultDuration: 5 },
];

export const Step3ActivitiesTable: React.FC<Props> = ({ formData, updateFormData }) => {
  const { t } = useTranslation();

  const totalActivityDuration = formData.activities.reduce(
    (sum, a) => sum + (Number(a.duration_minutes) || 0),
    0
  );

  const durationDifference = Number(formData.duration_minutes) - totalActivityDuration;

  const addActivity = () => {
    const newActivity: LessonPlanActivity = {
      stage: 'guided_practice',
      duration_minutes: 5,
      teacher_activities: '',
      student_activities: '',
      teaching_materials: '',
      assessment_method: '',
      sort_order: formData.activities.length + 1,
    };
    updateFormData({ activities: [...formData.activities, newActivity] });
  };

  const updateActivity = (index: number, field: keyof LessonPlanActivity, value: any) => {
    const updated = [...formData.activities];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData({ activities: updated });
  };

  const removeActivity = (index: number) => {
    const updated = formData.activities.filter((_, i) => i !== index);
    updateFormData({ activities: updated });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 border-bottom pb-2 mb-3">
        <div>
          <h5 className="text-primary fw-bold mb-0">
            {t('lesson_plans.step3')} - {t('lesson_plans.activities')}
          </h5>
          <span className="text-muted small">
            5-Stage Lesson Procedure with Real-time Time Allocation Tracker
          </span>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Badge bg={durationDifference === 0 ? 'success' : durationDifference > 0 ? 'warning' : 'danger'} className="p-2 fs-6">
            <Clock size={15} className="me-1" /> Total Planned: {totalActivityDuration} / {formData.duration_minutes} Mins
          </Badge>
          <Button size="sm" variant="outline-primary" onClick={addActivity}>
            <Plus size={14} className="me-1" /> Add Stage
          </Button>
        </div>
      </div>

      {durationDifference !== 0 && (
        <Alert variant={durationDifference > 0 ? 'warning' : 'danger'} className="py-2 small mb-3">
          {durationDifference > 0
            ? `Notice: You have ${durationDifference} minutes unallocated from the total ${formData.duration_minutes} mins.`
            : `Warning: Total activity time exceeds planned duration by ${Math.abs(durationDifference)} minutes.`}
        </Alert>
      )}

      <Table responsive bordered hover size="sm" className="align-middle small mb-3">
        <thead className="table-light">
          <tr>
            <th style={{ width: '160px' }}>Stage</th>
            <th style={{ width: '90px' }}>Duration</th>
            <th>Teacher's Activity & Instructions</th>
            <th>Student's Actions & Tasks</th>
            <th style={{ width: '140px' }}>Materials / Tool</th>
            <th style={{ width: '130px' }}>Assessment Method</th>
            <th style={{ width: '50px' }}></th>
          </tr>
        </thead>
        <tbody>
          {formData.activities.map((act, idx) => (
            <tr key={idx}>
              <td>
                <Form.Select
                  size="sm"
                  value={act.stage}
                  onChange={(e) => updateActivity(idx, 'stage', e.target.value as ActivityStage)}
                >
                  {STAGE_OPTIONS.map((st) => (
                    <option key={st.stage} value={st.stage}>
                      {st.stage.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </Form.Select>
              </td>
              <td>
                <div className="input-group input-group-sm">
                  <Form.Control
                    type="number"
                    min={1}
                    max={60}
                    value={act.duration_minutes}
                    onChange={(e) => updateActivity(idx, 'duration_minutes', Number(e.target.value))}
                    required
                  />
                  <span className="input-group-text">m</span>
                </div>
              </td>
              <td>
                <Form.Control
                  size="sm"
                  as="textarea"
                  rows={2}
                  placeholder="Explain concept, write problem on board, ask questions..."
                  value={act.teacher_activities}
                  onChange={(e) => updateActivity(idx, 'teacher_activities', e.target.value)}
                  required
                />
              </td>
              <td>
                <Form.Control
                  size="sm"
                  as="textarea"
                  rows={2}
                  placeholder="Listen, take notes, solve in pairs, present answer..."
                  value={act.student_activities}
                  onChange={(e) => updateActivity(idx, 'student_activities', e.target.value)}
                  required
                />
              </td>
              <td>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="e.g. Board, Slide 3"
                  value={act.teaching_materials || ''}
                  onChange={(e) => updateActivity(idx, 'teaching_materials', e.target.value)}
                />
              </td>
              <td>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="e.g. Oral feedback"
                  value={act.assessment_method || ''}
                  onChange={(e) => updateActivity(idx, 'assessment_method', e.target.value)}
                />
              </td>
              <td className="text-center">
                <Button
                  size="sm"
                  variant="link"
                  className="text-danger p-0"
                  onClick={() => removeActivity(idx)}
                >
                  <Trash2 size={16} />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};