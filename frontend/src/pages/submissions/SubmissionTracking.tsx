import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Form, Button, Row, Col, Alert, ProgressBar, Badge, InputGroup, Modal } from 'react-bootstrap';
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
  ChevronRight,
  Search,
  RefreshCw,
  Users,
  CheckCircle2,
  FileCheck
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
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('all');

  // Form states (Create Batch)
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState<string>('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [allowMultiple, setAllowMultiple] = useState(true);
  const [instructions, setInstructions] = useState('');
  const [creating, setCreating] = useState(false);

  // Teacher Upload Modal State
  const [uploadModalBatch, setUploadModalBatch] = useState<SubmissionBatch | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadRemarks, setUploadRemarks] = useState('');
  const [uploading, setUploading] = useState(false);

  // Confirm delete dialog
  const [deleteBatchId, setDeleteBatchId] = useState<number | null>(null);

  // Live Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('bn-BD', { hour12: true }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load Classes once
  useEffect(() => {
    let isMounted = true;
    academicApi.getClasses()
      .then(res => {
        if (isMounted && res.data) {
          setClasses(res.data);
        }
      })
      .catch(err => console.error('Failed to load classes', err));
    return () => { isMounted = false; };
  }, []);

  // Load Batches when Category or Tab Status changes
  const loadBatches = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await submissionTrackingApi.getBatches(selectedCategory, activeTabStatus);
      if (res && res.data) {
        setBatches(res.data.batches || []);
        setCounts(res.data.counts || { active: 0, inactive: 0, total_teachers: 0 });
      }
    } catch (err: any) {
      console.error('Failed to load submission batches', err);
      if (!isSilent) {
        toast.error('ব্যাচ লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে রিফ্রেশ করুন।');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [selectedCategory, activeTabStatus]);

  useEffect(() => {
    loadBatches();
  }, [loadBatches]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !startDate || !endDate) {
      toast.warning('অনুগ্রহ করে ব্যাচের নাম এবং তারিখ প্রদান করুন।');
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
      setShowCreateCard(false);
      loadBatches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ব্যাচ তৈরি করা সম্ভব হয়নি।');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (batch: SubmissionBatch) => {
    try {
      // Optimistic update
      setBatches(prev => prev.map(b => b.id === batch.id ? { ...b, is_active: !b.is_active } : b));
      await submissionTrackingApi.toggleActive(batch.id);
      toast.info(`ব্যাচটি ${batch.is_active ? 'লক / নিষ্ক্রিয়' : 'সক্রিয়'} করা হয়েছে।`);
      loadBatches(true);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
      loadBatches(true);
    }
  };

  const handleDeleteBatch = async () => {
    if (!deleteBatchId) return;
    try {
      await submissionTrackingApi.deleteBatch(deleteBatchId);
      toast.success('ব্যাচ সফলভাবে ডিলিট করা হয়েছে।');
      setDeleteBatchId(null);
      loadBatches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে।');
    }
  };

  const handleOpenUploadModal = (batch: SubmissionBatch) => {
    setUploadModalBatch(batch);
    setUploadFiles([]);
    setUploadRemarks(batch.my_submission?.remarks || '');
  };

  const handleTeacherUploadSubmit = async () => {
    if (!uploadModalBatch) return;
    if (uploadFiles.length === 0) {
      toast.warning('অনুগ্রহ করে অন্তত একটি ফাইল সিলেক্ট করুন।');
      return;
    }

    setUploading(true);
    try {
      await submissionTrackingApi.submitFiles(uploadModalBatch.id, uploadFiles, uploadRemarks.trim() || undefined);
      toast.success('🎉 ফাইল সফলভাবে আপলোড ও সার্ভারে সংরক্ষিত হয়েছে!');
      setUploadModalBatch(null);
      setUploadFiles([]);
      setUploadRemarks('');
      loadBatches(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'ফাইল আপলোড ব্যর্থ হয়েছে।';
      toast.error(msg);
      if (err.response?.status === 404) {
        loadBatches(true);
        setUploadModalBatch(null);
      }
    } finally {
      setUploading(false);
    }
  };

  const isTeacher = user?.role_names?.includes('teacher') && !user?.role_names?.some(r => ['super_admin', 'principal', 'academic_coordinator'].includes(r));

  const getCategoryTitle = (cat: SubmissionCategory = selectedCategory) => {
    if (cat === 'lesson_plan') return 'Lesson Plan (পাঠ পরিকল্পনা)';
    if (cat === 'assignment') return 'Assignment (অ্যাসাইনমেন্ট)';
    return 'Question (প্রশ্নপত্র)';
  };

  // Filter batches in memory with lightning speed
  const filteredBatches = useMemo(() => {
    return batches.filter(batch => {
      const matchSearch = searchTerm.trim() === '' || 
        batch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (batch.class_name && batch.class_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (batch.instructions && batch.instructions.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchClass = classFilter === 'all' || 
        (classFilter === 'none' && !batch.class_id) ||
        (batch.class_id && String(batch.class_id) === classFilter);

      return matchSearch && matchClass;
    });
  }, [batches, searchTerm, classFilter]);

  return (
    <div className="pb-5">
      {/* 1. Top Header Bar with Live Clock */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h4 className="fw-bold mb-0 text-dark d-flex align-items-center">
            <Layers size={22} className="me-2 text-primary" />
            সাবমিশন ট্র্যাকিং পোর্টাল (Submission Tracking PRO)
          </h4>
          <div className="text-muted small">
            পাঠ পরিকল্পনা, অ্যাসাইনমেন্ট ও প্রশ্নপত্র সংগ্রহ, দ্রুত মনিটরিং ও রিয়েল-টাইম গুগল ড্রাইভ সিঙ্ক
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="rounded-pill px-3 py-1.5 shadow-xs d-flex align-items-center"
            onClick={() => loadBatches()}
            disabled={loading}
            title="রিফ্রেশ করুন"
          >
            <RefreshCw size={14} className={`me-1.5 ${loading ? 'spin-animation' : ''}`} />
            রিফ্রেশ
          </Button>

          <div className="bg-white border text-dark px-3 py-1.5 rounded-pill font-monospace small shadow-xs d-flex align-items-center">
            <Clock size={15} className="me-1.5 text-primary" />
            <span className="fw-bold">{currentTime || '00:00:00'}</span>
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={3} sm={6}>
          <Card className="border-0 shadow-xs rounded-3 bg-white h-100 border-start border-primary border-4">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold">সক্রিয় ব্যাচ (Active Batches)</div>
                <h4 className="fw-bold text-primary mb-0 mt-1">{counts.active}</h4>
              </div>
              <div className="p-2.5 rounded-circle bg-primary bg-opacity-10 text-primary">
                <CheckCircle2 size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="border-0 shadow-xs rounded-3 bg-white h-100 border-start border-secondary border-4">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold">আর্কাইভ / বন্ধ (Archived)</div>
                <h4 className="fw-bold text-secondary mb-0 mt-1">{counts.inactive}</h4>
              </div>
              <div className="p-2.5 rounded-circle bg-secondary bg-opacity-10 text-secondary">
                <Lock size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="border-0 shadow-xs rounded-3 bg-white h-100 border-start border-info border-4">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold">নিবন্ধিত শিক্ষক (Total Faculty)</div>
                <h4 className="fw-bold text-dark mb-0 mt-1">{counts.total_teachers || 185} জন</h4>
              </div>
              <div className="p-2.5 rounded-circle bg-info bg-opacity-10 text-info">
                <Users size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3} sm={6}>
          <Card className="border-0 shadow-xs rounded-3 bg-white h-100 border-start border-success border-4">
            <Card.Body className="p-3 d-flex align-items-center justify-content-between">
              <div>
                <div className="text-muted small fw-semibold">বর্তমান ক্যাটাগরি (Category)</div>
                <h6 className="fw-bold text-success mb-0 mt-1 text-truncate" style={{ maxWidth: 160 }}>
                  {selectedCategory === 'lesson_plan' ? 'Lesson Plan' : selectedCategory === 'assignment' ? 'Assignment' : 'Question'}
                </h6>
              </div>
              <div className="p-2.5 rounded-circle bg-success bg-opacity-10 text-success">
                <Sparkles size={24} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 3. Category Selection Tabs */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex gap-2 flex-wrap">
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

        {!isTeacher && (
          <Button
            variant={showCreateCard ? 'outline-secondary' : 'primary'}
            className="d-flex align-items-center px-3.5 py-2 rounded-3 shadow-xs fw-semibold"
            style={!showCreateCard ? { backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' } : {}}
            onClick={() => setShowCreateCard(!showCreateCard)}
          >
            {showCreateCard ? <X size={16} className="me-1.5" /> : <Plus size={16} className="me-1.5" />}
            {showCreateCard ? 'ফর্ম লুকান' : 'নতুন ব্যাচ তৈরি করুন'}
          </Button>
        )}
      </div>

      {/* 4. Create Batch Card (Collapsible) */}
      {!isTeacher && showCreateCard && (
        <Card className="border shadow-sm mb-4 bg-white rounded-3 overflow-hidden animate-fadeIn">
          <Card.Header className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Sparkles size={18} className="text-primary me-2" />
              <h6 className="fw-bold text-dark mb-0">
                নতুন {getCategoryTitle()} ব্যাচ তৈরি করুন
              </h6>
            </div>
            <Button variant="link" size="sm" className="text-muted p-0" onClick={() => setShowCreateCard(false)}>
              <X size={18} />
            </Button>
          </Card.Header>

          <Card.Body className="p-4">
            <Form onSubmit={handleCreateBatch}>
              <Row className="g-3">
                {/* Name */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">ব্যাচের নাম / টাইটেল *</Form.Label>
                    <Form.Control
                      type="text"
                      className="rounded-3"
                      placeholder="যেমন: Lesson Plan 1 to 2 / June Half Yearly"
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
                    <Form.Label className="small fw-bold text-dark mb-1">শেষের তারিখ (Deadline) *</Form.Label>
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
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">একাধিক ফাইল?</Form.Label>
                    <Form.Select
                      className="rounded-3"
                      value={allowMultiple ? 'yes' : 'no'}
                      onChange={(e) => setAllowMultiple(e.target.value === 'yes')}
                    >
                      <option value="yes">হ্যাঁ (মাল্টিপল)</option>
                      <option value="no">না (১টি ফাইল)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Instructions */}
                <Col md={12}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-dark mb-1">নির্দেশনা (Instructions / Guide)</Form.Label>
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
                <Col md={12} className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2">
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
                    নতুন ব্যাচ তৈরি করলে শিক্ষকদের প্যানেলে স্বয়ংক্রিয়ভাবে আপলোড অপশন দৃশ্যমান হবে।
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* 5. Filter & Search Controls */}
      <Card className="border shadow-xs bg-white rounded-3 mb-3 p-3">
        <Row className="g-2 align-items-center">
          <Col md={4} sm={12}>
            <div className="d-flex gap-2">
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
                <Lock size={14} className="me-1" />
                আর্কাইভ (Inactive)
                <span className="badge rounded-pill bg-secondary text-white ms-2">
                  {counts.inactive}
                </span>
              </button>
            </div>
          </Col>

          <Col md={5} sm={7}>
            <InputGroup size="sm">
              <InputGroup.Text className="bg-white border-end-0">
                <Search size={14} className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="ব্যাচের নাম বা বিবরণ দিয়ে দ্রুত খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-start-0 ps-0"
              />
              {searchTerm && (
                <Button variant="light" size="sm" onClick={() => setSearchTerm('')}>
                  <X size={14} />
                </Button>
              )}
            </InputGroup>
          </Col>

          <Col md={3} sm={5}>
            <Form.Select
              size="sm"
              className="rounded-2"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
            >
              <option value="all">সব ক্লাস ফিল্টার</option>
              <option value="none">শুধুমাত্র সাধারণ / সব ক্লাস</option>
              {classes.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name_bn || c.name_en}</option>
              ))}
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {/* 6. Batch List Cards */}
      {loading ? (
        <div className="p-5 text-center text-muted bg-white rounded-3 border">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status" />
          ব্যাচ লোড হচ্ছে...
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="p-5 bg-white rounded-3 text-center text-muted border">
          <Folder size={44} className="text-muted mb-2 opacity-50" />
          <h6 className="fw-bold text-dark">কোনো {activeTabStatus === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} ব্যাচ পাওয়া যায়নি</h6>
          <p className="small text-muted mb-3">
            {searchTerm ? 'অনুসন্ধানের সাথে কোনো ব্যাচ মিলেনি।' : 'নতুন ব্যাচ তৈরি করতে উপরের বাটনে ক্লিক করুন।'}
          </p>
          {!isTeacher && !showCreateCard && (
            <Button
              variant="primary"
              size="sm"
              className="rounded-pill px-3 py-1.5 shadow-xs"
              style={{ backgroundColor: '#0f2e5a', borderColor: '#0f2e5a' }}
              onClick={() => setShowCreateCard(true)}
            >
              <Plus size={15} className="me-1" />
              নতুন ব্যাচ তৈরি করুন
            </Button>
          )}
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredBatches.map((batch) => (
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
                        className="fw-bold mb-0 text-dark cursor-pointer hover-text-primary"
                        onClick={() => navigate(`/submission-tracking/${batch.id}`)}
                      >
                        {batch.title}
                      </h5>

                      {/* Category Badge */}
                      <Badge bg="primary" className="bg-opacity-10 text-primary border border-primary border-opacity-25 px-2.5 py-1 small fw-semibold">
                        {batch.category === 'lesson_plan' ? 'Lesson Plan' : batch.category === 'assignment' ? 'Assignment' : 'Question'}
                      </Badge>

                      {/* Multiple Files Badge */}
                      {batch.allow_multiple_files && (
                        <Badge bg="success" className="bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 small fw-semibold">
                          Multiple Files
                        </Badge>
                      )}

                      {/* Status badge */}
                      {batch.is_active ? (
                        <Badge bg="success" className="text-white px-2 py-1 small fw-semibold">
                          Active
                        </Badge>
                      ) : (
                        <Badge bg="secondary" className="text-white px-2 py-1 small fw-semibold">
                          Locked
                        </Badge>
                      )}
                    </div>

                    {/* Second Row: Dates + Class */}
                    <div className="d-flex align-items-center gap-3 small text-muted mb-2.5 flex-wrap">
                      <span className="d-inline-flex align-items-center">
                        <Calendar size={13} className="me-1 text-primary" />
                        {batch.date_range_display || `${batch.start_date} - ${batch.end_date}`}
                      </span>

                      {batch.class_name && batch.class_name !== 'সব ক্লাস' && (
                        <span className="badge rounded-pill bg-light text-dark border">
                          {batch.class_name}
                        </span>
                      )}

                      {batch.instructions && (
                        <span className="text-muted d-inline-flex align-items-center">
                          <Info size={13} className="me-1 text-info" />
                          <span className="text-truncate" style={{ maxWidth: 300 }}>{batch.instructions}</span>
                        </span>
                      )}
                    </div>

                    {/* Third Row: Stats + Progress Bar */}
                    {batch.stats && (
                      <div className="d-flex align-items-center gap-4 small flex-wrap">
                        <div className="d-flex align-items-center gap-1.5">
                          <span className="badge rounded-pill bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2.5 py-1 font-monospace fw-bold">
                            {batch.stats.submitted_count}
                          </span>
                          <span className="text-muted">জমা দিয়েছেন</span>
                        </div>

                        <div className="d-flex align-items-center gap-1.5">
                          <span className="badge rounded-pill bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2.5 py-1 font-monospace fw-bold">
                            {batch.stats.not_submitted_count}
                          </span>
                          <span className="text-muted">বাকি রয়েছে</span>
                        </div>

                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 160 }}>
                          <ProgressBar
                            now={batch.stats.completion_percent || 0}
                            variant={(batch.stats.completion_percent || 0) >= 80 ? 'success' : (batch.stats.completion_percent || 0) >= 40 ? 'primary' : 'warning'}
                            style={{ height: '7px', width: '90px', borderRadius: '10px' }}
                          />
                          <span className="fw-semibold text-dark font-monospace">{batch.stats.completion_percent || 0}%</span>
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
                      className="px-3.5 py-1.5 fw-semibold d-flex align-items-center rounded-pill shadow-xs text-white border-0"
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
                        className="px-3 py-1.5 fw-semibold d-flex align-items-center text-white btn-whatsapp border-0 rounded-pill shadow-xs"
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
                        variant={batch.my_submission ? 'outline-success' : 'success'}
                        size="sm"
                        className="px-3 py-1.5 fw-semibold d-flex align-items-center rounded-pill shadow-xs"
                        onClick={() => handleOpenUploadModal(batch)}
                      >
                        <UploadCloud size={15} className="me-1.5" />
                        {batch.my_submission ? 'ফাইল দেখুন / পরিবর্তন' : 'ফাইল আপলোড করুন'}
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
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Teacher Fast Upload Modal */}
      <Modal 
        show={!!uploadModalBatch} 
        onHide={() => setUploadModalBatch(null)} 
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h6 fw-bold text-primary mb-0 d-flex align-items-center">
            <UploadCloud size={18} className="me-2" />
            {uploadModalBatch?.title} - ফাইল আপলোড
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {uploadModalBatch?.instructions && (
            <Alert variant="info" className="p-2.5 small rounded-2 mb-3">
              <strong>Instructions:</strong> {uploadModalBatch.instructions}
            </Alert>
          )}

          {/* Already Uploaded Files */}
          {uploadModalBatch?.my_submission && uploadModalBatch.my_submission.files.length > 0 && (
            <div className="mb-3 p-3 bg-light rounded-3 border">
              <div className="small fw-semibold text-success mb-2 d-flex align-items-center">
                <FileCheck size={16} className="me-1.5" />
                আপনার পূর্ববর্তী আপলোড করা ফাইলসমূহ ({uploadModalBatch.my_submission.submitted_at ? new Date(uploadModalBatch.my_submission.submitted_at).toLocaleDateString() : ''}):
              </div>
              <div className="d-flex flex-wrap gap-2">
                {uploadModalBatch.my_submission.files.map((f) => (
                  <a
                    key={f.id}
                    href={f.download_url || f.file_url}
                    download={f.file_name}
                    target="_blank"
                    rel="noreferrer"
                    className="badge bg-white text-primary border p-2 text-decoration-none d-flex align-items-center rounded-2 shadow-xs"
                    title={`ডাউনলোড করুন: ${f.file_name}`}
                  >
                    <Paperclip size={13} className="me-1 text-primary" />
                    {f.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {uploadModalBatch?.is_active ? (
            <Form onSubmit={(e) => { e.preventDefault(); handleTeacherUploadSubmit(); }}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-dark">
                  ফাইল সিলেক্ট করুন {uploadModalBatch.allow_multiple_files ? '(একাধিক ফাইল অনুমোদিত)' : '(১টি ফাইল)'} *
                </Form.Label>
                <Form.Control
                  type="file"
                  multiple={uploadModalBatch.allow_multiple_files}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={(e: any) => {
                    const files = e.target.files;
                    if (files) {
                      setUploadFiles(Array.from(files));
                    }
                  }}
                  required={!uploadModalBatch.my_submission}
                />
                <div className="text-muted small mt-1">
                  অনুমোদিত ফরম্যাট: PDF, Word (docx), Excel (xlsx), PowerPoint, JPG, PNG (সর্বোচ্চ 25MB)
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-dark">মন্তব্য / বিবরণ (ঐচ্ছিক)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="যেমন: Chapter 1-3 Completed"
                  value={uploadRemarks}
                  onChange={(e) => setUploadRemarks(e.target.value)}
                />
              </Form.Group>
            </Form>
          ) : (
            <Alert variant="warning" className="mb-0">
              এই ব্যাচটি বর্তমানে বন্ধ বা লক করা আছে। নতুন ফাইল আপলোড করা সম্ভব নয়।
            </Alert>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => setUploadModalBatch(null)} disabled={uploading}>
            বাতিল
          </Button>
          {uploadModalBatch?.is_active && (
            <Button
              variant="success"
              size="sm"
              className="fw-semibold px-3"
              onClick={handleTeacherUploadSubmit}
              disabled={uploading || uploadFiles.length === 0}
            >
              {uploading ? 'আপলোড হচ্ছে...' : 'আপলোড নিশ্চিত করুন'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

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