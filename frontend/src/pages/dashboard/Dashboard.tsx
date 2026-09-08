import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../locales/i18n';
import { FileText, CheckCircle, Clock, RotateCcw, Plus, ArrowRight, Megaphone, Pin, Paperclip, CheckSquare } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import { noticeApi } from '../../api/notices';
import type { DashboardStatsData } from '../../types/dashboard';
import type { Notice } from '../../types/notice';
import { NoticeDetailModal } from '../../components/notices/NoticeDetailModal';
import { StatusBadge } from '../../components/lesson-plan/StatusBadge';
import { useAuthStore } from '../../store/authStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export const Dashboard: React.FC = () => {
  const { language, t } = useTranslation();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [latestNotices, setLatestNotices] = useState<Notice[]>([]);
  const [activeNoticeModal, setActiveNoticeModal] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [res, noticesRes] = await Promise.all([
        dashboardApi.getStats().catch(() => null),
        noticeApi.getNotices({ per_page: 5 }).catch(() => null),
      ]);
      if (res && res.data) {
        setStats(res.data);
      }
      if (noticesRes && 'data' in noticesRes && Array.isArray(noticesRes.data)) {
        setLatestNotices(noticesRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = user?.role_names?.includes('teacher') && !user?.role_names?.some((r) => ['super_admin', 'principal', 'academic_coordinator'].includes(r));

  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="spinner-border text-primary mb-2" role="status" />
        <div className="text-muted small">Loading dashboard insights...</div>
      </div>
    );
  }

  const barData = {
    labels: stats?.submission_trends?.labels || ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    datasets: [
      {
        label: 'Lesson Plans Prepared',
        data: stats?.submission_trends?.data || [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#0f2e5a',
        borderRadius: 4,
      },
    ],
  };

  const doughnutData = {
    labels: ['Approved', 'Submitted', 'Draft', 'Returned', 'Rejected'],
    datasets: [
      {
        data: [
          stats?.summary?.approved || 0,
          stats?.summary?.submitted || 0,
          stats?.summary?.draft || 0,
          stats?.summary?.returned || 0,
          stats?.summary?.rejected || 0,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#94a3b8', '#f59e0b', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      {/* Welcome Banner */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">
            {t('dashboard.welcome_back', 'Welcome back')}, {user?.name}!
          </h4>
          <span className="text-muted small">
            {isTeacher ? 'Teacher Curriculum Dashboard' : 'Academic Leadership & Oversight Dashboard'} | Baridhara Scholars' International School & College
          </span>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/submission-tracking" className="btn btn-outline-primary btn-sm d-flex align-items-center">
            <CheckSquare size={16} className="me-1" /> Submission Tracking
          </Link>
          <Link to="/lesson-plans/create" className="btn btn-primary btn-sm">
            <Plus size={16} className="me-1" /> {t('nav.create_lesson_plan')}
          </Link>
        </div>
      </div>

      {/* Submission Tracking Quick Card */}
      <Card className="border-0 shadow-sm mb-4 text-white" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}>
        <Card.Body className="p-3 p-md-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="badge bg-white text-primary px-2 py-1 fw-bold">Live Tracking</span>
              <h5 className="fw-bold mb-0">Submission Tracking প্যানেল</h5>
            </div>
            <p className="mb-0 text-white-50 small" style={{ maxWidth: '650px' }}>
              শিক্ষকদের পাঠ পরিকল্পনা (Lesson Plan), অ্যাসাইনমেন্ট ও প্রশ্নপত্র সরাসরি ফাইল আপলোড এবং রিয়েল-টাইম জমার অগ্রগতি ট্র্যাক করুন।
            </p>
          </div>
          <Link to="/submission-tracking" className="btn btn-light text-primary fw-bold px-3 py-2 d-flex align-items-center shadow-sm">
            ট্র্যাকিং প্যানেলে প্রবেশ করুন <ArrowRight size={16} className="ms-2" />
          </Link>
        </Card.Body>
      </Card>

      {/* 4 Stat Cards */}
      <Row className="g-2 g-md-3 mb-4">
        <Col lg={3} sm={6} xs={6}>
          <Card className="border shadow-sm border-start border-4 border-primary h-100">
            <Card.Body className="p-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold">Total Plans</span>
                <h3 className="fw-bold mb-0 text-primary">{stats?.summary?.total || 0}</h3>
              </div>
              <div className="p-2 p-md-3 bg-light rounded-circle text-primary">
                <FileText size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6} xs={6}>
          <Card className="border shadow-sm border-start border-4 border-info h-100">
            <Card.Body className="p-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold">Pending Review</span>
                <h3 className="fw-bold mb-0 text-info">
                  {(stats?.summary.submitted || 0) + (stats?.summary.under_review || 0)}
                </h3>
              </div>
              <div className="p-2 p-md-3 bg-light rounded-circle text-info">
                <Clock size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6} xs={6}>
          <Card className="border shadow-sm border-start border-4 border-success h-100">
            <Card.Body className="p-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold">Approved</span>
                <h3 className="fw-bold mb-0 text-success">{stats?.summary.approved || 0}</h3>
              </div>
              <div className="p-2 p-md-3 bg-light rounded-circle text-success">
                <CheckCircle size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={3} sm={6} xs={6}>
          <Card className="border shadow-sm border-start border-4 border-warning h-100">
            <Card.Body className="p-3 d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold">Returned</span>
                <h3 className="fw-bold mb-0 text-warning">{stats?.summary.returned || 0}</h3>
              </div>
              <div className="p-2 p-md-3 bg-light rounded-circle text-warning">
                <RotateCcw size={20} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Charts Row */}
      <Row className="g-3 mb-4">
        <Col md={8}>
          <Card className="border shadow-sm h-100">
            <Card.Header className="bg-white py-3">
              <h6 className="fw-bold mb-0">Daily Preparation Trend (Last 7 Days)</h6>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '240px' }}>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border shadow-sm h-100">
            <Card.Header className="bg-white py-3">
              <h6 className="fw-bold mb-0">Status Breakdown</h6>
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <div style={{ height: '220px', width: '220px' }}>
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Section: Recent Plans & Live Notices */}
      <Row className="g-3">
        {/* Left Column: Recent Lesson Plans */}
        <Col lg={8}>
          <Card className="border shadow-sm h-100">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">Recent Lesson Plans</h6>
              <Link to="/lesson-plans" className="btn btn-link btn-sm p-0 text-decoration-none">
                View All <ArrowRight size={14} />
              </Link>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Code</th>
                    <th>Title</th>
                    <th>Class & Subject</th>
                    <th>Teacher</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats?.recent_plans && stats.recent_plans.length > 0 ? (
                    stats.recent_plans.map((p: any) => (
                      <tr key={p.id}>
                        <td>
                          <strong className="text-primary">{p.code}</strong>
                        </td>
                        <td>{p.title}</td>
                        <td>
                          {p.school_class?.name_en || p.schoolClass?.name_en} - {p.subject?.name_en}
                        </td>
                        <td>{p.teacher?.name}</td>
                        <td>{p.lesson_date}</td>
                        <td>
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="text-end">
                          <Link to={`/lesson-plans/${p.id}`} className="btn btn-sm btn-outline-primary py-0 px-2">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-muted">
                        No recent lesson plans found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Live Notices Widget */}
        <Col lg={4}>
          <Card className="border shadow-sm h-100">
            <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Megaphone size={18} className="text-danger" />
                <h6 className="fw-bold mb-0">{t('notices.live_title', 'Live Circulars & Notices')}</h6>
              </div>
              <Link to="/notices" className="btn btn-link btn-sm p-0 text-decoration-none">
                Board <ArrowRight size={14} />
              </Link>
            </Card.Header>
            <Card.Body className="p-2">
              {latestNotices.length > 0 ? (
                <div className="d-flex flex-column gap-2">
                  {latestNotices.map((n) => {
                    const title = language === 'bn' ? (n.title_bn || n.title_en) : (n.title_en || n.title_bn);

                    return (
                      <div
                        key={n.id}
                        className={`p-2 rounded border ${n.is_pinned ? 'border-warning bg-warning-subtle' : 'bg-light'} cursor-pointer transition-all hover-shadow`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setActiveNoticeModal(n)}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center gap-1">
                            {n.is_pinned && <Pin size={12} className="text-warning" fill="#f59e0b" />}
                            <span className={`badge ${n.priority === 'urgent' ? 'bg-danger' : n.priority === 'high' ? 'bg-warning text-dark' : 'bg-primary'} py-0 px-1`} style={{ fontSize: '10px' }}>
                              {n.priority.toUpperCase()}
                            </span>
                            <span className="badge bg-secondary py-0 px-1 text-uppercase" style={{ fontSize: '9px' }}>
                              {n.category}
                            </span>
                          </div>
                          <small className="text-muted" style={{ fontSize: '11px' }}>
                            {new Date(n.publish_date || n.created_at).toLocaleDateString('en-GB')}
                          </small>
                        </div>
                        <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '13px' }}>
                          {title}
                        </div>
                        {n.attachment_name && (
                          <div className="d-flex align-items-center gap-1 text-primary mt-1" style={{ fontSize: '11px' }}>
                            <Paperclip size={11} />
                            <span className="text-truncate">{n.attachment_name}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-muted small">
                  No active notices published at this moment.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        show={!!activeNoticeModal}
        notice={activeNoticeModal}
        onHide={() => setActiveNoticeModal(null)}
      />
    </div>
  );
};