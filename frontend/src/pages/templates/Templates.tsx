import React, { useState } from 'react';
import { Card, Button, Row, Col, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '../../locales/i18n';
import { Plus, BookOpen, Trash2, ArrowRight } from 'lucide-react';
import { templatesApi } from '../../api/templates';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import type { LessonPlanTemplate } from '../../types/template';

export const Templates: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [isSystem, setIsSystem] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; template: LessonPlanTemplate | null }>({
    show: false,
    template: null,
  });

  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.getTemplates(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => templatesApi.createTemplate(payload),
    onSuccess: (res) => {
      toast.success(res.message || 'Template created successfully.');
      setShowModal(false);
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => templatesApi.deleteTemplate(id),
    onSuccess: () => {
      toast.success('Template deleted successfully.');
      setDeleteConfirm({ show: false, template: null });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });

  const handleUseTemplate = (tpl: LessonPlanTemplate) => {
    navigate('/lesson-plans/create', { state: { templateData: tpl.template_data } });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      title,
      is_system: isSystem,
      template_data: {
        title,
        teaching_method: 'Interactive Discussion & Demonstration',
        teaching_materials: 'Standard textbook and whiteboard',
        outcomes: [
          { outcome_text: 'Define and explain core topic principles', sort_order: 1 },
          { outcome_text: 'Demonstrate solution steps on exercise problems', sort_order: 2 },
        ],
        activities: [
          { stage: 'introduction', duration_minutes: 5, teacher_activities: 'Warmup recall', student_activities: 'Answer questions', sort_order: 1 },
          { stage: 'presentation', duration_minutes: 15, teacher_activities: 'Direct instruction', student_activities: 'Note taking', sort_order: 2 },
          { stage: 'guided_practice', duration_minutes: 15, teacher_activities: 'Facilitate practice', student_activities: 'Paired solving', sort_order: 3 },
          { stage: 'conclusion', duration_minutes: 10, teacher_activities: 'Wrap up and homework', student_activities: 'Take notes', sort_order: 4 },
        ],
      },
    });
  };

  return (
    <div>
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-dark">{t('nav.templates') || 'পাঠ পরিকল্পনা টেমপ্লেট'}</h4>
          <p className="text-muted fs-7 mb-0">দ্রুত ও মানসম্মত পাঠ পরিকল্পনা তৈরিতে প্রমিত টেমপ্লেট পরিচালনা করুন</p>
        </div>
        <Button variant="primary" size="sm" className="btn-institutional px-3 py-2 fw-bold d-flex align-items-center gap-1.5" onClick={() => setShowModal(true)}>
          <Plus size={16} /> নতুন টেমপ্লেট তৈরি করুন
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="টেমপ্লেট তালিকা লোড হচ্ছে..." />
      ) : (
        <Row className="g-3">
          {templatesData?.data?.map((tpl) => (
            <Col md={6} lg={4} key={tpl.id}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Header className="bg-light border-bottom d-flex justify-content-between align-items-center py-2.5 px-3">
                  <span className={`badge ${tpl.is_system ? 'bg-primary' : 'bg-secondary'} fw-semibold`}>
                    {tpl.is_system ? 'System Template' : 'Custom'}
                  </span>
                  {!tpl.is_system && (
                    <Button variant="link" size="sm" className="text-danger p-0" onClick={() => setDeleteConfirm({ show: true, template: tpl })}>
                      <Trash2 size={15} />
                    </Button>
                  )}
                </Card.Header>
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <BookOpen size={18} className="text-primary" />
                    <h6 className="fw-bold mb-0 text-dark">{tpl.title}</h6>
                  </div>
                  <p className="text-muted fs-8 mb-3">
                    ৫টি ধাপ বিশিষ্ট প্রমিত পাঠ কাঠামো ও লক্ষ্যমাত্রা সংযুক্ত।
                  </p>
                  <Button variant="outline-primary" size="sm" className="w-100 fw-semibold fs-7" onClick={() => handleUseTemplate(tpl)}>
                    টেমপ্লেট ব্যবহার করুন <ArrowRight size={14} className="ms-1" />
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">নতুন পাঠ পরিকল্পনা টেমপ্লেট তৈরি</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate}>
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold fs-7 text-secondary">টেমপ্লেটের নাম (Template Title)</Form.Label>
              <Form.Control
                type="text"
                placeholder="যেমন: বিজ্ঞান ব্যবহারিক ও অনুসন্ধানমূলক টেমপ্লেট"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="fs-7"
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              id="is_sys"
              label={<span className="fs-7 fw-semibold">প্রতিষ্ঠানব্যাপী সবার জন্য উন্মুক্ত রাখুন (System Template)</span>}
              checked={isSystem}
              onChange={(e) => setIsSystem(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer className="bg-light">
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              বাতিল
            </Button>
            <Button variant="primary" type="submit" size="sm" className="btn-institutional" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="টেমপ্লেট মুছে ফেলা"
        message={`আপনি কি "${deleteConfirm.template?.title}" টেমপ্লেটটি মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.template && deleteMutation.mutate(deleteConfirm.template.id)}
        onCancel={() => setDeleteConfirm({ show: false, template: null })}
      />
    </div>
  );
};