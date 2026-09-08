import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Edit2, Trash2, Users, BookOpen } from 'lucide-react';
import { departmentsApi } from '../../api/departments';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import type { Department } from '../../types/auth';
import type { DepartmentFormData } from '../../api/departments';

export const DepartmentList: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; dept: Department | null }>({
    show: false,
    dept: null,
  });

  const [form, setForm] = useState<DepartmentFormData>({
    name_bn: '',
    name_en: '',
    code: '',
    description: '',
    is_active: true,
  });

  const { data: deptsData, isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments(),
  });

  const saveMutation = useMutation({
    mutationFn: (data: DepartmentFormData) => {
      if (editingDept) {
        return departmentsApi.updateDepartment(editingDept.id, data);
      }
      return departmentsApi.createDepartment(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Department saved successfully.');
      setModalOpen(false);
      setEditingDept(null);
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => departmentsApi.deleteDepartment(id),
    onSuccess: () => {
      toast.success('Department deleted successfully.');
      setDeleteConfirm({ show: false, dept: null });
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingDept(null);
    setForm({
      name_bn: '',
      name_en: '',
      code: '',
      description: '',
      is_active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept: Department) => {
    setEditingDept(dept);
    setForm({
      name_bn: dept.name_bn,
      name_en: dept.name_en,
      code: dept.code,
      description: (dept as any).description || '',
      is_active: (dept as any).is_active ?? true,
    });
    setModalOpen(true);
  };

  return (
    <div className="departments-container">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-5 fw-bold text-dark mb-1">
            একাডেমিক বিভাগসমূহ (Academic Departments)
          </h2>
          <p className="text-muted fs-7 mb-0">
            বিজ্ঞান, গণিত, মানবিক, ব্যবসা শিক্ষা ও ভাষা বিভাগসমূহ পরিচালনা করুন
          </p>
        </div>

        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 rounded-3 fw-bold btn-institutional px-3 py-2 shadow-sm"
          onClick={handleOpenCreate}
        >
          <Plus size={18} />
          <span>নতুন বিভাগ যোগ করুন</span>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="বিভাগসমূহের তালিকা লোড হচ্ছে..." />
      ) : (
        <Row className="g-4">
          {deptsData?.data?.map((dept) => (
            <Col key={dept.id} md={6} lg={4}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Header className="bg-light border-bottom p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div className="avatar-circle" style={{ backgroundColor: '#0f2e5a', width: '34px', height: '34px', color: '#fff', fontSize: '0.85rem' }}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <h5 className="fs-6 fw-bold mb-0 text-dark">{dept.name_bn}</h5>
                      <small className="text-muted">{dept.name_en}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Badge bg="primary-subtle" className="text-primary font-monospace fw-bold px-2 py-1">
                      {dept.code}
                    </Badge>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="p-1 px-1.5 fs-8"
                      title="বিভাগ সম্পাদনা"
                      onClick={() => handleOpenEdit(dept)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="p-1 px-1.5 fs-8"
                      title="বিভাগ মুছে ফেলুন"
                      onClick={() => setDeleteConfirm({ show: true, dept })}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body className="p-3">
                  <div className="d-flex align-items-center justify-content-between text-muted fs-8">
                    <span className="d-flex align-items-center gap-1">
                      <Users size={14} className="text-primary" />
                      <span>শিক্ষক ও সদস্য: <strong>{(dept as any).users_count ?? 0} জন</strong></span>
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <BookOpen size={14} className="text-success" />
                      <span>বিষয়সমূহ: <strong>{(dept as any).subjects_count ?? 0} টি</strong></span>
                    </span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Create / Edit Modal */}
      <Modal show={modalOpen} onHide={() => { setModalOpen(false); setEditingDept(null); }} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {editingDept ? 'বিভাগের তথ্য সম্পাদনা' : 'নতুন বিভাগ তৈরি করুন'}
          </Modal.Title>
        </Modal.Header>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(form);
          }}
        >
          <Modal.Body className="p-4">
            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fw-semibold">বিভাগের নাম (বাংলা) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="যেমন: বিজ্ঞান ও প্রযুক্তি বিভাগ"
                value={form.name_bn}
                onChange={(e) => setForm({ ...form, name_bn: e.target.value })}
                required
                className="fs-7"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fw-semibold">বিভাগের নাম (English) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. Science & Technology Department"
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                required
                className="fs-7"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fw-semibold">বিভাগ কোড (Department Code) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="যেমন: SCI / MATH / ENG"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
                className="fs-7 font-monospace"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fs-7 fw-semibold">বিবরণ (Description)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="বিভাগের সংক্ষিপ্ত বিবরণ..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="fs-7"
              />
            </Form.Group>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button variant="secondary" size="sm" onClick={() => { setModalOpen(false); setEditingDept(null); }}>
              বাতিল
            </Button>
            <Button variant="primary" type="submit" size="sm" className="btn-institutional" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : editingDept ? 'আপডেট করুন' : 'বিভাগ সংরক্ষণ করুন'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="বিভাগ মুছে ফেলা"
        message={`আপনি কি নিশ্চিতভাবে "${deleteConfirm.dept?.name_bn}" মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.dept && deleteMutation.mutate(deleteConfirm.dept.id)}
        onCancel={() => setDeleteConfirm({ show: false, dept: null })}
      />
    </div>
  );
};