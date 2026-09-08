import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../locales/i18n';
import { Plus, Search, Eye, Filter, Download, UploadCloud } from 'lucide-react';
import { lessonPlansApi } from '../../api/lessonPlans';
import { academicApi } from '../../api/academic';
import type { LessonPlan } from '../../types/lessonPlan';
import type { AcademicYear, SchoolClass, Subject } from '../../types/academic';
import { StatusBadge } from '../../components/lesson-plan/StatusBadge';
import { QuickUploadLessonPlanModal } from '../../components/lesson-plan/QuickUploadLessonPlanModal';

export const LessonPlanList: React.FC = () => {
  const { t, language } = useTranslation();

  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showQuickUploadModal, setShowQuickUploadModal] = useState(false);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    fetchLessonPlans(currentPage);
  }, [currentPage, selectedStatus, selectedYear, selectedClass, selectedSubject]);

  const loadFilterOptions = async () => {
    try {
      const [yRes, cRes, sRes] = await Promise.all([
        academicApi.getAcademicYears(),
        academicApi.getClasses(),
        academicApi.getSubjects(),
      ]);
      setAcademicYears(yRes.data || []);
      setClasses(cRes.data || []);
      setSubjects(sRes.data || []);
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  const fetchLessonPlans = async (page = 1) => {
    setLoading(true);
    try {
      const params: any = { page, per_page: 15 };
      if (search) params.search = search;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedYear) params.academic_year_id = selectedYear;
      if (selectedClass) params.class_id = selectedClass;
      if (selectedSubject) params.subject_id = selectedSubject;

      const res = await lessonPlansApi.getLessonPlans(params);
      setLessonPlans(res.data || []);
      setTotalPages(res.meta?.last_page || 1);
      setTotalRecords(res.meta?.total || (res.data ? res.data.length : 0));
    } catch (err) {
      console.error('Failed to fetch lesson plans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLessonPlans(1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">{t('nav.lesson_plans')}</h4>
          <span className="text-muted small">Manage, review, upload, and track curriculum lesson plans</span>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowQuickUploadModal(true)}
            className="d-flex align-items-center"
          >
            <UploadCloud size={16} className="me-1" />
            পাঠ পরিকল্পনা ফাইল আপলোড (Quick Upload File)
          </Button>
          <Link to="/lesson-plans/create" className="btn btn-primary btn-sm d-flex align-items-center">
            <Plus size={16} className="me-1" /> {t('nav.create_lesson_plan')}
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card className="border shadow-sm mb-4">
        <Card.Body className="p-3">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-2">
              <Col md={3}>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Search size={15} className="text-muted" />
                  </span>
                  <Form.Control
                    type="text"
                    className="border-start-0"
                    placeholder="Search by code, title, topic..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Status: All</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="returned">Returned</option>
                  <option value="rejected">Rejected</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Year: All</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Class: All</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'bn' ? c.name_bn : c.name_en}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Subject: All</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {language === 'bn' ? s.name_bn : s.name_en}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={1} className="d-flex gap-1">
                <Button variant="outline-primary" type="submit" className="w-100 p-1">
                  <Filter size={15} />
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Plans Table */}
      <Card className="border shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">Lesson Plan Records ({totalRecords})</h6>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.open('/api/v1/reports/export/excel', '_blank')}
          >
            <Download size={14} className="me-1" /> Export CSV/Excel
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Code</th>
                <th>Title & Topic</th>
                <th>Class & Subject</th>
                <th>Teacher</th>
                <th>Lesson Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    Loading lesson plans...
                  </td>
                </tr>
              ) : lessonPlans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No lesson plans found matching the filters.
                  </td>
                </tr>
              ) : (
                lessonPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td>
                      <strong className="text-primary">{plan.code}</strong>
                    </td>
                    <td>
                      <div className="fw-bold">{plan.title}</div>
                      <div className="text-muted small">{plan.topic || '-'}</div>
                    </td>
                    <td>
                      <div>
                        {language === 'bn' ? plan.school_class?.name_bn || plan.schoolClass?.name_bn : plan.school_class?.name_en || plan.schoolClass?.name_en}{' '}
                        {plan.section ? `(${language === 'bn' ? plan.section.name_bn : plan.section.name_en})` : ''}
                      </div>
                      <div className="text-muted small">
                        {language === 'bn' ? plan.subject?.name_bn : plan.subject?.name_en}
                      </div>
                    </td>
                    <td>
                      <div className="small fw-semibold">{plan.teacher?.name}</div>
                    </td>
                    <td>{plan.lesson_date}</td>
                    <td>
                      <StatusBadge status={plan.status} />
                    </td>
                    <td className="text-end">
                      <Link
                        to={`/lesson-plans/${plan.id}`}
                        className="btn btn-sm btn-outline-primary p-1 px-2"
                      >
                        <Eye size={14} className="me-1" /> {t('common.view')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
        {totalPages > 1 && (
          <Card.Footer className="bg-white d-flex justify-content-between align-items-center py-2">
            <span className="small text-muted">
              Page {currentPage} of {totalPages}
            </span>
            <Pagination size="sm" className="mb-0">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              />
              {Array.from({ length: totalPages }).map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      {/* Quick Upload Document Modal */}
      <QuickUploadLessonPlanModal
        show={showQuickUploadModal}
        onHide={() => setShowQuickUploadModal(false)}
        onSuccess={(_newPlanId) => {
          fetchLessonPlans(1);
        }}
        academicYears={academicYears}
        classes={classes}
        subjects={subjects}
      />
    </div>
  );
};