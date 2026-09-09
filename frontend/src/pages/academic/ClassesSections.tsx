import React, { useState, useMemo } from 'react';
import { Card, Button, Row, Col, Badge, Modal, Form, InputGroup } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, UserCheck, Shield, Award, Search, BookOpen } from 'lucide-react';
import { academicApi } from '../../api/academic';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { toast } from 'react-toastify';
import type { SchoolClass, Section } from '../../types/academic';

export const ClassesSections: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedVersion, setSelectedVersion] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    name_bn: '',
    name_en: '',
    numeric_value: 1,
    version: 'English Medium',
    is_active: true,
  });

  const [sectionForm, setSectionForm] = useState({
    name_bn: '',
    name_en: '',
    capacity: 45,
    version: 'English Medium',
    shift: 'MORNING',
    shift_time: '07:45 - 11:10',
    group_name: 'General',
    class_teacher_name: '',
    coordinator_name: '',
    vp_name: '',
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
      version: 'English Medium',
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
      version: c.version || 'English Medium',
      is_active: c.is_active,
    });
    setClassModal(true);
  };

  const handleOpenCreateSection = (c: SchoolClass) => {
    setSectionModal({ show: true, classId: c.id, section: null });
    setSectionForm({
      name_bn: '',
      name_en: '',
      capacity: 45,
      version: c.version || 'English Medium',
      shift: 'MORNING',
      shift_time: '07:45 - 11:10',
      group_name: 'General',
      class_teacher_name: '',
      coordinator_name: '',
      vp_name: '',
    });
  };

  const handleOpenEditSection = (classId: number, section: Section) => {
    setSectionModal({ show: true, classId, section });
    setSectionForm({
      name_bn: section.name_bn,
      name_en: section.name_en,
      capacity: section.capacity || 45,
      version: section.version || 'English Medium',
      shift: section.shift || 'MORNING',
      shift_time: section.shift_time || '07:45 - 11:10',
      group_name: section.group_name || 'General',
      class_teacher_name: section.class_teacher_name || '',
      coordinator_name: section.coordinator_name || '',
      vp_name: section.vp_name || '',
    });
  };

  const filteredClasses = useMemo(() => {
    if (!classesData?.data) return [];
    return classesData.data.filter((c) => {
      // Version filter
      if (selectedVersion === 'em' && c.version !== 'English Medium') return false;
      if (selectedVersion === 'ev' && c.version !== 'English Version') return false;

      // Search filter
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchClassName =
          c.name_en.toLowerCase().includes(q) ||
          c.name_bn.toLowerCase().includes(q) ||
          (c.version && c.version.toLowerCase().includes(q));

        const matchSections = c.sections?.some(
          (s) =>
            s.name_en.toLowerCase().includes(q) ||
            s.name_bn.toLowerCase().includes(q) ||
            (s.class_teacher_name && s.class_teacher_name.toLowerCase().includes(q)) ||
            (s.coordinator_name && s.coordinator_name.toLowerCase().includes(q)) ||
            (s.vp_name && s.vp_name.toLowerCase().includes(q)) ||
            (s.group_name && s.group_name.toLowerCase().includes(q)) ||
            (s.shift && s.shift.toLowerCase().includes(q))
        );

        return matchClassName || matchSections;
      }
      return true;
    });
  }, [classesData, selectedVersion, searchTerm]);

  const totalClassesCount = classesData?.data?.length || 0;
  const emClassesCount = classesData?.data?.filter((c) => c.version === 'English Medium').length || 0;
  const evClassesCount = classesData?.data?.filter((c) => c.version === 'English Version').length || 0;
  const totalSectionsCount = classesData?.data?.reduce((acc, c) => acc + (c.sections?.length || 0), 0) || 0;

  return (
    <div className="classes-sections-container">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
        <div>
          <h2 className="fs-5 fw-bold text-dark mb-1">
            শ্রেণি, শাখা ও শিক্ষক দায়িত্ব বণ্টন (Classes, Sections & Class Teachers)
          </h2>
          <p className="text-muted fs-7 mb-0">
            বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ (BSISC) | মোট শ্রেণি: <strong>{totalClassesCount}</strong> টি, মোট শাখা: <strong>{totalSectionsCount}</strong> টি
          </p>
        </div>

        <Button
          variant="primary"
          className="d-flex align-items-center justify-content-center gap-2 rounded-3 fw-bold btn-institutional px-3 py-2 shadow-sm text-nowrap"
          onClick={handleOpenCreateClass}
        >
          <Plus size={18} />
          <span>নতুন শ্রেণি যোগ করুন</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center justify-content-between">
            <Col xs={12} md={6} lg={5}>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant={selectedVersion === 'all' ? 'dark' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill px-3 fw-semibold fs-7 flex-shrink-0"
                  onClick={() => setSelectedVersion('all')}
                >
                  সকল শ্রেণি ({totalClassesCount})
                </Button>
                <Button
                  variant={selectedVersion === 'em' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill px-3 fw-semibold fs-7 flex-shrink-0"
                  onClick={() => setSelectedVersion('em')}
                >
                  🇬🇧 English Medium ({emClassesCount})
                </Button>
                <Button
                  variant={selectedVersion === 'ev' ? 'success' : 'outline-secondary'}
                  size="sm"
                  className="rounded-pill px-3 fw-semibold fs-7 flex-shrink-0"
                  onClick={() => setSelectedVersion('ev')}
                >
                  🇧🇩 English Version ({evClassesCount})
                </Button>
              </div>
            </Col>

            <Col xs={12} md={6} lg={4}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-white border-end-0 text-muted">
                  <Search size={14} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="শ্রেণি, শাখা, শ্রেণি শিক্ষক, সমন্বয়ক দিয়ে খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-start-0 fs-7"
                />
                {searchTerm && (
                  <Button variant="outline-secondary" size="sm" onClick={() => setSearchTerm('')}>
                    মুছুন
                  </Button>
                )}
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Classes and Sections Grid */}
      {isLoading ? (
        <LoadingSpinner message="শ্রেণি ও শাখা তালিকা লোড হচ্ছে..." />
      ) : filteredClasses.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 p-5 text-center">
          <BookOpen size={48} className="text-muted mx-auto mb-3 opacity-50" />
          <h5 className="fw-bold text-dark">কোন শ্রেণি বা শাখা পাওয়া যায়নি</h5>
          <p className="text-muted fs-7">অনুসন্ধান বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
        </Card>
      ) : (
        <Row className="g-3">
          {filteredClasses.map((c) => (
            <Col key={c.id} xs={12} lg={6} xl={6}>
              <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden">
                <Card.Header className="bg-light border-bottom p-3 d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <div
                      className="avatar-circle fw-bold text-white shadow-xs"
                      style={{
                        backgroundColor: c.version === 'English Version' ? '#0d6938' : '#0f2e5a',
                        width: '36px',
                        height: '36px',
                        fontSize: '0.85rem',
                      }}
                    >
                      {c.name_en.substring(0, 3)}
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-1.5 flex-wrap">
                        <h5 className="fs-6 fw-bold mb-0 text-dark">{c.name_en}</h5>
                        <Badge
                          bg={c.version === 'English Version' ? 'success' : 'primary'}
                          className="fs-9 fw-semibold px-2 py-0.5"
                        >
                          {c.version || 'English Medium'}
                        </Badge>
                      </div>
                      <small className="text-muted fs-8">{c.name_bn}</small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-1">
                    <Badge bg="light" text="dark" className="border fw-semibold px-2 py-1 me-1 fs-8">
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
                    <span className="fs-8 fw-bold text-secondary text-uppercase">শাখাসমূহ (Sections & In-Charges):</span>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 fs-8 text-primary fw-semibold text-decoration-none"
                      onClick={() => handleOpenCreateSection(c)}
                    >
                      + নতুন শাখা যোগ
                    </Button>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {c.sections && c.sections.length > 0 ? (
                      c.sections.map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-3 bg-light border border-light-subtle d-flex flex-column gap-1.5"
                        >
                          {/* Row 1: Section Name, Group Badge, Shift, Actions */}
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-1.5 flex-wrap">
                              <span className="fw-bold text-dark fs-7 font-monospace">
                                শাখা: {s.name_en}
                              </span>
                              {s.group_name && (
                                <Badge bg="secondary-subtle" className="text-secondary-emphasis border fs-9 px-1.5 py-0.5">
                                  {s.group_name}
                                </Badge>
                              )}
                              {s.shift && (
                                <Badge
                                  bg={s.shift === 'DAY' ? 'warning-subtle' : 'info-subtle'}
                                  className={`fs-9 px-1.5 py-0.5 ${s.shift === 'DAY' ? 'text-warning-emphasis' : 'text-info-emphasis'}`}
                                >
                                  {s.shift === 'DAY' ? '☀️ DAY' : '🌅 MORNING'} ({s.shift_time || '07:45 - 11:10'})
                                </Badge>
                              )}
                            </div>

                            <div className="d-flex align-items-center gap-1 flex-shrink-0">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="p-0.5 px-1.5 fs-9"
                                title="শাখা সম্পাদনা"
                                onClick={() => handleOpenEditSection(c.id, s)}
                              >
                                <Edit2 size={12} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="p-0.5 px-1.5 fs-9"
                                title="শাখা মুছে ফেলুন"
                                onClick={() => setDeleteSectionConfirm({ show: true, section: s })}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </div>
                          </div>

                          {/* Row 2: Class Teacher, Coordinator, VP Info */}
                          <div className="d-flex flex-wrap align-items-center gap-x-3 gap-y-1 fs-8 text-secondary bg-white p-2 rounded-2 border border-light-subtle">
                            {/* Class Teacher */}
                            <div className="d-flex align-items-center gap-1">
                              <UserCheck size={13} className="text-success flex-shrink-0" />
                              <span className="text-muted">শ্রেণি শিক্ষক:</span>
                              <span className="fw-bold text-dark">
                                {s.class_teacher ? s.class_teacher.name : s.class_teacher_name || 'নির্ধারিত হয়নি'}
                              </span>
                              {s.class_teacher?.phone && (
                                <span className="font-monospace text-primary fs-9 ms-0.5">
                                  ({s.class_teacher.phone})
                                </span>
                              )}
                            </div>

                            {/* Coordinator */}
                            {s.coordinator_name && (
                              <div className="d-flex align-items-center gap-1">
                                <Award size={13} className="text-primary flex-shrink-0" />
                                <span className="text-muted">সমন্বয়ক:</span>
                                <span className="fw-semibold text-dark">{s.coordinator_name}</span>
                              </div>
                            )}

                            {/* VP */}
                            {s.vp_name && (
                              <div className="d-flex align-items-center gap-1">
                                <Shield size={13} className="text-danger flex-shrink-0" />
                                <span className="text-muted">উপাধ্যক্ষ:</span>
                                <span className="fw-semibold text-dark">{s.vp_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted fs-8 text-center py-2 mb-0">কোন শাখা তৈরি করা হয়নি।</p>
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
            <Form.Label className="fs-7 fw-semibold">ভার্সন / মাধ্যম (Version)</Form.Label>
            <Form.Select
              value={classForm.version}
              onChange={(e) => setClassForm({ ...classForm, version: e.target.value })}
            >
              <option value="English Medium">English Medium</option>
              <option value="English Version">English Version</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শ্রেণির নাম (English, যেমন Std-III / Class-III)</Form.Label>
            <Form.Control
              type="text"
              value={classForm.name_en}
              onChange={(e) => setClassForm({ ...classForm, name_en: e.target.value })}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">শ্রেণির নাম (বাংলা)</Form.Label>
            <Form.Control
              type="text"
              value={classForm.name_bn}
              onChange={(e) => setClassForm({ ...classForm, name_bn: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fs-7 fw-semibold">ক্রমিক নম্বর (Numeric Value: 0-12)</Form.Label>
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
      <Modal show={sectionModal.show} onHide={() => setSectionModal({ show: false, classId: null, section: null })} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold">
            {sectionModal.section ? 'শাখা ও দায়িত্ব তথ্য সম্পাদনা' : 'নতুন শাখা যোগ করুন'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">শাখার নাম (English, যেমন A1 / Nightingale / B)</Form.Label>
                <Form.Control
                  type="text"
                  value={sectionForm.name_en}
                  onChange={(e) => setSectionForm({ ...sectionForm, name_en: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">গ্রুপ / বিভাগ (Group, যেমন General (1370) / SCIENCE)</Form.Label>
                <Form.Control
                  type="text"
                  value={sectionForm.group_name}
                  onChange={(e) => setSectionForm({ ...sectionForm, group_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">শিফট (Shift)</Form.Label>
                <Form.Select
                  value={sectionForm.shift}
                  onChange={(e) => setSectionForm({ ...sectionForm, shift: e.target.value })}
                >
                  <option value="MORNING">MORNING (প্রভাতি)</option>
                  <option value="DAY">DAY (দিবা)</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">সময়সূচী (Shift Time, যেমন 07:45 - 11:10)</Form.Label>
                <Form.Control
                  type="text"
                  value={sectionForm.shift_time}
                  onChange={(e) => setSectionForm({ ...sectionForm, shift_time: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">শ্রেণি শিক্ষক (Class Teacher)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="শিক্ষকের নাম"
                  value={sectionForm.class_teacher_name}
                  onChange={(e) => setSectionForm({ ...sectionForm, class_teacher_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">একাডেমিক সমন্বয়ক (Coordinator)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="সমন্বয়কের নাম"
                  value={sectionForm.coordinator_name}
                  onChange={(e) => setSectionForm({ ...sectionForm, coordinator_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">উপাধ্যক্ষ (Vice Principal / VP)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="উপাধ্যক্ষের নাম"
                  value={sectionForm.vp_name}
                  onChange={(e) => setSectionForm({ ...sectionForm, vp_name: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fs-7 fw-semibold">ধারণক্ষমতা (Capacity)</Form.Label>
                <Form.Control
                  type="number"
                  value={sectionForm.capacity}
                  onChange={(e) => setSectionForm({ ...sectionForm, capacity: Number(e.target.value) })}
                />
              </Form.Group>
            </Col>
          </Row>
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
        message={`আপনি কি নিশ্চিতভাবে "${deleteClassConfirm.classItem?.name_en}" মুছে ফেলতে চান?`}
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
        message={`আপনি কি নিশ্চিতভাবে "${deleteSectionConfirm.section?.name_en}" শাখাটি মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteSectionMutation.isPending}
        onConfirm={() => deleteSectionConfirm.section && deleteSectionMutation.mutate(deleteSectionConfirm.section.id)}
        onCancel={() => setDeleteSectionConfirm({ show: false, section: null })}
      />
    </div>
  );
};
