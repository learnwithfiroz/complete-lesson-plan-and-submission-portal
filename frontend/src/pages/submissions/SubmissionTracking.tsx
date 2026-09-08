import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Plus, 
  Info, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  Trash2, 
  Eye, 
  UploadCloud, 
  Paperclip, 
  Clock, 
  Folder,
  MessageSquare,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { submissionTrackingApi } from '../../api/submissionTracking';
import { academicApi } from '../../api/academic';
import type { SubmissionBatch, SubmissionCategory } from '../../types/submissionTracking';
import type { SchoolClass } from '../../types/academic';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const SubmissionTracking: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Active Category Tab
  const [selectedCategory, setSelectedCategory] = useState<SubmissionCategory>('lesson_plan');
  const [activeTabStatus, setActiveTabStatus] = useState<'active' | 'inactive'>('active');

  // Live Clock
  const [currentTime, setCurrentTime] = useState<string>('');

  // Data states
  const [batches, setBatches] = useState<SubmissionBatch[]>([]);
  const [counts, setCounts] = useState({ active: 0, inactive: 0, total_teachers: 0 });
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [creating, setCreating] = useState(false);

  // Teacher Upload Modal / Drawer state per batch
  const [uploadingBatchId, setUploadingBatchId] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [batchId: number]: FileList | null }>({});
  const [uploadRemarks, setUploadRemarks] = useState<{ [batchId: number]: string }>({});
  const [uploading, setUploading] = useState(false);

  // Confirm delete dialog
  const [deleteBatchId, setDeleteBatchId] = useState<number | null>(null);

  // Live Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setCurrentTime(timeStr);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    loadBatches();
  }, [selectedCategory, activeTabStatus]);

  const loadClasses = async () => {
    try {
      const res = await academicApi.getClasses();
      setClasses(res.data || []);
    } catch (err) {
      console.error('Failed to load classes', err);
    }
  };

  const loadBatches = async () => {
    setLoading(true);
    try {
      const res = await submissionTrackingApi.getBatches(selectedCategory, activeTabStatus);
      setBatches(res.data.batches || []);
      setCounts(res.data.counts || { active: 0, inactive: 0, total_teachers: 0 });
    } catch (err) {
      console.error('Failed to load submission batches', err);
      toast.error('ব্যাচ লোড করতে সমস্যা হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      toast.warning('অনুগ্রহ করে নাম এবং তারিখ প্রদান করুন।');
      return;
    }

    setCreating(true);
    try {
      await submissionTrackingApi.createBatch({
        category: selectedCategory,
        title: title.trim(),
        class_id: classId ? Number(classId) : null,
        start_date: startDate,
        end_date: endDate,
        allow_multiple_files: allowMultiple,
        instructions: instructions.trim() || undefined,
      });

      toast.success('নতুন ব্যাচ সফলভাবে তৈরি হয়েছে!');
      setTitle('');
      setInstructions('');
      loadBatches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ব্যাচ তৈরি করা সম্ভব হয়নি।');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (batch: SubmissionBatch) => {
    try {
      await submissionTrackingApi.toggleActive(batch.id);
      toast.info(`ব্যাচ ${batch.is_active ? 'লক' : 'সক্রিয়'} করা হয়েছে।`);
      loadBatches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteBatch = async () => {
    if (!deleteBatchId) return;
    try {
      await submissionTrackingApi.deleteBatch(deleteBatchId);
      toast.success('ব্যাচ ডিলিট করা হয়েছে।');
      setDeleteBatchId(null);
      loadBatches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  const handleTeacherUploadSubmit = async (batchId: number) => {
    const files = selectedFiles[batchId];
    if (!files || files.length === 0) {
      toast.warning('অনুগ্রহ করে অন্তত একটি ফাইল সিলেক্ট করুন।');
      return;
    }

    const fileArray = Array.from(files);
    setUploading(true);
    try {
      await submissionTrackingApi.submitFiles(batchId, fileArray, uploadRemarks[batchId]);
      toast.success('ফাইল সফলভাবে আপলোড হয়েছে!');
      setSelectedFiles((prev) => ({ ...prev, [batchId]: null }));
      setUploadingBatchId(null);
      loadBatches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ফাইল আপলোড ব্যর্থ হয়েছে।');
    } finally {
      setUploading(false);
    }
  };

  const isTeacher = user?.role_names?.includes('teacher') && !user?.role_names?.some(r => ['super_admin', 'principal', 'academic_coordinator'].includes(r));

  const getCategoryTitle = () => {
    if (selectedCategory === 'lesson_plan') return 'Lesson Plan';
    if (selectedCategory === 'assignment') return 'Assignment';
    return 'Question';
  };

  return (
    <div className="pb-5">
      {/* 1. Top Header Bar with Live Clock */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3.5">
        <div>
          <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
            <Layers size={22} className="me-2 text-primary" />
            সাবমিশন ট্র্যাকিং পোর্টাল (Submission Tracking)
          </h4>
          <div className="text-muted small">
            পাঠ পরিকল্পনা, অ্যাসাইনমেন্ট ও প্রশ্নপত্র সংগ্রহ ও মনিটরিং
          </div>
        </div>

        <div className="bg-white border text-dark px-3 py-1.5 rounded-pill font-monospace small shadow-xs d-flex align-items-center">
          <Clock size={15} className="me-2 text-primary" />
          <span className="fw-bold">{currentTime || '00:00:00'}</span>
        </div>
      </div>

      {/* 2. Category Selection Tabs */}
      <div className="d-flex gap-2 mb-4 flex-wrap">
        <Button
          variant={selectedCategory === 'lesson_plan' ? 'primary' : 'light'}
          className={`d-flex align-items-center px-3.5 py-2 border shadow-xs rounded-3 fw-semibold ${
            selectedCategory === 'lesson_plan' ? 'text-white' : 'text-secondary'
          }`}
          style={selectedCategory === 'lesson_plan' ? { backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' } : {}}
          onClick={() => setSelectedCategory('lesson_plan')}
        >
          <BookOpen size={16} className="me-2" />
          Lesson Plan (পাঠ পরিকল্পনা)
        </Button>

        <Button
          variant={selectedCategory === 'assignment' ? 'primary' : 'light'}
          className={`d-flex align-items-center px-3.5 py-2 border shadow-xs rounded-3 fw-semibold ${
            selectedCategory === 'assignment' ? 'text-white' : 'text-secondary'
          }`}
          style={selectedCategory === 'assignment' ? { backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' } : {}}
          onClick={() => setSelectedCategory('assignment')}
        >
          <FileText size={16} className="me-2" />
          Assignment (অ্যাসাইনমেন্ট)
        </Button>

        <Button
          variant={selectedCategory === 'question' ? 'primary' : 'light'}
          className={`d-flex align-items-center px-3.5 py-2 border shadow-xs rounded-3 fw-semibold ${
            selectedCategory === 'question' ? 'text-white' : 'text-secondary'
          }`}
          style={selectedCategory === 'question' ? { backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' } : {}}
          onClick={() => setSelectedCategory('question')}
        >
          <HelpCircle size={16} className="me-2" />
          Question (প্রশ্নপত্র)
        </Button>
      </div>

      {/* 3. Create Slot Form Card (For Coordinators & Admins) */}
      {!isTeacher && (
        <Card className="border shadow-sm mb-4 bg-white rounded-3 overflow-hidden">
          <Card.Header className="bg-white p-3 border-bottom d-flex align-items-center">
            <Sparkles size={18} className="text-primary me-2" />
            <h6 className="fw-bold text-dark mb-0">
              নতুন {getCategoryTitle()} ব্যাচ তৈরি করুন
            </h6>
          </Card.Header>

          <Card.Body className="p-4">
            <Form onSubmit={handleCreateBatch}>
              <Row className="g-3">
                {/* Name */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">ব্যাচের নাম *</Form.Label>
                    <Form.Control
                      type="text"
                      className="rounded-3"
                      placeholder="যেমন: Lesson Plan 1 to 2 / June Assignment"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                {/* Class */}
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">Class (ঐচ্ছিক)</Form.Label>
                    <Form.Select
                      className="rounded-3"
                      value={classId}
                      onChange={(e) => setClassId(e.target.value)}
                    >
                      <option value="">সব ক্লাস</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name_bn || c.name_en}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Start Date */}
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">শুরুর তারিখ *</Form.Label>
                    <Form.Control
                      type="date"
                      className="rounded-3"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                {/* End Date */}
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">শেষের তারিখ *</Form.Label>
                    <Form.Control
                      type="date"
                      className="rounded-3"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>

                {/* Multiple File Upload Dropdown */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">একাধিক ফাইল আপলোড?</Form.Label>
                    <Form.Select
                      className="rounded-3"
                      value={allowMultiple ? 'yes' : 'no'}
                      onChange={(e) => setAllowMultiple(e.target.value === 'yes')}
                    >
                      <option value="yes">হ্যাঁ, একাধিক ফাইল অনুমোদিত</option>
                      <option value="no">না, শুধু ১টি ফাইল</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Instructions */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">নির্দেশনা (Instructions)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      className="rounded-3"
                      placeholder="শিক্ষকদের জন্য কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                    />
                  </Form.Group>
                </Col>

                {/* Create Button */}
                <Col md={12} className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="px-4 py-2 fw-semibold d-flex align-items-center rounded-3 shadow-xs"
                    style={{ backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' }}
                    disabled={creating}
                  >
                    <Plus size={16} className="me-1.5" />
                    {creating ? 'তৈরি হচ্ছে...' : 'নতুন ব্যাচ তৈরি করুন'}
                  </Button>

                  <div className="text-muted small d-flex align-items-center">
                    <Info size={15} className="me-1.5 text-primary" />
                    নতুন batch তৈরি করলে আগের batch বন্ধ হবে না, আলাদা আলাদা active রাখা যাবে।
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* 4. Active / Inactive Filter Tabs */}
      <div className="d-flex gap-2 mb-3.5">
        <button
          type="button"
          className={`btn btn-sm d-flex align-items-center px-3.5 py-1.5 rounded-pill fw-semibold border shadow-xs ${
            activeTabStatus === 'active'
              ? 'btn-success text-white'
              : 'btn-light text-secondary'
          }`}
          style={activeTabStatus === 'active' ? { backgroundColor: '#10b981', borderColor: '#10b981' } : {}}
          onClick={() => setActiveTabStatus('active')}
        >
          <Check size={14} className="me-1" />
          সক্রিয় ব্যাচ (Active)
          <span className="badge rounded-pill bg-white text-dark ms-2">
            {counts.active}
          </span>
        </button>

        <button
          type="button"
          className={`btn btn-sm d-flex align-items-center px-3.5 py-1.5 rounded-pill fw-semibold border shadow-xs ${
            activeTabStatus === 'inactive'
              ? 'btn-dark text-white'
              : 'btn-light text-secondary'
          }`}
          onClick={() => setActiveTabStatus('inactive')}
        >
          <X size={14} className="me-1" />
          বন্ধ / আর্কাইভ (Inactive)
          <span className="badge rounded-pill bg-secondary text-white ms-2">
            {counts.inactive}
          </span>
        </button>
      </div>

      {/* 5. Batch List Cards */}
      {loading ? (
        <div className="p-5 text-center text-muted">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          ব্যাচ লোড হচ্ছে...
        </div>
      ) : batches.length === 0 ? (
        <div className="p-5 bg-white rounded-3 text-center text-muted border">
          <Folder size={40} className="text-muted mb-2 opacity-50" />
          <div>কোনো {activeTabStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} {getCategoryTitle()} ব্যাচ পাওয়া যায়নি।</div>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {batches.map((batch) => (
            <Card key={batch.id} className="border shadow-sm rounded-3 bg-white overflow-hidden card-hover-lift">
              <Card.Body className="p-3.5 px-4">
                <Row className="align-items-center">
                  {/* Left Info Column */}
                  <Col lg={8} md={7}>
                    {/* Header Row: Icon + Title + Badges */}
                    <div className="d-flex align-items-center flex-wrap gap-2 mb-1.5">
                      <div
                        className="p-1.5 px-2 rounded-2 text-primary border me-1"
                        style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
                      >
                        <Folder size={18} />
                      </div>

                      <h5 
                        className="fw-bold mb-0 text-dark cursor-pointer"
                        onClick={() => navigate(`/submission-tracking/${batch.id}`)}
                      >
                        {batch.title}
                      </h5>

                      {/* Category Badge */}
                      <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-0.5 small fw-semibold">
                        {getCategoryTitle()}
                      </span>

                      {/* Multiple Files Badge */}
                      {batch.allow_multiple_files && (
                        <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-0.5 small fw-semibold">
                          Multiple Files
                        </span>
                      )}

                      {/* Status badge */}
                      {batch.is_active ? (
                        <span className="badge rounded-pill bg-success text-white px-2 py-0.5 small fw-semibold">
                          Active
                        </span>
                      ) : (
                        <span className="badge rounded-pill bg-secondary text-white px-2 py-0.5 small fw-semibold">
                          Locked
                        </span>
                      )}
                    </div>

                    {/* Second Row: Dates + Class */}
                    <div className="d-flex align-items-center gap-3 small text-muted mb-2.5 flex-wrap">
                      <span className="d-inline-flex align-items-center">
                        <Calendar size={13} className="me-1 text-primary" />
                        {batch.date_range_display}
                      </span>

                      {batch.class_name && batch.class_name !== 'সব ক্লাস' && (
                        <span className="badge rounded-pill bg-light text-dark border">
                          {batch.class_name}
                        </span>
                      )}
                    </div>

                    {/* Third Row: Stats + Progress */}
                    {batch.stats && (
                      <div className="d-flex align-items-center gap-4 small flex-wrap">
                        <div className="d-flex align-items-center gap-1.5">
                          <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-0.5 font-monospace fw-bold">
                            {batch.stats.submitted_count}
                          </span>
                          <span className="text-muted">জমা দিয়েছেন</span>
                        </div>

                        <div className="d-flex align-items-center gap-1.5">
                          <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-0.5 font-monospace fw-bold">
                            {batch.stats.not_submitted_count}
                          </span>
                          <span className="text-muted">বাকি রয়েছে</span>
                        </div>

                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 160 }}>
                          <ProgressBar
                            now={batch.stats.completion_percent}
                            variant={batch.stats.completion_percent > 80 ? 'success' : 'primary'}
                            style={{ height: '6px', width: '90px', borderRadius: '10px' }}
                          />
                          <span className="fw-semibold text-dark font-monospace">{batch.stats.completion_percent}%</span>
                        </div>
                      </div>
                    )}
                  </Col>

                  {/* Right Action Column */}
                  <Col lg={4} md={5} className="text-md-end mt-3 mt-md-0 d-flex justify-content-md-end gap-2 align-items-center flex-wrap">
                    {/* Detail Button */}
                    <Button
                      variant="primary"
                      size="sm"
                      className="px-3 py-1.5 fw-semibold d-flex align-items-center rounded-pill shadow-xs text-white border-0"
                      style={{ backgroundColor: '#0f2e5a' }}
                      onClick={() => navigate(`/submission-tracking/${batch.id}`)}
                    >
                      <Eye size={15} className="me-1.5 text-warning" />
                      <span>বিস্তারিত দেখুন</span>
                      <ChevronRight size={14} className="ms-1 opacity-75" />
                    </Button>

                    {/* WhatsApp Reminder Quick Button for Admin/Coordinators */}
                    {!isTeacher && (batch.stats?.not_submitted_count ?? 0) > 0 && (
                      <Button
                        size="sm"
                        className="px-2.5 py-1.5 fw-semibold d-flex align-items-center text-white btn-whatsapp border-0 rounded-pill shadow-xs"
                        onClick={() => navigate(`/submission-tracking/${batch.id}`)}
                        title="অনুপস্থিত শিক্ষকদের হোয়াটসঅ্যাপ রিমাইন্ডার পাঠান"
                      >
                        <MessageSquare size={14} className="me-1" />
                        WhatsApp ({batch.stats?.not_submitted_count})
                      </Button>
                    )}

                    {/* Teacher Upload Button (if viewing as teacher) */}
                    {isTeacher && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="px-3 py-1.5 fw-semibold d-flex align-items-center rounded-pill shadow-xs"
                        onClick={() => setUploadingBatchId(uploadingBatchId === batch.id ? null : batch.id)}
                      >
                        <UploadCloud size={15} className="me-1.5" />
                        {batch.my_submission ? 'ফাইল দেখুন / পরিবর্তন' : 'ফাইল আপলোড'}
                      </Button>
                    )}

                    {!isTeacher && (
                      <>
                        {/* Lock / Unlock Toggle Button */}
                        <Button
                          variant="light"
                          size="sm"
                          className="p-1.5 border rounded-circle shadow-xs"
                          title={batch.is_active ? 'লক করুন (Lock Batch)' : 'সক্রিয় করুন (Unlock Batch)'}
                          onClick={() => handleToggleActive(batch)}
                        >
                          {batch.is_active ? <Lock size={15} className="text-secondary" /> : <Unlock size={15} className="text-warning" />}
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="light"
                          size="sm"
                          className="p-1.5 border rounded-circle shadow-xs text-danger"
                          title="ব্যাচ ডিলিট করুন"
                          onClick={() => setDeleteBatchId(batch.id)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </>
                    )}
                  </Col>
                </Row>

                {/* Inline Teacher Upload Box (When Expanded) */}
                {uploadingBatchId === batch.id && (
                  <div className="mt-3 p-3.5 bg-light rounded-3 border border-primary">
                    <h6 className="fw-bold text-primary mb-2 d-flex align-items-center">
                      <UploadCloud size={18} className="me-2" />
                      {batch.title} - ফাইল আপলোড প্যানেল
                    </h6>

                    {batch.instructions && (
                      <p className="small text-muted mb-2 bg-white p-2.5 rounded-2 border">
                        <strong>Instructions:</strong> {batch.instructions}
                      </p>
                    )}

                    {/* If teacher already has submitted files */}
                    {batch.my_submission && batch.my_submission.files.length > 0 && (
                      <div className="mb-3">
                        <div className="small fw-semibold text-success mb-1.5">
                          ✔ আপনার আপলোড করা ফাইলসমূহ ({batch.my_submission.submitted_at ? new Date(batch.my_submission.submitted_at).toLocaleDateString() : ''}):
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {batch.my_submission.files.map((f) => (
                            <a
                              key={f.id}
                              href={f.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="badge bg-white text-primary border p-2 text-decoration-none d-flex align-items-center rounded-2"
                            >
                              <Paperclip size={14} className="me-1" />
                              {f.file_name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {batch.is_active ? (
                      <Row className="g-2 align-items-center">
                        <Col md={6}>
                          <Form.Control
                            type="file"
                            size="sm"
                            className="rounded-2"
                            multiple={batch.allow_multiple_files}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                            onChange={(e: any) => {
                              const files = e.target.files;
                              setSelectedFiles((prev) => ({ ...prev, [batch.id]: files }));
                            }}
                          />
                          <div className="small text-muted mt-1">
                            {batch.allow_multiple_files ? 'একাধিক ফাইল সিলেক্ট করতে পারেন' : 'একটি ফাইল সিলেক্ট করুন'} (PDF, Word, Excel, Scan)
                          </div>
                        </Col>
                        <Col md={4}>
                          <Form.Control
                            type="text"
                            size="sm"
                            className="rounded-2"
                            placeholder="মন্তব্য / বিবরণ (ঐচ্ছিক)"
                            value={uploadRemarks[batch.id] || ''}
                            onChange={(e) => setUploadRemarks((prev) => ({ ...prev, [batch.id]: e.target.value }))}
                          />
                        </Col>
                        <Col md={2}>
                          <Button
                            variant="success"
                            size="sm"
                            className="w-100 fw-semibold rounded-2"
                            onClick={() => handleTeacherUploadSubmit(batch.id)}
                            disabled={uploading}
                          >
                            {uploading ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
                          </Button>
                        </Col>
                      </Row>
                    ) : (
                      <Alert variant="warning" className="mb-0 p-2.5 small rounded-2">
                        এই ব্যাচটি বর্তমানে বন্ধ / লক করা আছে।
                      </Alert>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        show={!!deleteBatchId}
        title="ব্যাচ মুছে ফেলার নিশ্চিতকরণ"
        message="আপনি কি নিশ্চিত যে এই ব্যাচ এবং এর সাথে সম্পর্কিত সকল শিক্ষক সাবমিশন ডাটা ডিলিট করতে চান?"
        confirmText="ডিলিট করুন"
        cancelText="বাতিল"
        variant="danger"
        onConfirm={handleDeleteBatch}
        onCancel={() => setDeleteBatchId(null)}
      />
    </div>
  );
};