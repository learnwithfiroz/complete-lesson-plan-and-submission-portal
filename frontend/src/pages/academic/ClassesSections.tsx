import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Users, Edit2 } from 'lucide-react';
import { academicApi } from '../../api/academic';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import type { SchoolClass, Section } from '../../types/academic';

export const ClassesSections: React.FC = () => {
  const queryClient = useQueryClient();
  const [classModal, setClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  const [sectionModal, setSectionModal] = useState<{
    show: boolean;
    classId: number | null;
    section: Section | null;
  }>({
    show: false,
    classId: null,
    section: null,
  });

  const [deleteClassConfirm, setDeleteClassConfirm] = useState<{
    show: boolean;
    classItem: SchoolClass | null;
  }>({
    show: false,
    classItem: null,
  });

  const [deleteSectionConfirm, setDeleteSectionConfirm] = useState<{
    show: boolean;
    section: Section | null;
  }>({
    show: false,
    section: null,
  });

  const [classForm, setClassForm] = useState({
    name_bn: '১১শ শ্রেণি',
    name_en: 'Class Eleven',
    numeric_value: 11,
    is_active: true,
  });

  const [sectionForm, setSectionForm] = useState({
    name_bn: 'সুরমা (প্রভাতি)',
    name_en: 'Surma (Morning)',
    capacity: 45,
  });

  const { data: classesData, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicApi.getClasses(),
  });

  const saveClassMutation = useMutation({
    mutationFn: (data: typeof classForm) => {
      if (editingClass) {
        return academicApi.updateClass(editingClass.id, data);
      }
      return academicApi.createClass(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Class saved successfully.');
      setClassModal(false);
      setEditingClass(null);
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const deleteClassMutation = useMutation({
    mutationFn: (id: number) => academicApi.deleteClass(id),
    onSuccess: () => {
      toast.success('Class deleted successfully.');
      setDeleteClassConfirm({ show: false, classItem: null });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const saveSectionMutation = useMutation({
    mutationFn: (data: any) => {
      if (sectionModal.section) {
        return academicApi.updateSection(sectionModal.section.id, data);
      }
      return academicApi.createSection(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Section saved successfully.');
      setSectionModal({ show: false, classId: null, section: null });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const deleteSectionMutation = useMutation({
    mutationFn: (id: number) => academicApi.deleteSection(id),
    onSuccess: () => {
      toast.success('Section deleted successfully.');
      setDeleteSectionConfirm({ show: false, section: null });
      queryClient.invalidateQueries({ queryKey: ['classes'] });
    },
  });

  const handleOpenCreateClass = () => {
    setEditingClass(null);
    setClassForm({
      name_bn: '',
      name_en: '',
      numeric_value: 1,
      is_active: true,
    });
    setClassModal(true);
  };

  const handleOpenEditClass = (c: SchoolClass) => {
    setEditingClass(c);
    setClassForm({
      name_bn: c.name_bn,
      name_en: c.name_en,
      numeric_value: c.numeric_value,
      is_active: c.is_active,
    });
    setClassModal(true);
  };

  const handleOpenCreateSection = (classId: number) => {
    setSectionModal({ show: true, classId, section: null });
    setSectionForm({
      name_bn: '',
      name_en: '',
      capacity: 40,
    });
  };

  const handleOpenEditSection = (classId: number, section: Section) => {
    setSectionModal({ show: true, classId, section });
    setSectionForm({
      name_bn: section.name_bn,
      name_en: section.name_en,
      capacity: section.capacity || 40,
    });
  };

  return (
    <div className="classes-sections-container">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-5 fw-bold text-dark mb-1">
            শ্রেণি ও শাখা ব্যবস্থাপনা (Classes & Sections)
          </h2>
          <p className="text-muted fs-7 mb-0">
            প্রতিটি শ্রেণির শাখা, শিক্ষার্থী ধারণক্ষমতা এবং সংশ্লিষ্ট বিষয়াবলি পরিচালনা করুন
          </p>
        </div>

        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 rounded-3 fw-bold btn-institutional px-3 py-2 shadow-sm"
          onClick={handleOpenCreateClass}
        >
          <Plus size={18} />
          <span>নতুন শ্রেণি যোগ করুন</span>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="শ্রেণি তালিকা লোড হচ্ছে..." />
      ) : (
        <Row className="g-4">
          {classesData?.data?.map((c) => (
            <Col key={c.id} md={6} xl={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Header className="bg-light border-bottom p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-circle" style={{ backgroundColor: '#0f2e5a', width: '32px', height: '32px', fontSize: '0.8rem' }}>
                      {c.numeric_value}
                    </div>
                    <div>
                      <h5 className="fs-6 fw-bold mb-0 text-dark">{c.name_bn}</h5>
                      <small className="text-muted">{c.name_en}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Badge bg="primary-subtle" className="text-primary fw-semibold px-2 py-1 me-1">
                      {c.sections?.length || 0} টি শাখা
                    </Badge>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="p-1 px-1.5 fs-8"
                      title="শ্রেণি সম্পাদনা"
                      onClick={() => handleOpenEditClass(c)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="p-1 px-1.5 fs-8"
                      title="শ্রেণি মুছে ফেলুন"
                      onClick={() => setDeleteClassConfirm({ show: true, classItem: c })}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2 pb-1 border-bottom">
                    <span className="fs-8 fw-bold text-secondary">শাখা তালিকা (Sections):</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 fs-8 text-primary fw-semibold text-decoration-none"
                      onClick={() => handleOpenCreateSection(c.id)}
                    >
                      + শাখা যোগ করুন
                    </Button>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {c.sections && c.sections.length > 0 ? (
                      c.sections.map((s) => (
                        <div
                          key={s.id}
                          className="d-flex align-items-center justify-content-between p-2 rounded bg-light border"
                        >
                          <div>
                            <div className="fw-semibold text-dark fs-7">{s.name_bn}</div>
                            <div className="text-muted fs-8 d-flex align-items-center gap-1">
                              <Users size={12} />
                              <span>ধারণক্ষমতা: {s.capacity || 40} জন শিক্ষার্থী</span>
                            </div>
                          </div>
                          <div className="d-flex align-items-center gap-1">
                            <Button
                              variant="link"
                              className="text-primary p-0"
                              title="শাখা সম্পাদনা"
                              onClick={() => handleOpenEditSection(c.id, s)}
                            >
                              <Edit2 size={13} />
                            </Button>
                            <Button
                              variant="link"
                              className="text-danger p-0 ms-2"
                              title="শাখা মুছে ফেলুন"
                              onClick={() => setDeleteSectionConfirm({ show: true, section: s })}
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted fs-8 text-center py-2 mb-0">কোন শাখা তৈরি করা হয়নি।</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add / Edit Class Modal */}
      <Modal show={classModal} onHide={() => { setClassModal(false); setEditingClass(null); }} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {editingClass ? 'শ্রেণির তথ্য সম্পাদনা' : 'নতুন শ্রেণি তৈরি করুন'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শ্রেণির নাম (বাংলা)</Form.Label>
            <Form.Control
              type="text"
              value={classForm.name_bn}
              onChange={(e) => setClassForm({ ...classForm, name_bn: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শ্রেণির নাম (English)</Form.Label>
            <Form.Control
              type="text"
              value={classForm.name_en}
              onChange={(e) => setClassForm({ ...classForm, name_en: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শ্রেণির নম্বর (Numeric Value: 1-12)</Form.Label>
            <Form.Control
              type="number"
              value={classForm.numeric_value}
              onChange={(e) => setClassForm({ ...classForm, numeric_value: Number(e.target.value) })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => { setClassModal(false); setEditingClass(null); }}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={() => saveClassMutation.mutate(classForm)}
            disabled={saveClassMutation.isPending}
          >
            {saveClassMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : editingClass ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add / Edit Section Modal */}
      <Modal show={sectionModal.show} onHide={() => setSectionModal({ show: false, classId: null, section: null })} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {sectionModal.section ? 'শাখার তথ্য সম্পাদনা' : 'নতুন শাখা যোগ করুন'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শাখার নাম (বাংলা)</Form.Label>
            <Form.Control
              type="text"
              value={sectionForm.name_bn}
              onChange={(e) => setSectionForm({ ...sectionForm, name_bn: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শাখার নাম (English)</Form.Label>
            <Form.Control
              type="text"
              value={sectionForm.name_en}
              onChange={(e) => setSectionForm({ ...sectionForm, name_en: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শিক্ষার্থী ধারণক্ষমতা (Capacity)</Form.Label>
            <Form.Control
              type="number"
              value={sectionForm.capacity}
              onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => setSectionModal({ show: false, classId: null, section: null })}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={() =>
              saveSectionMutation.mutate({
                ...sectionForm,
                class_id: sectionModal.classId,
              })
            }
            disabled={saveSectionMutation.isPending}
          >
            {saveSectionMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : sectionModal.section ? 'আপডেট করুন' : 'শাখা সংরক্ষণ করুন'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Class Confirmation */}
      <ConfirmDialog
        show={deleteClassConfirm.show}
        title="শ্রেণি মুছে ফেলা"
        message={`আপনি কি নিশ্চিতভাবে "${deleteClassConfirm.classItem?.name_bn}" মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteClassMutation.isPending}
        onConfirm={() => deleteClassConfirm.classItem && deleteClassMutation.mutate(deleteClassConfirm.classItem.id)}
        onCancel={() => setDeleteClassConfirm({ show: false, classItem: null })}
      />

      {/* Delete Section Confirmation */}
      <ConfirmDialog
        show={deleteSectionConfirm.show}
        title="শাখা মুছে ফেলা"
        message={`আপনি কি নিশ্চিতভাবে "${deleteSectionConfirm.section?.name_bn}" শাখাটি মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteSectionMutation.isPending}
        onConfirm={() => deleteSectionConfirm.section && deleteSectionMutation.mutate(deleteSectionConfirm.section.id)}
        onCancel={() => setDeleteSectionConfirm({ show: false, section: null })}
      />
    </div>
  );
};