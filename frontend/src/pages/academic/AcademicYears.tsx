import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Table, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, Trash2, Edit2 } from 'lucide-react';
import { academicApi } from '../../api/academic';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import type { AcademicYear, Term } from '../../types/academic';

export const AcademicYears: React.FC = () => {
  const queryClient = useQueryClient();
  const [yearModal, setYearModal] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  const [termModal, setTermModal] = useState<{ show: boolean; yearId: number | null; term: Term | null }>({
    show: false,
    yearId: null,
    term: null,
  });

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; year: AcademicYear | null }>({
    show: false,
    year: null,
  });

  const [deleteTermConfirm, setDeleteTermConfirm] = useState<{ show: boolean; term: Term | null }>({
    show: false,
    term: null,
  });

  const [yearForm, setYearForm] = useState({
    name: '2027',
    start_date: '2027-01-01',
    end_date: '2027-12-31',
    is_current: false,
  });

  const [termForm, setTermForm] = useState({
    name_bn: '১ম সাময়িক / ১লা টার্ম',
    name_en: '1st Term',
    start_date: '2026-01-01',
    end_date: '2026-06-30',
    is_current: true,
  });

  const { data: yearsData, isLoading } = useQuery({
    queryKey: ['academicYears'],
    queryFn: () => academicApi.getAcademicYears(),
  });

  const saveYearMutation = useMutation({
    mutationFn: (data: typeof yearForm) => {
      if (editingYear) {
        return academicApi.updateAcademicYear(editingYear.id, data);
      }
      return academicApi.createAcademicYear(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Academic year saved successfully.');
      setYearModal(false);
      setEditingYear(null);
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    },
  });

  const setCurrentMutation = useMutation({
    mutationFn: (id: number) => academicApi.setCurrentYear(id),
    onSuccess: (res) => {
      toast.success(res.message || 'Current year updated.');
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    },
  });

  const deleteYearMutation = useMutation({
    mutationFn: (id: number) => academicApi.deleteAcademicYear(id),
    onSuccess: () => {
      toast.success('Academic year deleted successfully.');
      setDeleteConfirm({ show: false, year: null });
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    },
  });

  const saveTermMutation = useMutation({
    mutationFn: (data: any) => {
      if (termModal.term) {
        return academicApi.updateTerm(termModal.term.id, data);
      }
      return academicApi.createTerm(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Term saved successfully.');
      setTermModal({ show: false, yearId: null, term: null });
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    },
  });

  const deleteTermMutation = useMutation({
    mutationFn: (id: number) => academicApi.deleteTerm(id),
    onSuccess: () => {
      toast.success('Term deleted successfully.');
      setDeleteTermConfirm({ show: false, term: null });
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
    },
  });

  const handleOpenCreateYear = () => {
    setEditingYear(null);
    setYearForm({
      name: new Date().getFullYear() + 1 + '',
      start_date: `${new Date().getFullYear() + 1}-01-01`,
      end_date: `${new Date().getFullYear() + 1}-12-31`,
      is_current: false,
    });
    setYearModal(true);
  };

  const handleOpenEditYear = (year: AcademicYear) => {
    setEditingYear(year);
    setYearForm({
      name: year.name,
      start_date: year.start_date,
      end_date: year.end_date,
      is_current: year.is_current,
    });
    setYearModal(true);
  };

  const handleOpenCreateTerm = (yearId: number) => {
    setTermModal({ show: true, yearId, term: null });
    setTermForm({
      name_bn: '',
      name_en: '',
      start_date: '',
      end_date: '',
      is_current: true,
    });
  };

  const handleOpenEditTerm = (yearId: number, term: Term) => {
    setTermModal({ show: true, yearId, term });
    setTermForm({
      name_bn: term.name_bn,
      name_en: term.name_en,
      start_date: term.start_date,
      end_date: term.end_date,
      is_current: term.is_current,
    });
  };

  return (
    <div className="academic-years-container">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-5 fw-bold text-dark mb-1">
            শিক্ষাবর্ষ ও টার্ম ব্যবস্থাপনা (Academic Years & Terms)
          </h2>
          <p className="text-muted fs-7 mb-0">
            প্রাতিষ্ঠানিক শিক্ষাবর্ষ, সেমিস্টার ও টার্মের সময়সীমা পরিচালনা করুন
          </p>
        </div>

        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 rounded-3 fw-bold btn-institutional px-3 py-2 shadow-sm"
          onClick={handleOpenCreateYear}
        >
          <Plus size={18} />
          <span>নতুন শিক্ষাবর্ষ যোগ করুন</span>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="শিক্ষাবর্ষের তালিকা লোড হচ্ছে..." />
      ) : (
        <Row className="g-4">
          {yearsData?.data?.map((year) => (
            <Col key={year.id} lg={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Header className="bg-light border-bottom p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <Calendar size={20} className="text-primary" />
                    <h5 className="fs-6 fw-bold mb-0 text-dark">
                      শিক্ষাবর্ষ: {year.name}
                    </h5>
                    {year.is_current ? (
                      <Badge bg="success" className="fw-semibold px-2 py-1">
                        চলতি সেশন (Current)
                      </Badge>
                    ) : (
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="py-0 px-2 fs-8"
                        onClick={() => setCurrentMutation.mutate(year.id)}
                      >
                        চলতি হিসেবে চিহ্নিত করুন
                      </Button>
                    )}
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="p-1 px-2 fs-8"
                      title="সম্পাদনা করুন"
                      onClick={() => handleOpenEditYear(year)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="p-1 px-2 fs-8"
                      title="মুছে ফেলুন"
                      onClick={() => setDeleteConfirm({ show: true, year })}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between text-muted fs-8 mb-3 pb-2 border-bottom">
                    <span>শুরুর তারিখ: <strong>{year.start_date}</strong></span>
                    <span>সমাপ্তির তারিখ: <strong>{year.end_date}</strong></span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fs-7 fw-bold text-secondary mb-0">টার্ম / সেমিস্টার তালিকা:</h6>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 fs-8 text-primary fw-semibold text-decoration-none"
                      onClick={() => handleOpenCreateTerm(year.id)}
                    >
                      + নতুন টার্ম যোগ করুন
                    </Button>
                  </div>

                  {year.terms && year.terms.length > 0 ? (
                    <div className="table-responsive">
                      <Table size="sm" className="mb-0 fs-8 align-middle">
                        <thead>
                          <tr className="text-muted">
                            <th>টার্মের নাম</th>
                            <th>সময়কাল</th>
                            <th className="text-end">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {year.terms.map((t) => (
                            <tr key={t.id}>
                              <td>
                                <div className="fw-bold text-dark">{t.name_bn}</div>
                                <small className="text-muted">{t.name_en}</small>
                              </td>
                              <td className="text-muted font-monospace fs-9">
                                {t.start_date} হতে {t.end_date}
                              </td>
                              <td className="text-end">
                                <Button
                                  variant="link"
                                  className="text-primary p-0 me-2"
                                  title="সম্পাদনা"
                                  onClick={() => handleOpenEditTerm(year.id, t)}
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  title="মুছে ফেলুন"
                                  onClick={() => setDeleteTermConfirm({ show: true, term: t })}
                                >
                                  <Trash2 size={13} />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted fs-8 mb-0 py-2 text-center">কোন টার্ম যোগ করা হয়নি।</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add / Edit Year Modal */}
      <Modal show={yearModal} onHide={() => { setYearModal(false); setEditingYear(null); }} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {editingYear ? 'শিক্ষাবর্ষের তথ্য সম্পাদনা' : 'নতুন শিক্ষাবর্ষ তৈরি'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শিক্ষাবর্ষের নাম (যেমন: 2027)</Form.Label>
            <Form.Control
              type="text"
              value={yearForm.name}
              onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })}
            />
          </Form.Group>
          <Row className="g-2 mb-3">
            <Col sm={6}>
              <Form.Label className="fs-7 fw-semibold">শুরুর তারিখ</Form.Label>
              <Form.Control
                type="date"
                value={yearForm.start_date}
                onChange={(e) => setYearForm({ ...yearForm, start_date: e.target.value })}
              />
            </Col>
            <Col sm={6}>
              <Form.Label className="fs-7 fw-semibold">শেষের তারিখ</Form.Label>
              <Form.Control
                type="date"
                value={yearForm.end_date}
                onChange={(e) => setYearForm({ ...yearForm, end_date: e.target.value })}
              />
            </Col>
          </Row>
          <Form.Check
            type="checkbox"
            id="is_current_year"
            label={<span className="fs-7">চলতি শিক্ষাবর্ষ হিসেবে নির্ধারণ করুন</span>}
            checked={yearForm.is_current}
            onChange={(e) => setYearForm({ ...yearForm, is_current: e.target.checked })}
          />
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => { setYearModal(false); setEditingYear(null); }}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={() => saveYearMutation.mutate(yearForm)}
            disabled={saveYearMutation.isPending}
          >
            {saveYearMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : editingYear ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add / Edit Term Modal */}
      <Modal
        show={termModal.show}
        onHide={() => setTermModal({ show: false, yearId: null, term: null })}
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {termModal.term ? 'টার্মের তথ্য সম্পাদনা' : 'নতুন টার্ম / সেমিস্টার যোগ করুন'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">টার্মের নাম (বাংলা)</Form.Label>
            <Form.Control
              type="text"
              value={termForm.name_bn}
              onChange={(e) => setTermForm({ ...termForm, name_bn: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">টার্মের নাম (English)</Form.Label>
            <Form.Control
              type="text"
              value={termForm.name_en}
              onChange={(e) => setTermForm({ ...termForm, name_en: e.target.value })}
            />
          </Form.Group>
          <Row className="g-2">
            <Col sm={6}>
              <Form.Label className="fs-7 fw-semibold">শুরুর তারিখ</Form.Label>
              <Form.Control
                type="date"
                value={termForm.start_date}
                onChange={(e) => setTermForm({ ...termForm, start_date: e.target.value })}
              />
            </Col>
            <Col sm={6}>
              <Form.Label className="fs-7 fw-semibold">শেষের তারিখ</Form.Label>
              <Form.Control
                type="date"
                value={termForm.end_date}
                onChange={(e) => setTermForm({ ...termForm, end_date: e.target.value })}
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => setTermModal({ show: false, yearId: null, term: null })}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={() =>
              saveTermMutation.mutate({
                ...termForm,
                academic_year_id: termModal.yearId,
              })
            }
            disabled={saveTermMutation.isPending}
          >
            {saveTermMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : termModal.term ? 'আপডেট করুন' : 'টার্ম সংরক্ষণ করুন'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Year Confirmation */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="শিক্ষাবর্ষ মুছে ফেলা"
        message={`আপনি কি নিশ্চিতভাবে "${deleteConfirm.year?.name}" শিক্ষাবর্ষটি মুছে ফেলতে চান? এটি সংশ্লিষ্ট টার্মসমূহও মুছে ফেলতে পারে।`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteYearMutation.isPending}
        onConfirm={() => deleteConfirm.year && deleteYearMutation.mutate(deleteConfirm.year.id)}
        onCancel={() => setDeleteConfirm({ show: false, year: null })}
      />

      {/* Delete Term Confirmation */}
      <ConfirmDialog
        show={deleteTermConfirm.show}
        title="টার্ম মুছে ফেলা"
        message={`আপনি কি নিশ্চিতভাবে "${deleteTermConfirm.term?.name_bn}" টার্মটি মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteTermMutation.isPending}
        onConfirm={() => deleteTermConfirm.term && deleteTermMutation.mutate(deleteTermConfirm.term.id)}
        onCancel={() => setDeleteTermConfirm({ show: false, term: null })}
      />
    </div>
  );
};