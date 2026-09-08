import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Button, Row, Col, Table, Tab, Tabs, Modal, Form, Alert } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { ArrowLeft, Edit, Copy, Send, CheckCircle, XCircle, RotateCcw, Printer, FileText, Paperclip, UploadCloud, Download } from 'lucide-react';
import { lessonPlansApi } from '../../api/lessonPlans';
import type { LessonPlan } from '../../types/lessonPlan';
import { StatusBadge } from '../../components/lesson-plan/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

export const LessonPlanDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const { user } = useAuthStore();

  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Workflow Action Modal state
  const [modalAction, setModalAction] = useState<string | null>(null);
  const [actionComment, setActionComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [id]);

  const loadPlan = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await lessonPlansApi.getLessonPlan(Number(id));
      setPlan(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load lesson plan details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!plan || !e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size exceeds maximum 20MB limit.');
      return;
    }

    setUploadingFile(true);
    try {
      const res = await lessonPlansApi.uploadAttachment(plan.id, file);
      setPlan(res.data);
      toast.success('পাঠ পরিকল্পনা ডকুমেন্ট সফলভাবে আপলোড করা হয়েছে!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document file.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDuplicate = async () => {
    if (!plan || !window.confirm('Duplicate this lesson plan as a new draft?')) return;
    try {
      const res = await lessonPlansApi.duplicateLessonPlan(plan.id);
      navigate(`/lesson-plans/edit/${res.data.id}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to duplicate lesson plan');
    }
  };

  const handleWorkflowAction = async () => {
    if (!plan || !modalAction) return;
    setActionLoading(true);
    try {
      if (modalAction === 'submit') {
        await lessonPlansApi.submit(plan.id, actionComment);
      } else if (modalAction === 'start-review') {
        await lessonPlansApi.startReview(plan.id, actionComment);
      } else if (modalAction === 'approve') {
        await lessonPlansApi.approve(plan.id, actionComment);
      } else if (modalAction === 'return') {
        await lessonPlansApi.returnForCorrection(plan.id, actionComment);
      } else if (modalAction === 'reject') {
        await lessonPlansApi.reject(plan.id, actionComment);
      }

      setModalAction(null);
      setActionComment('');
      loadPlan();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to perform workflow action');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading lesson plan details...</div>;
  }

  if (!plan) {
    return (
      <div className="alert alert-danger">
        {error || 'Lesson plan not found.'}
        <Button variant="link" onClick={() => navigate('/lesson-plans')}>
          Back to list
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === plan.teacher?.id || user?.id === plan.teacher_id;
  const isReviewerOrAdmin = user?.role_names?.some((r) => ['super_admin', 'principal', 'academic_coordinator'].includes(r));

  return (
    <div>
      {/* Top Action Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div className="d-flex align-items-center gap-3">
          <Button variant="outline-secondary" size="sm" onClick={() => navigate('/lesson-plans')}>
            <ArrowLeft size={16} className="me-1" /> {t('common.back')}
          </Button>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h4 className="fw-bold mb-0">{plan.title}</h4>
              <StatusBadge status={plan.status} />
            </div>
            <span className="text-muted small">
              Code: <strong className="text-primary">{plan.code}</strong> | Teacher: {plan.teacher?.name} ({plan.teacher?.email})
            </span>
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {/* Print/Export PDF */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.open(`/api/v1/lesson-plans/${plan.id}/pdf`, '_blank')}
          >
            <Printer size={15} className="me-1" /> {t('common.print')} / PDF
          </Button>

          {/* Duplicate */}
          <Button variant="outline-primary" size="sm" onClick={handleDuplicate}>
            <Copy size={15} className="me-1" /> {t('common.duplicate')}
          </Button>

          {/* Edit (Draft or Returned only) */}
          {(isOwner || isReviewerOrAdmin) && ['draft', 'returned'].includes(plan.status) && (
            <Link to={`/lesson-plans/edit/${plan.id}`} className="btn btn-outline-success btn-sm">
              <Edit size={15} className="me-1" /> {t('common.edit')}
            </Link>
          )}

          {/* Delete Draft (Owner or Admin) */}
          {(isOwner || isReviewerOrAdmin) && ['draft', 'returned'].includes(plan.status) && (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this lesson plan draft?')) {
                  try {
                    await lessonPlansApi.deleteLessonPlan(plan.id);
                    navigate('/lesson-plans');
                  } catch (err: any) {
                    alert(err.response?.data?.message || 'Failed to delete lesson plan');
                  }
                }
              }}
            >
              <XCircle size={15} className="me-1" /> {t('common.delete', 'মুছে ফেলুন')}
            </Button>
          )}

          {/* Teacher Submit */}
          {isOwner && ['draft', 'returned'].includes(plan.status) && (
            <Button variant="success" size="sm" onClick={() => setModalAction('submit')}>
              <Send size={15} className="me-1" /> {t('lesson_plans.submit')}
            </Button>
          )}

          {/* Reviewer / Admin Actions */}
          {isReviewerOrAdmin && plan.status === 'submitted' && (
            <Button variant="info" size="sm" onClick={() => setModalAction('start-review')}>
              <FileText size={15} className="me-1" /> Start Review
            </Button>
          )}

          {isReviewerOrAdmin && ['submitted', 'under_review'].includes(plan.status) && (
            <>
              <Button variant="success" size="sm" onClick={() => setModalAction('approve')}>
                <CheckCircle size={15} className="me-1" /> {t('lesson_plans.approve')}
              </Button>
              <Button variant="warning" size="sm" onClick={() => setModalAction('return')}>
                <RotateCcw size={15} className="me-1" /> {t('lesson_plans.return_for_correction')}
              </Button>
              <Button variant="danger" size="sm" onClick={() => setModalAction('reject')}>
                <XCircle size={15} className="me-1" /> {t('lesson_plans.reject')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Review Feedback Alert */}
      {plan.reviews && plan.reviews.length > 0 && (
        <Alert variant={plan.status === 'returned' ? 'warning' : plan.status === 'rejected' ? 'danger' : 'info'} className="mb-4">
          <h6 className="fw-bold mb-1">
            Latest Reviewer Feedback ({plan.reviews[plan.reviews.length - 1].action.toUpperCase()} by {plan.reviews[plan.reviews.length - 1].reviewer?.name}):
          </h6>
          <div>{plan.reviews[plan.reviews.length - 1].comment}</div>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs defaultActiveKey="overview" className="mb-4">
        <Tab eventKey="overview" title="Plan Overview">
          {/* Institutional Header Card */}
          <Card className="border shadow-sm mb-4">
            <Card.Header className="bg-primary text-white py-3">
              <Row className="align-items-center">
                <Col md={8}>
                  <h5 className="fw-bold mb-0">{plan.title}</h5>
                  <div className="small opacity-75">{plan.topic || 'Topic: Not specified'}</div>
                </Col>
                <Col md={4} className="text-md-end">
                  <span className="badge bg-light text-dark px-3 py-2 fs-6">
                    {plan.code}
                  </span>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body>
              <Row className="g-3 mb-4">
                <Col md={3}>
                  <div className="text-muted small">{t('academic_years.year_name')} & Term</div>
                  <div className="fw-bold">
                    {plan.academic_year?.name || plan.academicYear?.name}{' '}
                    {plan.term ? `(${language === 'bn' ? plan.term.name_bn : plan.term.name_en})` : ''}
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-muted small">{t('classes_sections.class_name')} & Section</div>
                  <div className="fw-bold">
                    {language === 'bn' ? plan.school_class?.name_bn || plan.schoolClass?.name_bn : plan.school_class?.name_en || plan.schoolClass?.name_en}{' '}
                    {plan.section ? `(${language === 'bn' ? plan.section.name_bn : plan.section.name_en})` : ''}
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-muted small">{t('subjects_chapters.subject_name')}</div>
                  <div className="fw-bold">
                    {language === 'bn' ? plan.subject?.name_bn : plan.subject?.name_en} ({plan.subject?.code})
                  </div>
                </Col>
                <Col md={3}>
                  <div className="text-muted small">{t('lesson_plans.lesson_date')} & Duration</div>
                  <div className="fw-bold">
                    {plan.lesson_date} | {plan.duration_minutes} Mins (Period {plan.period_number})
                  </div>
                </Col>
              </Row>

              {plan.chapter && (
                <div className="p-2 bg-light rounded border mb-4 small">
                  <strong>Chapter:</strong> Chapter {plan.chapter.chapter_no}: {language === 'bn' ? plan.chapter.title_bn : plan.chapter.title_en}
                </div>
              )}

              {/* Attached Document Section */}
              <div className="p-3 bg-light rounded border mb-4">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <div className="d-flex align-items-center">
                    <div className="p-2 bg-white rounded border me-3 text-primary shadow-sm">
                      <Paperclip size={24} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        সংযুক্ত পাঠ পরিকল্পনা ডকুমেন্ট (Attached Lesson Document)
                      </h6>
                      {plan.attachment_url ? (
                        <div className="text-muted small">
                          <strong>ফাইল:</strong> {plan.attachment_name || 'Lesson Plan Document'}
                        </div>
                      ) : (
                        <div className="text-muted small">
                          কোনো বাহ্যিক ফাইল সংযুক্ত নেই (No external document attached yet)
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="d-flex gap-2 align-items-center">
                    {plan.attachment_url && (
                      <a
                        href={plan.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-primary d-flex align-items-center"
                      >
                        <Download size={15} className="me-1" />
                        ডকুমেন্ট ডাউনলোড / দেখুন (View Document)
                      </a>
                    )}

                    {(isOwner && (plan.status === 'draft' || plan.status === 'returned')) && (
                      <div>
                        <Form.Label
                          htmlFor="details-file-upload"
                          className="btn btn-sm btn-outline-secondary mb-0 d-flex align-items-center cursor-pointer"
                        >
                          <UploadCloud size={15} className="me-1" />
                          {uploadingFile ? 'আপলোড হচ্ছে...' : plan.attachment_url ? 'ফাইল পরিবর্তন করুন (Replace)' : 'ফাইল সংযুক্ত করুন (Attach File)'}
                        </Form.Label>
                        <input
                          id="details-file-upload"
                          type="file"
                          className="d-none"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                          onChange={handleFileAttachmentUpload}
                          disabled={uploadingFile}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 1. Outcomes */}
              <h6 className="fw-bold text-dark border-bottom pb-1">1. Learning Objectives & Outcomes</h6>
              {plan.previous_knowledge && (
                <p className="small mb-2">
                  <strong>Prior Knowledge:</strong> {plan.previous_knowledge}
                </p>
              )}
              {plan.outcomes && plan.outcomes.length > 0 ? (
                <Table responsive bordered hover size="sm" className="small align-middle mb-4">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Learning Outcome (Measurable Objective)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.outcomes.map((o, idx) => (
                      <tr key={idx}>
                        <td className="text-center fw-bold">{idx + 1}</td>
                        <td>{o.outcome_text}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted small mb-4">No specific outcomes recorded.</p>
              )}

              {/* 2. Methodology & Resources */}
              <h6 className="fw-bold text-dark border-bottom pb-1">2. Methodology & Materials</h6>
              <Row className="small mb-4">
                <Col md={6}>
                  <strong>Teaching Method:</strong> {plan.teaching_method || 'Interactive Discussion & Demonstration'}
                </Col>
                <Col md={6}>
                  <strong>Teaching Materials:</strong> {plan.teaching_materials || 'Standard classroom materials'}
                </Col>
                {plan.digital_resources && (
                  <Col md={6} className="mt-2">
                    <strong>Digital Resources:</strong> {plan.digital_resources}
                  </Col>
                )}
                {plan.reference_book && (
                  <Col md={6} className="mt-2">
                    <strong>Reference Book:</strong> {plan.reference_book}
                  </Col>
                )}
              </Row>

              {/* 3. 5-Phase Procedure */}
              <h6 className="fw-bold text-dark border-bottom pb-1">3. Step-by-Step Lesson Procedure</h6>
              <Table responsive bordered hover size="sm" className="small align-middle mb-4">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '150px' }}>Stage</th>
                    <th style={{ width: '70px' }}>Duration</th>
                    <th>Teacher Role & Instructions</th>
                    <th>Student Role & Activity</th>
                    <th>Assessment</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.activities?.map((act, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold text-capitalize">{act.stage.replace('_', ' ')}</td>
                      <td>{act.duration_minutes}m</td>
                      <td>{act.teacher_activities}</td>
                      <td>{act.student_activities}</td>
                      <td>{act.assessment_method || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* 4. Assessment & Reflection */}
              <h6 className="fw-bold text-dark border-bottom pb-1">4. Assessment, Differentiation & Homework</h6>
              <Row className="small mb-3">
                <Col md={6}>
                  <strong>Formative Assessment:</strong> {plan.formative_assessment || 'N/A'}
                </Col>
                <Col md={6}>
                  <strong>Success Criteria:</strong> {plan.success_criteria || 'N/A'}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Differentiation (Struggling):</strong> {plan.remedial_activities || 'N/A'}
                </Col>
                <Col md={6} className="mt-2">
                  <strong>Differentiation (Advanced):</strong> {plan.advanced_learner_activities || 'N/A'}
                </Col>
                <Col md={12} className="mt-2">
                  <strong>Homework:</strong> {plan.homework || 'None'}
                </Col>
                {plan.teacher_reflection && (
                  <Col md={12} className="mt-2">
                    <strong>Teacher Reflection Notes:</strong> {plan.teacher_reflection}
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        {/* Audit & Workflow History Tab */}
        <Tab eventKey="history" title="Workflow & Audit Timeline">
          <Card className="border shadow-sm">
            <Card.Body className="p-3">
              <h6 className="fw-bold mb-3">Approval Workflow Audit Log</h6>
              {(plan.status_histories || plan.statusHistories) && (plan.status_histories || plan.statusHistories)!.length > 0 ? (
                <div className="timeline">
                  {(plan.status_histories || plan.statusHistories)!.map((h, idx) => (
                    <div key={idx} className="border-start border-2 border-primary ps-3 pb-3 position-relative">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <div>
                          <strong className="text-primary text-uppercase">{h.to_status}</strong>
                          <span className="text-muted small ms-2">
                            by {h.actor?.name || 'System'}
                          </span>
                        </div>
                        <span className="text-muted small">{new Date(h.created_at).toLocaleString()}</span>
                      </div>
                      <div className="small text-muted">
                        Transition: <StatusBadge status={h.from_status || 'draft'} /> → <StatusBadge status={h.to_status} />
                      </div>
                      {h.comment && (
                        <div className="p-2 bg-light rounded mt-2 small border">
                          <strong>Note / Comment:</strong> {h.comment}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small">No workflow transitions recorded yet.</div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Workflow Action Modal */}
      <Modal show={modalAction !== null} onHide={() => setModalAction(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-capitalize">{modalAction?.replace('-', ' ')} Lesson Plan</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small">
            Please provide any notes or feedback for this workflow transition:
          </p>
          <Form.Group>
            <Form.Label className="fw-semibold">
              Comment / Feedback {['return', 'reject'].includes(modalAction || '') && <span className="text-danger">*</span>}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter feedback or instructions..."
              value={actionComment}
              onChange={(e) => setActionComment(e.target.value)}
              required={['return', 'reject'].includes(modalAction || '')}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalAction(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant={modalAction === 'reject' ? 'danger' : modalAction === 'return' ? 'warning' : 'primary'}
            onClick={handleWorkflowAction}
            disabled={actionLoading || (['return', 'reject'].includes(modalAction || '') && !actionComment.trim())}
          >
            {actionLoading ? 'Processing...' : 'Confirm Action'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};