import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Table, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, UserCheck, Trash2 } from 'lucide-react';
import { academicApi } from '../../api/academic';
import { usersApi } from '../../api/users';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import type { TeacherAssignment } from '../../types/academic';

export const TeacherAssignments: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; assignment: TeacherAssignment | null }>({
    show: false,
    assignment: null,
  });

  const [form, setForm] = useState({
    teacher_id: '',
    academic_year_id: '',
    class_id: '',
    section_id: '',
    subject_id: '',
  });

  // Query Assignments
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ['teacherAssignments'],
    queryFn: () => academicApi.getAssignments(),
  });

  // Supporting Dropdown Queries
  const { data: teachersData } = useQuery({
    queryKey: ['teachersList'],
    queryFn: () => usersApi.getUsers({ role: 'teacher', per_page: 50 }),
  });

  const { data: yearsData } = useQuery({
    queryKey: ['academicYears'],
    queryFn: () => academicApi.getAcademicYears(),
  });

  const { data: classesData } = useQuery({
    queryKey: ['classes'],
    queryFn: () => academicApi.getClasses(),
  });

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects'],
    queryFn: () => academicApi.getSubjects(),
  });

  const selectedClass = classesData?.data?.find((c) => c.id === Number(form.class_id));

  const createAssignmentMutation = useMutation({
    mutationFn: (data: any) => academicApi.createAssignment(data),
    onSuccess: (res) => {
      toast.success(res.message || 'Teacher assigned successfully.');
      setModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: (id: number) => academicApi.deleteAssignment(id),
    onSuccess: () => {
      toast.success('Assignment revoked.');
      setDeleteConfirm({ show: false, assignment: null });
      queryClient.invalidateQueries({ queryKey: ['teacherAssignments'] });
    },
  });

  const handleOpenCreate = () => {
    const currentYear = yearsData?.data?.find((y) => y.is_current) || yearsData?.data?.[0];
    setForm({
      teacher_id: '',
      academic_year_id: currentYear ? String(currentYear.id) : '',
      class_id: '',
      section_id: '',
      subject_id: '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = () => {
    if (!form.teacher_id || !form.academic_year_id || !form.class_id || !form.section_id || !form.subject_id) {
      toast.warning('Please select all assignment criteria.');
      return;
    }

    createAssignmentMutation.mutate({
      teacher_id: Number(form.teacher_id),
      academic_year_id: Number(form.academic_year_id),
      class_id: Number(form.class_id),
      section_id: Number(form.section_id),
      subject_id: Number(form.subject_id),
    });
  };

  return (
    <div className="teacher-assignments-container">
      <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
        <div>
          <h2 className="fs-5 fw-bold text-dark mb-1">
            শিক্ষক ক্লাস ও বিষয় বরাদ্দ (Teacher Assignments)
          </h2>
          <p className="text-muted fs-7 mb-0">
            শিক্ষকদের শিক্ষাবর্ষ, শ্রেণি, শাখা ও বিষয় বরাদ্দ করুন। পাঠ পরিকল্পনা তৈরিতে এই ডাটা ব্যবহৃত হবে।
          </p>
        </div>

        <Button
          variant="primary"
          className="d-flex align-items-center gap-2 rounded-3 fw-bold btn-institutional px-3 py-2 shadow-sm"
          onClick={handleOpenCreate}
        >
          <UserPlus size={18} />
          <span>নতুন শিক্ষক বরাদ্দ করুন</span>
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Body className="p-0">
          {isLoading ? (
            <LoadingSpinner message="শিক্ষক বরাদ্দ তালিকা লোড হচ্ছে..." />
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0 fs-7">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">শিক্ষকের নাম</th>
                    <th>শিক্ষাবর্ষ</th>
                    <th>শ্রেণি ও শাখা</th>
                    <th>বিষয় ও কোড</th>
                    <th>বরাদ্দের তারিখ</th>
                    <th className="text-end pe-4">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentsData?.data && assignmentsData.data.length > 0 ? (
                    assignmentsData.data.map((asg) => (
                      <tr key={asg.id}>
                        <td className="ps-4">
                          <div className="d-flex align-items-center gap-2.5">
                            <div className="avatar-circle">
                              {asg.teacher.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="fw-bold text-dark">{asg.teacher.name}</div>
                              <small className="text-muted font-monospace">{asg.teacher.email}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <Badge bg="warning" text="dark" className="font-monospace">
                            {asg.academic_year.name}
                          </Badge>
                        </td>

                        <td>
                          <div className="fw-semibold text-dark">{asg.school_class.name_bn}</div>
                          <small className="text-muted">শাখা: {asg.section.name_bn}</small>
                        </td>

                        <td>
                          <div className="fw-bold text-primary">{asg.subject.name_bn}</div>
                          <small className="badge bg-light text-dark font-monospace border">
                            {asg.subject.code}
                          </small>
                        </td>

                        <td className="text-muted fs-8 font-monospace">
                          {asg.created_at ? new Date(asg.created_at).toLocaleDateString() : '—'}
                        </td>

                        <td className="text-end pe-4">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1 px-2 fs-8"
                            title="বরাদ্দ বাতিল করুন"
                            onClick={() => setDeleteConfirm({ show: true, assignment: asg })}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted">
                        কোন শিক্ষক বরাদ্দ পাওয়া যায়নি।
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Assignment Modal */}
      <Modal show={modalOpen} onHide={() => setModalOpen(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <UserCheck size={20} className="text-primary" />
            <span>নতুন শিক্ষক ক্লাস ও বিষয় বরাদ্দ</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <Row className="g-3">
            
            <Col md={6}>
              <Form.Group controlId="teacher_id">
                <Form.Label className="fs-7 fw-semibold">শিক্ষক নির্বাচন করুন <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={form.teacher_id}
                  onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                >
                  <option value="">-- শিক্ষক নির্বাচন --</option>
                  {teachersData?.data?.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.designation || 'Teacher'})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="academic_year_id">
                <Form.Label className="fs-7 fw-semibold">শিক্ষাবর্ষ <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={form.academic_year_id}
                  onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })}
                >
                  <option value="">-- শিক্ষাবর্ষ নির্বাচন --</option>
                  {yearsData?.data?.map((y) => (
                    <option key={y.id} value={y.id}>
                      সেশন {y.name} {y.is_current ? '(Current Session)' : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="class_id">
                <Form.Label className="fs-7 fw-semibold">শ্রেণি <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={form.class_id}
                  onChange={(e) => setForm({ ...form, class_id: e.target.value, section_id: '' })}
                >
                  <option value="">-- শ্রেণি নির্বাচন --</option>
                  {classesData?.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name_bn} ({c.name_en})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="section_id">
                <Form.Label className="fs-7 fw-semibold">শাখা <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={form.section_id}
                  onChange={(e) => setForm({ ...form, section_id: e.target.value })}
                  disabled={!form.class_id}
                >
                  <option value="">-- শাখা নির্বাচন --</option>
                  {selectedClass?.sections?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name_bn} ({s.name_en})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12}>
              <Form.Group controlId="subject_id">
                <Form.Label className="fs-7 fw-semibold">বিষয় <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                >
                  <option value="">-- বিষয় নির্বাচন --</option>
                  {subjectsData?.data?.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name_bn} ({sub.name_en}) — [কোড: {sub.code}]
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

          </Row>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={handleFormSubmit}
            disabled={createAssignmentMutation.isPending}
          >
            {createAssignmentMutation.isPending ? 'বরাদ্দ হচ্ছে...' : 'বরাদ্দ সম্পন্ন করুন'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="শিক্ষক বরাদ্দ বাতিলকরণ"
        message={`আপনি কি "${deleteConfirm.assignment?.teacher.name}"-এর ${deleteConfirm.assignment?.school_class.name_bn} (${deleteConfirm.assignment?.subject.name_bn}) বরাদ্দ বাতিল করতে চান?`}
        confirmText="বরাদ্দ বাতিল করুন"
        variant="danger"
        isLoading={deleteAssignmentMutation.isPending}
        onConfirm={() => deleteConfirm.assignment && deleteAssignmentMutation.mutate(deleteConfirm.assignment.id)}
        onCancel={() => setDeleteConfirm({ show: false, assignment: null })}
      />
    </div>
  );
};