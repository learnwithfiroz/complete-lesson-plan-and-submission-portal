import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Table, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, Trash2, Edit2 } from 'lucide-react';
import { academicApi } from '../../api/academic';
import { departmentsApi } from '../../api/departments';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import type { Subject, Chapter } from '../../types/academic';

export const SubjectsChapters: React.FC = () => {
  const queryClient = useQueryClient();
  const [subjectModal, setSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const [chapterModal, setChapterModal] = useState<{
    show: boolean;
    subjectId: number | null;
    chapter: Chapter | null;
  }>({
    show: false,
    subjectId: null,
    chapter: null,
  });

  const [deleteSubjectConfirm, setDeleteSubjectConfirm] = useState<{
    show: boolean;
    subject: Subject | null;
  }>({
    show: false,
    subject: null,
  });

  const [deleteChapterConfirm, setDeleteChapterConfirm] = useState<{
    show: boolean;
    chapter: Chapter | null;
  }>({
    show: false,
    chapter: null,
  });

  const [subjectForm, setSubjectForm] = useState({
    name_bn: 'জীববিজ্ঞান',
    name_en: 'Biology',
    code: 'BIO-09',
    department_id: '',
    class_id: '',
    is_active: true,
  });

  const [chapterForm, setChapterForm] = useState({
    chapter_no: 1,
    title_bn: 'অধ্যায় ১: জীবন পাঠ ও কোষ বিভাজন',
    title_en: 'Chapter 1: Life and Cell Division',
  });

  const { data: subjectsData, isLoading } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicApi.getSubjects(),
  });

  const { data: deptsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments(),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicApi.getClasses(),
  });

  const saveSubjectMutation = useMutation({
    mutationFn: (data: any) => {
      if (editingSubject) {
        return academicApi.updateSubject(editingSubject.id, data);
      }
      return academicApi.createSubject(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Subject saved successfully.');
      setSubjectModal(false);
      setEditingSubject(null);
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: (id: number) => academicApi.deleteSubject(id),
    onSuccess: () => {
      toast.success('Subject deleted successfully.');
      setDeleteSubjectConfirm({ show: false, subject: null });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const saveChapterMutation = useMutation({
    mutationFn: (data: any) => {
      if (chapterModal.chapter) {
        return academicApi.updateChapter(chapterModal.chapter.id, data);
      }
      return academicApi.createChapter(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Chapter saved successfully.');
      setChapterModal({ show: false, subjectId: null, chapter: null });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (id: number) => academicApi.deleteChapter(id),
    onSuccess: () => {
      toast.success('Chapter deleted successfully.');
      setDeleteChapterConfirm({ show: false, chapter: null });
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const handleOpenCreateSubject = () => {
    setEditingSubject(null);
    setSubjectForm({
      name_bn: '',
      name_en: '',
      code: '',
      department_id: '',
      class_id: '',
      is_active: true,
    });
    setSubjectModal(true);
  };

  const handleOpenEditSubject = (sub: Subject) => {
    setEditingSubject(sub);
    setSubjectForm({
      name_bn: sub.name_bn,
      name_en: sub.name_en,
      code: sub.code,
      department_id: sub.department?.id ? String(sub.department.id) : '',
      class_id: '',
      is_active: sub.is_active,
    });
    setSubjectModal(true);
  };

  const handleOpenCreateChapter = (subjectId: number) => {
    setChapterModal({ show: true, subjectId, chapter: null });
    setChapterForm({
      chapter_no: 1,
      title_bn: '',
      title_en: '',
    });
  };

  const handleOpenEditChapter = (subjectId: number, ch: Chapter) => {
    setChapterModal({ show: true, subjectId, chapter: ch });
    setChapterForm({
      chapter_no: ch.chapter_no,
      title_bn: ch.title_bn,
      title_en: ch.title_en,
    });
  };

  return (
    <div className="subjects-chapters-container">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-5 fw-bold text-dark mb-1">
            বিষয় ও অধ্যায় ব্যবস্থাপনা (Subjects & Chapters)
          </h2>
          <p className="text-muted fs-7 mb-0">
            পাঠ্যসূচির সকল বিষয়, বিভাগীয় কোড এবং অধ্যায়ভিত্তিক পাঠ্যক্রম পরিচালনা করুন
          </p>
        </div>

        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 rounded-3 fw-bold btn-institutional px-3 py-2 shadow-sm"
          onClick={handleOpenCreateSubject}
        >
          <Plus size={18} />
          <span>নতুন বিষয় যোগ করুন</span>
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner message="বিষয়ের তালিকা লোড হচ্ছে..." />
      ) : (
        <Row className="g-4">
          {subjectsData?.data?.map((sub) => (
            <Col key={sub.id} lg={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Header className="bg-light border-bottom p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <BookOpen size={20} className="text-primary" />
                    <div>
                      <h5 className="fs-6 fw-bold mb-0 text-dark">{sub.name_bn}</h5>
                      <small className="text-muted">{sub.name_en}</small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-1.5">
                    <Badge bg="primary" className="font-monospace fw-semibold px-2 py-1">
                      {sub.code}
                    </Badge>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="p-1 px-1.5 fs-8"
                      title="বিষয় সম্পাদনা"
                      onClick={() => handleOpenEditSubject(sub)}
                    >
                      <Edit2 size={13} />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="p-1 px-1.5 fs-8"
                      title="বিষয় মুছে ফেলুন"
                      onClick={() => setDeleteSubjectConfirm({ show: true, subject: sub })}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </Card.Header>

                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between text-muted fs-8 mb-3 pb-2 border-bottom">
                    <span>বিভাগ: <strong>{sub.department?.name_bn || 'সাধারণ'}</strong></span>
                    <span>স্ট্যাটাস: <strong>{sub.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</strong></span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fs-7 fw-bold text-secondary mb-0">অধ্যায়সমূহ (Chapters):</h6>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 fs-8 text-primary fw-semibold text-decoration-none"
                      onClick={() => handleOpenCreateChapter(sub.id)}
                    >
                      + নতুন অধ্যায় যোগ করুন
                    </Button>
                  </div>

                  {sub.chapters && sub.chapters.length > 0 ? (
                    <div className="table-responsive">
                      <Table size="sm" className="mb-0 fs-8 align-middle">
                        <thead>
                          <tr className="text-muted">
                            <th>নং</th>
                            <th>অধ্যায়ের শিরোনাম</th>
                            <th className="text-end">অ্যাকশন</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sub.chapters.map((ch) => (
                            <tr key={ch.id}>
                              <td className="fw-bold text-primary font-monospace">{ch.chapter_no}</td>
                              <td>
                                <div className="fw-semibold text-dark">{ch.title_bn}</div>
                                <small className="text-muted">{ch.title_en}</small>
                              </td>
                              <td className="text-end">
                                <Button
                                  variant="link"
                                  className="text-primary p-0 me-2"
                                  title="অধ্যায় সম্পাদনা"
                                  onClick={() => handleOpenEditChapter(sub.id, ch)}
                                >
                                  <Edit2 size={13} />
                                </Button>
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  title="অধ্যায় মুছে ফেলুন"
                                  onClick={() => setDeleteChapterConfirm({ show: true, chapter: ch })}
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
                    <p className="text-muted fs-8 text-center py-2 mb-0">কোন অধ্যায় যুক্ত করা হয়নি।</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add / Edit Subject Modal */}
      <Modal show={subjectModal} onHide={() => { setSubjectModal(false); setEditingSubject(null); }} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {editingSubject ? 'বিষয়ের তথ্য সম্পাদনা' : 'নতুন বিষয় যুক্ত করুন'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">বিষয়ের নাম (বাংলা)</Form.Label>
            <Form.Control
              type="text"
              value={subjectForm.name_bn}
              onChange={(e) => setSubjectForm({ ...subjectForm, name_bn: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">বিষয়ের নাম (English)</Form.Label>
            <Form.Control
              type="text"
              value={subjectForm.name_en}
              onChange={(e) => setSubjectForm({ ...subjectForm, name_en: e.target.value })}
            />
          </Form.Group>
          <Row className="g-2 mb-3">
            <Col sm={6}>
              <Form.Label className="fs-7 fw-semibold">বিষয় কোড (Subject Code)</Form.Label>
              <Form.Control
                type="text"
                value={subjectForm.code}
                onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
              />
            </Col>
            <Col sm={6}>
              <Form.Label className="fs-7 fw-semibold">বিভাগ</Form.Label>
              <Form.Select
                value={subjectForm.department_id}
                onChange={(e) => setSubjectForm({ ...subjectForm, department_id: e.target.value })}
              >
                <option value="">-- বিভাগ নির্বাচন --</option>
                {deptsData?.data?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name_bn}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শ্রেণি</Form.Label>
            <Form.Select
              value={subjectForm.class_id}
              onChange={(e) => setSubjectForm({ ...subjectForm, class_id: e.target.value })}
            >
              <option value="">-- শ্রেণি নির্বাচন --</option>
              {classesData?.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_bn}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => { setSubjectModal(false); setEditingSubject(null); }}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={() =>
              saveSubjectMutation.mutate({
                ...subjectForm,
                department_id: subjectForm.department_id ? Number(subjectForm.department_id) : null,
                class_id: subjectForm.class_id ? Number(subjectForm.class_id) : null,
              })
            }
            disabled={saveSubjectMutation.isPending}
          >
            {saveSubjectMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : editingSubject ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add / Edit Chapter Modal */}
      <Modal
        show={chapterModal.show}
        onHide={() => setChapterModal({ show: false, subjectId: null, chapter: null })}
        centered
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {chapterModal.chapter ? 'অধ্যায়ের তথ্য সম্পাদনা' : 'নতুন অধ্যায় যুক্ত করুন'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">অধ্যায় নম্বর</Form.Label>
            <Form.Control
              type="number"
              value={chapterForm.chapter_no}
              onChange={(e) => setChapterForm({ ...chapterForm, chapter_no: Number(e.target.value) })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">অধ্যায়ের শিরোনাম (বাংলা)</Form.Label>
            <Form.Control
              type="text"
              value={chapterForm.title_bn}
              onChange={(e) => setChapterForm({ ...chapterForm, title_bn: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">অধ্যায়ের শিরোনাম (English)</Form.Label>
            <Form.Control
              type="text"
              value={chapterForm.title_en}
              onChange={(e) => setChapterForm({ ...chapterForm, title_en: e.target.value })}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => setChapterModal({ show: false, subjectId: null, chapter: null })}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={() =>
              saveChapterMutation.mutate({
                ...chapterForm,
                subject_id: chapterModal.subjectId,
              })
            }
            disabled={saveChapterMutation.isPending}
          >
            {saveChapterMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : chapterModal.chapter ? 'আপডেট করুন' : 'অধ্যায় সংরক্ষণ করুন'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Subject Confirmation */}
      <ConfirmDialog
        show={deleteSubjectConfirm.show}
        title="বিষয় মুছে ফেলা"
        message={`আপনি কি নিশ্চিতভাবে "${deleteSubjectConfirm.subject?.name_bn}" মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteSubjectMutation.isPending}
        onConfirm={() => deleteSubjectConfirm.subject && deleteSubjectMutation.mutate(deleteSubjectConfirm.subject.id)}
        onCancel={() => setDeleteSubjectConfirm({ show: false, subject: null })}
      />

      {/* Delete Chapter Confirmation */}
      <ConfirmDialog
        show={deleteChapterConfirm.show}
        title="অধ্যায় মুছে ফেলা"
        message={`আপনি কি নিশ্চিতভাবে "${deleteChapterConfirm.chapter?.title_bn}" অধ্যায়টি মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteChapterMutation.isPending}
        onConfirm={() => deleteChapterConfirm.chapter && deleteChapterMutation.mutate(deleteChapterConfirm.chapter.id)}
        onCancel={() => setDeleteChapterConfirm({ show: false, chapter: null })}
      />
    </div>
  );
};