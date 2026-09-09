import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Row, Col, Form, ProgressBar, Modal, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Paperclip, 
  Search, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  Phone, 
  Lock, 
  Unlock,
  Printer, 
  Copy, 
  Archive, 
  Building, 
  FileText, 
  LayoutList, 
  MessageSquare, 
  Send, 
  UploadCloud, 
  Trash2, 
  AlertCircle, 
  ShieldCheck, 
  Check, 
  Clock, 
  FileCheck, 
  Users,
  TrendingUp,
  Sparkles,
  X
} from 'lucide-react';
import { submissionTrackingApi } from '../../api/submissionTracking';
import type { BatchDetailResponse, SundayReportData } from '../../types/submissionTracking';
import { ProfessionalSundayReport } from '../../components/submissions/ProfessionalSundayReport';
import { WhatsAppReminderModal } from '../../components/submissions/WhatsAppReminderModal';
import { printOfficialSundayReport } from '../../utils/printReport';
import { openWhatsAppChat, renderReminderMessage, REMINDER_TEMPLATES } from '../../utils/whatsappReminder';
import { toast } from 'react-toastify';

export const SubmissionBatchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<BatchDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Active View Tab for Admins: 'table' or 'report'
  const [activeView, setActiveView] = useState<'table' | 'report'>('table');

  // Sunday Report Modal & Data State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [reportData, setReportData] = useState<SundayReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  // Teacher Upload State
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  // Admin Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'not_submitted'>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');

  useEffect(() => {
    loadDetails();
  }, [id]);

  const loadDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await submissionTrackingApi.getBatchDetails(Number(id));
      setData(res.data);
      if (res.data.is_admin) {
        loadReportData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ব্যাচের বিস্তারিত তথ্য লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const loadReportData = async (): Promise<SundayReportData | null> => {
    if (!id) return null;
    setLoadingReport(true);
    try {
      const res = await submissionTrackingApi.getSundayReport(Number(id));
      setReportData(res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to load sunday report', err);
      return null;
    } finally {
      setLoadingReport(false);
    }
  };

  const handleToggleActive = async () => {
    if (!data) return;
    try {
      await submissionTrackingApi.toggleActive(data.batch.id);
      toast.info('ব্যাচ স্ট্যাটাস পরিবর্তন হয়েছে।');
      loadDetails();
    } catch (err: any) {
      toast.error('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleDownloadAllZip = async () => {
    if (!data) return;
    setDownloadingZip(true);
    try {
      await submissionTrackingApi.downloadAllZip(data.batch.id, data.batch.title);
      toast.success('সকল জমা হওয়া ফাইল ZIP আকারে ডাউনলোড শুরু হয়েছে!');
    } catch (err: any) {
      toast.error(err.message || err.response?.data?.message || 'ZIP ফাইল ডাউনলোডে সমস্যা হয়েছে। জমা হওয়া ফাইল নাও থাকতে পারে।');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handlePrintSundayReport = async () => {
    toast.info('🖨️ অফিসিয়াল রিপোর্ট প্রিন্ট ডায়ালগ ওপেন হচ্ছে...');
    let rData = reportData;
    if (!rData) {
      rData = await loadReportData();
    }
    if (rData) {
      printOfficialSundayReport(rData);
    } else {
      toast.error('রিপোর্ট ডাটা লোড করা সম্ভব হয়নি।');
    }
  };

  const handleCopyMissingPhones = (phoneList?: string[]) => {
    let phones: string[] = [];
    if (phoneList && phoneList.length > 0) {
      phones = phoneList.filter((p) => p && p !== '0' && p !== 'N/A');
    } else if (data && data.teachers) {
      phones = data.teachers
        .filter((t) => !t.is_submitted && t.phone && t.phone !== '0' && t.phone !== 'N/A')
        .map((t) => t.phone as string);
    }

    if (phones.length === 0) {
      toast.info('অনুপস্থিত শিক্ষকদের কোনো ফোন নম্বর পাওয়া যায়নি বা সবাই জমা দিয়েছেন!');
      return;
    }

    const textToCopy = phones.join(', ');
    navigator.clipboard.writeText(textToCopy);
    toast.success(`মোট ${phones.length} জন মিসিং শিক্ষকের ফোন নম্বর কপি করা হয়েছে! (SMS / WhatsApp এ পেস্ট করতে পারেন)`);
  };

  // Teacher Action: Submit or Update Files
  const handleTeacherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || uploadFiles.length === 0) {
      toast.warning('অনুগ্রহ করে অন্তত একটি ফাইল নির্বাচন করুন।');
      return;
    }

    setUploading(true);
    try {
      await submissionTrackingApi.submitFiles(Number(id), uploadFiles, uploadRemarks.trim() || undefined);
      toast.success('🎉 পাঠ পরিকল্পনা সফলভাবে জমা ও সিস্টেমে সংরক্ষিত হয়েছে!');
      setUploadFiles([]);
      setUploadRemarks('');
      loadDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ফাইল আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setUploading(false);
    }
  };

  // Teacher Action: Delete File
  const handleDeleteUploadedFile = async (fileId: number) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ফাইলটি মুছে ফেলতে চান?')) return;
    setDeletingFileId(fileId);
    try {
      await submissionTrackingApi.deleteFile(fileId);
      toast.success('ফাইল মুছে ফেলা হয়েছে।');
      loadDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ফাইল মোছা সম্ভব হয়নি।');
    } finally {
      setDeletingFileId(null);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Generate distinct avatar gradient based on teacher name
  const getAvatarGradient = (name: string) => {
    const gradients = [
      'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      'linear-gradient(135deg, #10b981, #047857)',
      'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      'linear-gradient(135deg, #f59e0b, #b45309)',
      'linear-gradient(135deg, #ec4899, #be185d)',
      'linear-gradient(135deg, #06b6d4, #0e7490)',
      'linear-gradient(135deg, #6366f1, #4338ca)',
      'linear-gradient(135deg, #14b8a6, #0f766e)',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const getInitials = (name: string) => {
    if (!name) return 'T';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="p-5 text-center text-muted">
        <Spinner animation="border" variant="primary" size="sm" className="me-2" />
        ব্যাচ তথ্য লোড হচ্ছে...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="alert alert-danger p-4 text-center rounded-3 shadow-sm">
        <h5>ব্যাচের তথ্য পাওয়া যায়নি।</h5>
        <Button variant="link" onClick={() => navigate('/submission-tracking')}>
          সব ব্যাচ দেখুন
        </Button>
      </div>
    );
  }

  const { batch, is_admin: isAdmin = false, my_submission: mySubmission } = data;
  const stats = data.stats || {
    total_teachers: 0,
    submitted_count: 0,
    not_submitted_count: 0,
    completion_percent: 0,
  };
  const teachers = data.teachers || [];

  // Extract unique departments for filter (admin view)
  const departments = Array.from(new Set(teachers.map((t) => t.department_name).filter(Boolean)));

  // Filtered teachers for admin view
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.phone && t.phone.includes(search)) ||
      (t.designation && t.designation.toLowerCase().includes(search.toLowerCase())) ||
      (t.employee_id && t.employee_id.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'submitted' && t.is_submitted) ||
      (statusFilter === 'not_submitted' && !t.is_submitted);

    const matchesDept = selectedDept === 'all' || t.department_name === selectedDept;

    return matchesSearch && matchesStatus && matchesDept;
  });

  const missingTeachersCount = stats.not_submitted_count;

  return (
    <div className="pb-5">
      {/* 1. Top Action Toolbar */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <Button
          variant="light"
          size="sm"
          className="d-flex align-items-center border shadow-xs rounded-pill px-3 py-1.5 fw-semibold text-secondary"
          onClick={() => navigate('/submission-tracking')}
        >
          <ArrowLeft size={16} className="me-1 text-dark" />
          <span>সব ব্যাচ দেখুন (Back to Batches)</span>
        </Button>

        {/* ADMIN ACTION TOOLBAR */}
        {isAdmin && (
          <div className="d-flex gap-2 flex-wrap align-items-center">
            {/* Group 1: Institutional Sunday Report & WhatsApp */}
            <div className="toolbar-group bg-white p-1 rounded-3 border shadow-xs">
              <Button
                variant="primary"
                size="sm"
                className="d-flex align-items-center fw-bold shadow-xs px-3 py-1 text-white border-0"
                style={{ backgroundColor: '#0f2e5a' }}
                onClick={handlePrintSundayReport}
                title="১-ক্লিকে প্রাতিষ্ঠানিক হেডার, লোগো ও ফুটারসহ রবিবার সকালের রিপোর্ট প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন"
              >
                <Printer size={15} className="me-1.5 text-warning" />
                <span>রবিবার সকালের রিপোর্ট</span>
              </Button>

              {missingTeachersCount > 0 && (
                <Button
                  size="sm"
                  className="d-flex align-items-center fw-bold shadow-xs px-2.5 py-1 text-white border-0 btn-whatsapp"
                  onClick={() => setShowWhatsAppModal(true)}
                  title="লেসন প্ল্যান জমা না দেওয়া শিক্ষকদের হোয়াটসঅ্যাপে সরাসরি রিমাইন্ডার মেসেজ পাঠান"
                >
                  <MessageSquare size={15} className="me-1.5" />
                  <span>WhatsApp তাগিদ ({missingTeachersCount})</span>
                </Button>
              )}

              {missingTeachersCount > 0 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="d-flex align-items-center fw-semibold px-2 py-1 border-0"
                  style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                  onClick={() => handleCopyMissingPhones()}
                  title="SMS বা WhatsApp এ রিমাইন্ডার পাঠানোর জন্য মিসিং শিক্ষকদের ফোন নম্বর কপি করুন"
                >
                  <Copy size={14} className="me-1" />
                  <span>নম্বর কপি ({missingTeachersCount})</span>
                </Button>
              )}
            </div>

            {/* Group 2: Slot Controls & Full ZIP Download */}
            <div className="toolbar-group bg-white p-1 rounded-3 border shadow-xs">
              {stats.submitted_count > 0 && (
                <Button
                  variant="outline-success"
                  size="sm"
                  className="d-flex align-items-center fw-semibold border-0 px-2.5 py-1"
                  style={{ backgroundColor: '#f0fdf4', color: '#166534' }}
                  onClick={handleDownloadAllZip}
                  disabled={downloadingZip}
                  title="সকল শিক্ষকের জমাকৃত ফাইল এক ক্লিকে ZIP হিসেবে ডাউনলোড করুন"
                >
                  <Archive size={14} className="me-1.5 text-success" />
                  <span>{downloadingZip ? 'ZIP প্রস্তুত হচ্ছে...' : 'সব ফাইল ZIP ডাউনলোড'}</span>
                </Button>
              )}

              <Button
                variant={batch.is_active ? 'outline-secondary' : 'success'}
                size="sm"
                className="d-flex align-items-center border-0 px-2.5 py-1 fw-semibold"
                style={batch.is_active ? { backgroundColor: '#f1f5f9', color: '#475569' } : {}}
                onClick={handleToggleActive}
                title={batch.is_active ? 'স্লট বন্ধ বা লক করুন' : 'স্লট পুনরায় সক্রিয় করুন'}
              >
                {batch.is_active ? (
                  <>
                    <Lock size={14} className="me-1 text-muted" /> লক করুন
                  </>
                ) : (
                  <>
                    <Unlock size={14} className="me-1 text-white" /> সক্রিয় করুন
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Main Executive Batch Card */}
      <Card className="border shadow-sm rounded-3 mb-4 bg-white overflow-hidden">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-3">
            <div>
              {/* Category & Status Pill Line */}
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 fw-semibold small">
                  {batch.category.replace('_', ' ').toUpperCase()}
                </span>

                {batch.allow_multiple_files && (
                  <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 fw-semibold small">
                    একাধিক ফাইল অনুমোদিত
                  </span>
                )}

                {batch.is_active ? (
                  <span className="badge rounded-pill bg-success text-white px-2.5 py-1 fw-semibold small d-inline-flex align-items-center">
                    <span className="spinner-grow spinner-grow-sm me-1.5" style={{ width: 7, height: 7 }} />
                    সক্রিয় (Open)
                  </span>
                ) : (
                  <span className="badge rounded-pill bg-secondary text-white px-2.5 py-1 fw-semibold small">
                    🔒 বন্ধ / লক করা (Closed)
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="fw-bold text-dark mb-2">{batch.title}</h3>

              {/* Metadata strip */}
              <div className="text-muted small d-flex align-items-center gap-3 flex-wrap">
                <span className="d-inline-flex align-items-center bg-light px-2.5 py-1 rounded-2 border">
                  <Calendar size={14} className="me-1.5 text-primary" />
                  <strong>কার্যকাল:</strong>&nbsp;{batch.date_range_display}
                </span>

                <span className="d-inline-flex align-items-center bg-light px-2.5 py-1 rounded-2 border">
                  <Building size={14} className="me-1.5 text-secondary" />
                  <strong>শ্রেণি / বিভাগ:</strong>&nbsp;{batch.class_name}
                </span>

                <span className="d-inline-flex align-items-center px-2.5 py-1 rounded-2 border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#b91c1c' }}>
                  <Clock size={14} className="me-1.5 text-danger" />
                  <strong>ডেডলাইন:</strong>&nbsp;শনিবার রাত ১১:৫৯
                </span>
              </div>
            </div>

            {isAdmin && (
              <Button
                variant="outline-secondary"
                size="sm"
                className="d-flex align-items-center fw-semibold rounded-pill px-3 py-1.5 shadow-xs"
                onClick={handlePrintSundayReport}
              >
                <Printer size={14} className="me-1.5 text-primary" />
                পেজ প্রিন্ট / PDF
              </Button>
            )}
          </div>

          {batch.instructions && (
            <div className="p-3 bg-light rounded-3 border small mt-3 d-flex align-items-start gap-2">
              <AlertCircle size={17} className="text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-dark">নির্দেশনা (Instructions):</strong> {batch.instructions}
              </div>
            </div>
          )}

          {/* ADMIN: 4 Modern KPI Metric Scorecard Tiles */}
          {isAdmin && (
            <Row className="g-3 mt-3">
              {/* Tile 1: Total Teachers */}
              <Col lg={3} sm={6} xs={6}>
                <div className="kpi-card kpi-card-navy h-100 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-label">মোট শিক্ষক (Total Faculty)</div>
                    <div className="kpi-value text-dark">{stats.total_teachers}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>তালিকাভুক্ত শিক্ষক</div>
                  </div>
                  <div className="kpi-icon-box kpi-icon-navy">
                    <Users size={22} />
                  </div>
                </div>
              </Col>

              {/* Tile 2: Submitted */}
              <Col lg={3} sm={6} xs={6}>
                <div className="kpi-card kpi-card-success h-100 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-label text-success">জমা দিয়েছেন (Submitted)</div>
                    <div className="kpi-value text-success">{stats.submitted_count}</div>
                    <div className="text-success" style={{ fontSize: '0.75rem' }}>সফলভাবে জমা হয়েছে</div>
                  </div>
                  <div className="kpi-icon-box kpi-icon-success">
                    <CheckCircle size={22} />
                  </div>
                </div>
              </Col>

              {/* Tile 3: Pending */}
              <Col lg={3} sm={6} xs={6}>
                <div className="kpi-card kpi-card-danger h-100 d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-label text-danger">বাকি রয়েছে (Pending)</div>
                    <div className="kpi-value text-danger">{stats.not_submitted_count}</div>
                    <div className="text-danger" style={{ fontSize: '0.75rem' }}>তাগিদ পাঠানো প্রয়োজন</div>
                  </div>
                  <div className="kpi-icon-box kpi-icon-danger">
                    <AlertCircle size={22} />
                  </div>
                </div>
              </Col>

              {/* Tile 4: Completion Rate */}
              <Col lg={3} sm={6} xs={12}>
                <div className="kpi-card kpi-card-primary h-100">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="kpi-label text-primary">অগ্রগতি (Completion)</div>
                    <div className="kpi-icon-box kpi-icon-primary" style={{ width: 34, height: 34 }}>
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div className="d-flex align-items-baseline gap-2 mb-1.5">
                    <span className="kpi-value text-primary">{stats.completion_percent}%</span>
                    <span className="text-muted small">সম্পন্ন</span>
                  </div>
                  <ProgressBar
                    now={stats.completion_percent}
                    variant={stats.completion_percent > 80 ? 'success' : stats.completion_percent > 50 ? 'primary' : 'warning'}
                    style={{ height: '7px', borderRadius: '10px' }}
                  />
                </div>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* ========================================================================= */}
      {/* SECTION 1: TEACHER PORTAL VIEW (Self Submission & Revision Management) */}
      {/* ========================================================================= */}
      {!isAdmin && (
        <div className="teacher-submission-portal">
          <Row className="g-4">
            {/* Left Col: Current Submission Status & Files */}
            <Col lg={7}>
              <Card className="border shadow-sm rounded-3 h-100 bg-white">
                <Card.Header className="bg-white p-3.5 border-bottom d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <FileCheck size={20} className="text-primary me-2" />
                    <h5 className="fw-bold mb-0 text-dark">আমার জমাকৃত পাঠ পরিকল্পনা</h5>
                  </div>
                  {mySubmission ? (
                    <span className="badge rounded-pill bg-success px-3 py-1.5 fw-semibold d-inline-flex align-items-center shadow-xs">
                      <Check size={14} className="me-1" /> জমা সম্পন্ন (Submitted)
                    </span>
                  ) : (
                    <span className="badge rounded-pill bg-danger px-3 py-1.5 fw-semibold d-inline-flex align-items-center shadow-xs">
                      <AlertCircle size={14} className="me-1" /> এখনও জমা দেননি
                    </span>
                  )}
                </Card.Header>

                <Card.Body className="p-4">
                  {mySubmission ? (
                    <div>
                      {/* Submission Summary Banner */}
                      <div className="p-3.5 rounded-3 mb-4 border" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
                        <Row className="g-3 small align-items-center">
                          <Col sm={6}>
                            <div className="text-muted">জমা দেওয়ার স্ট্যাটাস:</div>
                            <div className="fw-bold text-success fs-6 d-flex align-items-center mt-1">
                              <CheckCircle size={18} className="me-1.5" />
                              সফলভাবে জমা হয়েছে
                            </div>
                          </Col>

                          <Col sm={6}>
                            <div className="text-muted">রিভিশন কাউন্ট:</div>
                            <div className="mt-1">
                              {mySubmission.update_count && mySubmission.update_count > 1 ? (
                                <span className="badge rounded-pill bg-warning text-dark border px-2.5 py-1 fs-6 font-monospace">
                                  🔄 মোট {mySubmission.update_count} বার আপডেট হয়েছে
                                </span>
                              ) : (
                                <span className="badge rounded-pill bg-success bg-opacity-75 text-white px-2.5 py-1 fs-6 font-monospace">
                                  🔄 ১ম বার জমা দেওয়া হয়েছে
                                </span>
                              )}
                            </div>
                          </Col>

                          <Col sm={6} className="mt-2">
                            <span className="text-muted">প্রথম জমার সময়: </span>
                            <strong className="text-dark font-monospace">{mySubmission.submitted_at || '—'}</strong>
                          </Col>

                          <Col sm={6} className="mt-2">
                            <span className="text-muted">সর্বশেষ আপডেট: </span>
                            <strong className="text-dark font-monospace">{mySubmission.last_updated_at || mySubmission.submitted_at || '—'}</strong>
                          </Col>

                          {mySubmission.remarks && (
                            <Col xs={12} className="mt-2 pt-2 border-top">
                              <span className="text-muted">আপনার মন্তব্য / নোট: </span>
                              <span className="text-dark fw-medium">{mySubmission.remarks}</span>
                            </Col>
                          )}
                        </Row>
                      </div>

                      {/* Uploaded Files List */}
                      <h6 className="fw-bold text-dark mb-3 d-flex align-items-center">
                        <Paperclip size={16} className="me-1.5 text-primary" />
                        সংযুক্ত ফাইলসমূহ ({mySubmission.files.length}টি ফাইল)
                      </h6>

                      {mySubmission.files.length === 0 ? (
                        <p className="text-muted small">কোনো ফাইল খুঁজে পাওয়া যায়নি।</p>
                      ) : (
                        <div className="d-flex flex-column gap-2 mb-4">
                          {mySubmission.files.map((file) => (
                            <div
                              key={file.id}
                              className="d-flex align-items-center justify-content-between p-3 rounded-3 border bg-light"
                            >
                              <div className="d-flex align-items-center overflow-hidden me-2">
                                <FileText size={20} className="text-primary me-2.5 flex-shrink-0" />
                                <div className="text-truncate">
                                  <div className="fw-semibold text-dark text-truncate" title={file.file_name}>
                                    {file.file_name}
                                  </div>
                                  <div className="text-muted d-flex align-items-center gap-1.5 flex-wrap" style={{ fontSize: '0.75rem' }}>
                                    <span>{formatFileSize(file.file_size)}</span>
                                    <span>• {file.file_type?.toUpperCase() || 'FILE'}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-outline-primary py-1 px-3 d-flex align-items-center text-decoration-none rounded-pill fw-semibold shadow-xs"
                                  title="ফাইলটি সরাসরি ডাউনলোড বা ভিউ করুন"
                                >
                                  <Download size={13} className="me-1.5" />
                                  ডাউনলোড
                                </a>

                                {batch.is_active && (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="py-1 px-2 d-flex align-items-center rounded-2"
                                    onClick={() => handleDeleteUploadedFile(file.id)}
                                    disabled={deletingFileId === file.id}
                                    title="ফাইল মুছে ফেলুন"
                                  >
                                    {deletingFileId === file.id ? (
                                      <Spinner animation="border" size="sm" />
                                    ) : (
                                      <Trash2 size={13} />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <div className="mb-3 text-warning">
                        <AlertCircle size={48} className="text-warning" />
                      </div>
                      <h6 className="fw-bold text-dark">আপনি এখনও কোনো লেসন প্ল্যান বা ফাইল জমা দেননি</h6>
                      <p className="text-muted small mb-0 px-md-4">
                        ডান পাশের ফর্মটি ব্যবহার করে নির্ধারিত ডেডলাইনের পূর্বে আপনার পাঠ পরিকল্পনা আপলোড করুন। ফাইলটি স্বয়ংক্রিয়ভাবে সার্ভারে সুরক্ষিত থাকবে।
                      </p>
                    </div>
                  )}

                  {/* Privacy Assurance Footer Note */}
                  <div className="p-3 rounded-3 bg-light border mt-4 small text-muted d-flex align-items-start gap-2">
                    <ShieldCheck size={20} className="text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>নিরাপত্তা ও প্রাইভেসি:</strong> আপনার জমাকৃত পাঠ পরিকল্পনা সম্পূর্ণ সুরক্ষিত। আপনি ও একাডেমিক কর্তৃপক্ষ ছাড়া অন্য কোনো সাধারণ শিক্ষক আপনার ফাইল দেখতে পারবেন না।
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            {/* Right Col: Upload / Update Submission Form */}
            <Col lg={5}>
              <Card className="border shadow-sm rounded-3 bg-white h-100">
                <Card.Header className="bg-white p-3.5 border-bottom">
                  <div className="d-flex align-items-center">
                    <UploadCloud size={20} className="text-primary me-2" />
                    <h5 className="fw-bold mb-0 text-dark">
                      {mySubmission ? 'নতুন ফাইল আপডেট করুন' : 'ফাইল আপলোড করুন'}
                    </h5>
                  </div>
                </Card.Header>

                <Card.Body className="p-4">
                  {!batch.is_active ? (
                    <Alert variant="secondary" className="p-3 text-center rounded-3">
                      <Lock size={28} className="mb-2 text-muted" />
                      <h6 className="fw-bold text-dark mb-1">এই ব্যাচের সময়সীমা শেষ হয়েছে / স্লট লক করা আছে</h6>
                      <p className="small text-muted mb-0">
                        প্রশাসন থেকে ব্যাচটি বন্ধ থাকায় বর্তমানে নতুন ফাইল আপলোড বা পরিবর্তন গ্রহণ করা সম্ভব নয়।
                      </p>
                    </Alert>
                  ) : (
                    <Form onSubmit={handleTeacherSubmit}>
                      {mySubmission && (
                        <div className="p-3 rounded-3 small mb-3 border d-flex align-items-start gap-2" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' }}>
                          <Sparkles size={16} className="text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>টিপস:</strong> আপনি একাধিকবার সংশোধিত ফাইল আপলোড করতে পারবেন। সর্বশেষ রিভিশনটি মূল ফাইল হিসেবে সেভ থাকবে।
                          </div>
                        </div>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold text-dark small">
                          ফাইল নির্বাচন করুন (Choose Files) <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="file"
                          multiple={batch.allow_multiple_files}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files) {
                              setUploadFiles(Array.from(e.target.files));
                            }
                          }}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                          disabled={uploading}
                          className="p-2.5 rounded-3"
                        />
                        <Form.Text className="text-muted small">
                          সমর্থিত ফরম্যাট: PDF, DOC, DOCX, XLS, PPTX, JPG (সর্বোচ্চ ২৫ MB)
                          {batch.allow_multiple_files && ' • একসাথে একাধিক ফাইল সিলেক্ট করতে পারেন।'}
                        </Form.Text>
                      </Form.Group>

                      {/* Selected files preview */}
                      {uploadFiles.length > 0 && (
                        <div className="mb-3 p-3 bg-light rounded-3 border small">
                          <strong className="text-dark d-block mb-1.5">নির্বাচিত ফাইল ({uploadFiles.length}টি):</strong>
                          <div className="d-flex flex-column gap-1">
                            {uploadFiles.map((f, i) => (
                              <div key={i} className="d-flex align-items-center justify-content-between text-muted text-truncate bg-white p-1.5 px-2 rounded border">
                                <span className="text-truncate">{f.name}</span>
                                <span className="text-secondary fw-semibold ms-2 font-monospace">{formatFileSize(f.size)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-bold text-dark small">
                          মন্তব্য বা নোট (ঐচ্ছিক / Optional Remarks)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="লেসন প্ল্যান বা সপ্তাহের বিশেষ কোনো নোট থাকলে লিখুন..."
                          value={uploadRemarks}
                          onChange={(e) => setUploadRemarks(e.target.value)}
                          disabled={uploading}
                          className="rounded-3"
                        />
                      </Form.Group>

                      <Button
                        type="submit"
                        variant="primary"
                        className="w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center shadow-sm rounded-3"
                        disabled={uploading || uploadFiles.length === 0}
                        style={{ backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' }}
                      >
                        {uploading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            ফাইল আপলোড হচ্ছে...
                          </>
                        ) : mySubmission ? (
                          <>
                            <UploadCloud size={18} className="me-2 text-warning" />
                            নতুন রিভিশন ফাইল আপডেট করুন
                          </>
                        ) : (
                          <>
                            <UploadCloud size={18} className="me-2 text-warning" />
                            লেসন প্ল্যান জমা দিন (Submit File)
                          </>
                        )}
                      </Button>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ADMIN / COORDINATOR MANAGEMENT PORTAL */}
      {/* ========================================================================= */}
      {isAdmin && (
        <>
          {/* Segmented View Switcher Tabs */}
          <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="segmented-control-wrapper">
              <button
                type="button"
                className={`segmented-control-btn ${activeView === 'table' ? 'active' : ''}`}
                onClick={() => setActiveView('table')}
              >
                <LayoutList size={16} />
                <span>ম্যানেজমেন্ট টেবিল ভিউ (Table View)</span>
              </button>
              <button
                type="button"
                className={`segmented-control-btn ${activeView === 'report' ? 'active' : ''}`}
                onClick={() => setActiveView('report')}
              >
                <FileText size={16} />
                <span>রবিবার সকালের অফিশিয়াল রিপোর্ট (Official Report)</span>
              </button>
            </div>

            <div className="text-muted small">
              মোট <strong>{filteredTeachers.length}</strong> জন শিক্ষক ফিল্টার করা হয়েছে
            </div>
          </div>

          {/* VIEW 1: MANAGEMENT TABLE */}
          {activeView === 'table' && (
            <Card className="border shadow-sm rounded-3 bg-white overflow-hidden">
              <Card.Header className="bg-white p-3 border-bottom">
                <Row className="g-2 align-items-center">
                  {/* Search Input */}
                  <Col md={4}>
                    <div className="position-relative">
                      <Search size={15} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                      <Form.Control
                        className="ps-5 pe-4 rounded-3"
                        size="sm"
                        placeholder="শিক্ষকের নাম, মোবাইল বা পদবি দিয়ে খুঁজুন..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      {search && (
                        <button
                          type="button"
                          className="btn btn-link btn-sm position-absolute top-50 end-0 translate-middle-y text-muted p-1 me-1"
                          onClick={() => setSearch('')}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </Col>

                  {/* Status Filter Segmented Badges */}
                  <Col md={5}>
                    <div className="d-flex gap-1.5 flex-wrap">
                      <Button
                        size="sm"
                        variant={statusFilter === 'all' ? 'dark' : 'light'}
                        className={`rounded-pill px-3 py-1 fw-semibold border ${statusFilter === 'all' ? '' : 'text-secondary'}`}
                        onClick={() => setStatusFilter('all')}
                      >
                        সব ({teachers.length})
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === 'submitted' ? 'success' : 'light'}
                        className={`rounded-pill px-3 py-1 fw-semibold border ${statusFilter === 'submitted' ? 'text-white' : 'text-success'}`}
                        style={statusFilter === 'submitted' ? { backgroundColor: '#10b981' } : {}}
                        onClick={() => setStatusFilter('submitted')}
                      >
                        জমা দিয়েছেন ({stats.submitted_count})
                      </Button>
                      <Button
                        size="sm"
                        variant={statusFilter === 'not_submitted' ? 'danger' : 'light'}
                        className={`rounded-pill px-3 py-1 fw-semibold border ${statusFilter === 'not_submitted' ? 'text-white' : 'text-danger'}`}
                        style={statusFilter === 'not_submitted' ? { backgroundColor: '#ef4444' } : {}}
                        onClick={() => setStatusFilter('not_submitted')}
                      >
                        বাকি রয়েছে ({stats.not_submitted_count})
                      </Button>
                    </div>
                  </Col>

                  {/* Department Filter */}
                  <Col md={3}>
                    <Form.Select
                      size="sm"
                      className="rounded-3"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                    >
                      <option value="all">সব বিভাগ (All Departments)</option>
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Header>

              <Card.Body className="p-0">
                <Table responsive hover className="table-modern align-middle mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '55px' }} className="text-center">SL</th>
                      <th style={{ width: '90px' }}>EMP ID</th>
                      <th>শিক্ষকের নাম ও পদবি (Teacher)</th>
                      <th>বিভাগ (Department)</th>
                      <th>মোবাইল নম্বর (Phone)</th>
                      <th>স্ট্যাটাস ও রিভিশন (Status)</th>
                      <th>আপলোডকৃত ফাইল</th>
                      <th>জমা / আপডেটের সময়</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          <AlertCircle size={32} className="text-muted mb-2 opacity-50" />
                          <div>কোনো শিক্ষকের তথ্য খুঁজে পাওয়া যায়নি।</div>
                        </td>
                      </tr>
                    ) : (
                      filteredTeachers.map((t, idx) => (
                        <tr key={t.teacher_id} className={t.is_submitted ? '' : 'table-light'}>
                          {/* Serial Number */}
                          <td className="text-center">
                            <span className="badge rounded-pill bg-light text-secondary border font-monospace fw-bold px-2 py-1">
                              {t.serial_number !== undefined && t.serial_number !== null ? t.serial_number : idx + 1}
                            </span>
                          </td>

                          {/* Employee ID */}
                          <td>
                            {t.employee_id ? (
                              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 font-monospace px-2 py-1">
                                {t.employee_id}
                              </span>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>

                          {/* Teacher Name + Designation + Avatar */}
                          <td>
                            <div className="d-flex align-items-center gap-2.5">
                              <div
                                className="teacher-avatar-chip"
                                style={{ background: getAvatarGradient(t.name) }}
                              >
                                {getInitials(t.name)}
                              </div>
                              <div>
                                <div className="fw-bold text-dark">{t.name}</div>
                                <div className="text-muted small">{t.designation}</div>
                              </div>
                            </div>
                          </td>

                          {/* Department */}
                          <td>
                            <span className="badge rounded-pill bg-light text-secondary border px-2.5 py-1">
                              {t.department_name}
                            </span>
                          </td>

                          {/* Phone */}
                          <td className="small font-monospace">
                            {t.phone && t.phone !== '0' && t.phone !== 'N/A' ? (
                              <a href={`tel:${t.phone}`} className="badge rounded-pill bg-light text-dark border text-decoration-none px-2.5 py-1 d-inline-flex align-items-center">
                                <Phone size={12} className="me-1 text-primary" />
                                {t.phone}
                              </a>
                            ) : (
                              <span className="text-muted small">N/A</span>
                            )}
                          </td>

                          {/* Status & Revisions */}
                          <td>
                            {t.is_submitted ? (
                              <div>
                                <span
                                  className="badge rounded-pill px-2.5 py-1 d-inline-flex align-items-center"
                                  style={{ backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}
                                >
                                  <CheckCircle size={13} className="me-1" />
                                  Submitted
                                </span>
                                {t.update_count && t.update_count > 1 ? (
                                  <div className="mt-1">
                                    <span 
                                      className="badge rounded-pill px-2 py-0.5 font-monospace"
                                      style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.7rem' }}
                                      title={`এই শিক্ষক মোট ${t.update_count} বার ফাইল আপডেট করেছেন`}
                                    >
                                      🔄 {t.update_count} বার আপডেট
                                    </span>
                                  </div>
                                ) : (
                                  <div className="mt-1">
                                    <span className="badge rounded-pill px-2 py-0.5 text-muted font-monospace bg-light border" style={{ fontSize: '0.68rem' }}>
                                      ১ম জমা
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span
                                className="badge rounded-pill px-2.5 py-1 d-inline-flex align-items-center"
                                style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }}
                              >
                                <XCircle size={13} className="me-1" />
                                জমা দেননি
                              </span>
                            )}
                          </td>

                          {/* Files & Downloads */}
                          <td>
                            {t.files && t.files.length > 0 ? (
                              <div className="d-flex flex-column gap-1">
                                {t.files.map((file) => (
                                  <a
                                    key={file.id}
                                    href={file.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="file-download-chip"
                                    title={`Download ${file.file_name}`}
                                  >
                                    <Paperclip size={12} className="text-primary" />
                                    <span>{file.file_name.length > 20 ? file.file_name.substring(0, 18) + '...' : file.file_name}</span>
                                    <Download size={11} className="text-muted ms-1" />
                                  </a>
                                ))}
                              </div>
                            ) : (
                              <div className="d-flex align-items-center gap-1">
                                <Button
                                  size="sm"
                                  className="py-1 px-2.5 d-inline-flex align-items-center text-white fw-semibold rounded-pill btn-whatsapp border-0 shadow-xs"
                                  style={{ fontSize: '0.78rem' }}
                                  onClick={() => {
                                    const msg = renderReminderMessage(REMINDER_TEMPLATES[0].text, t, batch);
                                    if (!t.phone || t.phone === '0' || t.phone === 'N/A') {
                                      toast.error('শিক্ষকের কোনো ফোন নম্বর নেই।');
                                      return;
                                    }
                                    openWhatsAppChat(t.phone, msg);
                                  }}
                                  disabled={!t.phone || t.phone === '0' || t.phone === 'N/A'}
                                  title="এই শিক্ষককে হোয়াটসঅ্যাপে রিমাইন্ডার পাঠান"
                                >
                                  <Send size={11} className="me-1.5" />
                                  WhatsApp তাগিদ
                                </Button>
                              </div>
                            )}
                          </td>

                          {/* Timestamp */}
                          <td className="small font-monospace text-muted">
                            <div>{t.submitted_at || '—'}</div>
                            {t.last_updated_at && t.last_updated_at !== t.submitted_at && (
                              <div className="small text-primary fw-medium" style={{ fontSize: '0.72rem' }}>
                                আপডেট: {t.last_updated_at}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* VIEW 2: FULL PROFESSIONAL REPORT VIEW */}
          {activeView === 'report' && (
            <div>
              <div className="d-flex justify-content-end mb-3 gap-2 flex-wrap">
                {missingTeachersCount > 0 && (
                  <Button
                    size="sm"
                    className="d-flex align-items-center fw-bold shadow-xs text-white btn-whatsapp border-0 rounded-pill px-3 py-1.5"
                    onClick={() => setShowWhatsAppModal(true)}
                  >
                    <MessageSquare size={15} className="me-1.5" />
                    হোয়াটসঅ্যাপ রিমাইন্ডার ({missingTeachersCount})
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  className="d-flex align-items-center fw-bold shadow-xs rounded-pill px-3.5 py-1.5 text-white border-0"
                  style={{ backgroundColor: '#0f2e5a' }}
                  onClick={handlePrintSundayReport}
                >
                  <Printer size={15} className="me-1.5 text-warning" />
                  এই রিপোর্টটি প্রিন্ট করুন / Save as PDF
                </Button>
              </div>
              {loadingReport ? (
                <div className="p-5 text-center text-muted bg-white rounded-3 border">
                  <Spinner animation="border" size="sm" className="me-2" />
                  রিপোর্ট লোড হচ্ছে...
                </div>
              ) : reportData ? (
                <ProfessionalSundayReport 
                  data={reportData} 
                  onPrint={handlePrintSundayReport} 
                  onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                />
              ) : (
                <div className="p-4 text-center text-danger bg-white rounded-3 border">রিপোর্ট ডাটা পাওয়া যায়নি।</div>
              )}
            </div>
          )}

          {/* SUNDAY MORNING REPORT MODAL (Full-width Popup View) */}
          <Modal
            show={showReportModal}
            onHide={() => setShowReportModal(false)}
            size="xl"
            centered
            className="sunday-report-modal"
          >
            <Modal.Header closeButton className="bg-light">
              <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center">
                <Building size={18} className="me-2 text-primary" />
                রবিবার সকালের অফিসিয়াল রিপোর্ট (Sunday Morning Tracking Report)
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-3 p-md-4">
              {loadingReport ? (
                <div className="p-5 text-center text-muted">
                  <Spinner animation="border" size="sm" className="me-2" />
                  রিপোর্ট প্রস্তুত করা হচ্ছে...
                </div>
              ) : reportData ? (
                <ProfessionalSundayReport 
                  data={reportData} 
                  onPrint={handlePrintSundayReport} 
                  onOpenWhatsApp={() => setShowWhatsAppModal(true)}
                />
              ) : (
                <div className="p-4 text-center text-danger">রিপোর্ট ডাটা পাওয়া যায়নি।</div>
              )}
            </Modal.Body>

            <Modal.Footer className="bg-light">
              <Button variant="secondary" className="rounded-pill px-3" onClick={() => setShowReportModal(false)}>
                বন্ধ করুন
              </Button>
              <Button 
                variant="primary" 
                className="d-flex align-items-center fw-bold rounded-pill px-3.5" 
                style={{ backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' }}
                onClick={handlePrintSundayReport}
              >
                <Printer size={16} className="me-1.5 text-warning" />
                রিপোর্ট প্রিন্ট করুন / Save as PDF
              </Button>
            </Modal.Footer>
          </Modal>

          {/* WHATSAPP REMINDER MODAL */}
          <WhatsAppReminderModal
            show={showWhatsAppModal}
            onHide={() => setShowWhatsAppModal(false)}
            batch={batch}
            missingTeachers={teachers.filter((t) => !t.is_submitted)}
          />
        </>
      )}
    </div>
  );
};