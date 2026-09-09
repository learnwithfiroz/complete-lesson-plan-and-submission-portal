import React, { useState, useMemo, useRef } from 'react';
import { Card, Button, Row, Col, Badge, Modal, Form, Nav } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  Copy,
  RotateCcw,
  Sparkles,
  Send,
  HelpCircle,
  Eye,
  Star,
  Search,
  Hash
} from 'lucide-react';
import {
  messageTemplatesApi,
  type MessageTemplate,
  type CreateMessageTemplateDto,
} from '../../api/messageTemplates';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  renderReminderMessage,
  openWhatsAppChat,
  type ReminderTeacher,
  type ReminderBatchInfo,
} from '../../utils/whatsappReminder';
import { toast } from 'react-toastify';

// Available Template Variables
const TEMPLATE_VARIABLES = [
  { tag: '{name}', label: 'শিক্ষকের নাম', desc: 'যেমন: জনাব মো: আব্দুল্লাহ আল মামুন' },
  { tag: '{salutation}', label: 'সম্বোধন (Sir/Madam)', desc: 'স্বয়ংক্রিয়ভাবে Sir / Madam / জনাব / মহোদয়া' },
  { tag: '{portalUrl}', label: 'পোর্টাল লিংক', desc: 'সরাসরি শিক্ষক সাবমিশন পোর্টাল লিংক' },
  { tag: '{phone}', label: 'মোবাইল নম্বর', desc: 'শিক্ষকের রেজিস্টার্ড মোবাইল নম্বর (যেমন: 01780017602)' },
  { tag: '{employeeId}', label: 'এমপ্লয়ী আইডি', desc: 'শিক্ষকের ইউনিক EMP ID (যেমন: BSISC-104)' },
  { tag: '{password}', label: 'ডিফল্ট পাসওয়ার্ড', desc: 'ডিফল্ট পাসওয়ার্ড 123456' },
  { tag: '{loginInfo}', label: 'লগইন ইনফো ব্লক', desc: 'লিংক, ইউজারনেম ও পাসওয়ার্ডের সম্পূর্ণ বক্স' },
  { tag: '{batchTitle}', label: 'লেসন প্ল্যান ব্যাচ', desc: 'যেমন: Week 12: Lesson Plan 2026' },
  { tag: '{deadline}', label: 'জমার শেষ সময়', desc: 'যেমন: শনিবার রাত ১১:৫৯' },
  { tag: '{designation}', label: 'পদবি', desc: 'যেমন: সহকারী শিক্ষক / Senior Teacher' },
  { tag: '{department}', label: 'বিভাগ', desc: 'যেমন: বিজ্ঞান বিভাগ / Mathematics' },
];

// Helper to calculate SMS parts (Unicode vs GSM)
const calculateSmsParts = (text: string) => {
  const isUnicode = /[^\u0000-\u007F]/.test(text);
  const len = text.length;

  if (len === 0) return { parts: 0, charCount: 0, isUnicode, perPart: isUnicode ? 70 : 160 };

  if (isUnicode) {
    // Unicode SMS: 70 chars for 1 part, 67 chars per part if multipart
    const parts = len <= 70 ? 1 : Math.ceil(len / 67);
    return { parts, charCount: len, isUnicode: true, perPart: len <= 70 ? 70 : 67 };
  } else {
    // GSM SMS: 160 chars for 1 part, 153 chars per part if multipart
    const parts = len <= 160 ? 1 : Math.ceil(len / 153);
    return { parts, charCount: len, isUnicode: false, perPart: len <= 160 ? 160 : 153 };
  }
};

export const MessageTemplateSettings: React.FC = () => {
  const queryClient = useQueryClient();

  // Search & Filter States
  const [search, setSearch] = useState<string>('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [showVariablesGuide, setShowVariablesGuide] = useState<boolean>(false);

  // Modals & Dialogs
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [testTemplate, setTestTemplate] = useState<MessageTemplate | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; template: MessageTemplate | null }>({
    show: false,
    template: null,
  });

  const [resetConfirm, setResetConfirm] = useState<boolean>(false);

  // Form State
  const [form, setForm] = useState<CreateMessageTemplateDto>({
    name: '',
    text: '',
    language: 'bn',
    category: 'whatsapp_sms',
    is_default: false,
  });

  // Reference for textarea to insert tags at cursor
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Sample Test Data for Live Preview
  const [sampleTeacher, setSampleTeacher] = useState<ReminderTeacher>({
    name: 'জনাব মোহাম্মদ আব্দুল্লাহ আল মামুন',
    salutation: 'Sir',
    designation: 'সহকারী শিক্ষক (বিজ্ঞান)',
    department_name: 'বিজ্ঞান বিভাগ',
    phone: '01700000000',
  });

  const sampleBatch: ReminderBatchInfo = {
    title: 'Week 12: Lesson Plan (15-20 Sep 2026)',
    deadline: 'শনিবার রাত ১১:৫৯',
  };

  // Queries
  const { data: templates = [], isLoading } = useQuery<MessageTemplate[]>({
    queryKey: ['message-templates'],
    queryFn: () => messageTemplatesApi.getAll(),
  });

  // Mutations
  const saveMutation = useMutation<unknown, Error, CreateMessageTemplateDto>({
    mutationFn: async (data: CreateMessageTemplateDto) => {
      if (editingTemplate) {
        return await messageTemplatesApi.update(editingTemplate.id, data);
      }
      return await messageTemplatesApi.create(data);
    },
    onSuccess: () => {
      toast.success(editingTemplate ? 'টেমপ্লেট সফলভাবে আপডেট করা হয়েছে।' : 'নতুন টেমপ্লেট সফলভাবে তৈরি হয়েছে।');
      setModalOpen(false);
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'টেমপ্লেট সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => messageTemplatesApi.delete(id),
    onSuccess: () => {
      toast.success('টেমপ্লেটটি সফলভাবে মুছে ফেলা হয়েছে।');
      setDeleteConfirm({ show: false, template: null });
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'টেমপ্লেট মুছতে ব্যর্থ হয়েছে।');
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => messageTemplatesApi.reset(),
    onSuccess: () => {
      toast.success('সকল টেমপ্লেট সফলভাবে সিস্টেম ডিফল্টে রিস্টোর করা হয়েছে।');
      setResetConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
    onError: () => {
      toast.error('টেমপ্লেট রিস্টোর করতে সমস্যা হয়েছে।');
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: (template: MessageTemplate) =>
      messageTemplatesApi.update(template.id, {
        name: template.name,
        text: template.text,
        language: template.language,
        category: template.category,
        is_default: true,
      }),
    onSuccess: () => {
      toast.success('ডিফল্ট টেমপ্লেট সফলভাবে পরিবর্তন করা হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['message-templates'] });
    },
  });

  // Filtered Templates List
  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      // Search filter
      const matchesSearch =
        tpl.name.toLowerCase().includes(search.toLowerCase()) ||
        tpl.text.toLowerCase().includes(search.toLowerCase());

      // Category tab filter
      let matchesCategory = true;
      if (activeCategoryTab === 'whatsapp_only') matchesCategory = tpl.category === 'whatsapp';
      else if (activeCategoryTab === 'sms_only') matchesCategory = tpl.category === 'sms';
      else if (activeCategoryTab === 'whatsapp_sms') matchesCategory = tpl.category === 'whatsapp_sms';

      // Language filter
      const matchesLanguage = languageFilter === 'all' || tpl.language === languageFilter;

      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [templates, search, activeCategoryTab, languageFilter]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setForm({
      name: '',
      text: "আসসালামু আলাইকুম {salutation} {name},\n\nবিএসআইএসসি লেসন প্ল্যান সাবমিশন পোর্টাল অনুযায়ী '{batchTitle}'-এর লেসন প্ল্যান এখনও জমা পড়েনি। অনুগ্রহ করে নির্ধারিত সময়ের মধ্যে আপনার লেসন প্ল্যান আপলোড করুন:\n🌐 {portalUrl}\n\nধন্যবাদ,\nএকাডেমিক শাখা, বিএসআইএসসি",
      language: 'bn',
      category: 'whatsapp_sms',
      is_default: false,
    });
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      text: template.text,
      language: template.language,
      category: template.category || 'whatsapp_sms',
      is_default: Boolean(template.is_default),
    });
    setModalOpen(true);
  };

  // Clone / Duplicate Template
  const handleDuplicate = (template: MessageTemplate) => {
    setEditingTemplate(null);
    setForm({
      name: `${template.name} (কপি)`,
      text: template.text,
      language: template.language,
      category: template.category || 'whatsapp_sms',
      is_default: false,
    });
    setModalOpen(true);
  };

  // Open Test Preview Modal
  const handleOpenTest = (template: MessageTemplate) => {
    setTestTemplate(template);
    setTestModalOpen(true);
  };

  // Insert Variable Tag into Textarea at cursor position
  const handleInsertTag = (tag: string) => {
    if (!textareaRef.current) {
      setForm((prev) => ({ ...prev, text: prev.text + ' ' + tag }));
      return;
    }

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = form.text;

    const newText = currentText.substring(0, start) + tag + currentText.substring(end);
    setForm((prev) => ({ ...prev, text: newText }));

    // Restore cursor position after tag insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tag.length, start + tag.length);
    }, 0);
  };

  // Copy Template Text
  const handleCopyText = (text: string, title = 'মেসেজ') => {
    navigator.clipboard.writeText(text);
    toast.success(`${title} ক্লিপবোর্ডে কপি করা হয়েছে!`);
  };

  // Live calculation for Form SMS Parts
  const formSmsStats = useMemo(() => calculateSmsParts(form.text), [form.text]);

  // Form Live Rendered Preview
  const formLivePreview = useMemo(() => {
    return renderReminderMessage(form.text, sampleTeacher, sampleBatch);
  }, [form.text, sampleTeacher, sampleBatch]);

  return (
    <div className="message-templates-page pb-5">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 bg-white p-4 rounded-4 shadow-sm border">
        <div className="d-flex align-items-center gap-3">
          <div
            className="p-3 rounded-4 d-flex align-items-center justify-content-center text-white shadow-sm"
            style={{ backgroundColor: '#075E54' }}
          >
            <MessageSquare size={28} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="fs-4 fw-bold text-dark mb-0">
                মেসেজ ও SMS টেমপ্লেট সেটিংস
              </h1>
              <Badge bg="success" className="fw-semibold px-2 py-1 small">
                WhatsApp & SMS
              </Badge>
            </div>
            <p className="text-muted fs-7 mb-0 mt-1">
              শিক্ষকদের কাছে লেসন প্ল্যান জমার তাগিদ পাঠানোর মেসেজ ও এসএমএস টেমপ্লেট কাস্টমাইজ করুন।
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center gap-1.5 py-2 px-3 fw-semibold rounded-3"
            onClick={() => setResetConfirm(true)}
            disabled={resetMutation.isPending}
          >
            <RotateCcw size={15} />
            <span>ডিফল্ট রিস্টোর</span>
          </Button>

          <Button
            variant="success"
            size="sm"
            className="d-flex align-items-center gap-1.5 py-2 px-3 fw-bold rounded-3 shadow-sm text-white"
            style={{ backgroundColor: '#075E54', borderColor: '#075E54' }}
            onClick={handleOpenCreate}
          >
            <Plus size={17} />
            <span>নতুন টেমপ্লেট তৈরি করুন</span>
          </Button>
        </div>
      </div>

      {/* Quick Guide & Variables Accordion Card */}
      <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden bg-primary-subtle bg-opacity-25 border border-primary border-opacity-25">
        <Card.Body className="p-3 p-md-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="fw-bold text-dark fs-7">
                ডায়নামিক ভ্যারিয়েবল ট্যাগসমূহ (Dynamic Tags)
              </span>
              <span className="text-muted small fs-8">
                - মেসেজ পাঠানোর সময় শিক্ষকের আসল নাম ও তথ্য স্বয়ংক্রিয়ভাবে যুক্ত হবে
              </span>
            </div>
            <Button
              variant="link"
              size="sm"
              className="text-primary p-0 fw-semibold text-decoration-none fs-7"
              onClick={() => setShowVariablesGuide(!showVariablesGuide)}
            >
              <HelpCircle size={15} className="me-1" />
              {showVariablesGuide ? 'ট্যাগ তালিকা লুকান' : 'ট্যাগ তালিকা দেখুন'}
            </Button>
          </div>

          {showVariablesGuide && (
            <div className="mt-3 pt-3 border-top">
              <Row className="g-2">
                {TEMPLATE_VARIABLES.map((v) => (
                  <Col key={v.tag} sm={6} md={4} lg={3}>
                    <div className="p-2.5 bg-white rounded-3 border shadow-xs h-100">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <code className="text-primary fw-bold fs-7">{v.tag}</code>
                        <span className="badge bg-light text-secondary border font-monospace fs-8">Variable</span>
                      </div>
                      <div className="fw-semibold text-dark fs-8">{v.label}</div>
                      <div className="text-muted fs-8 small mt-0.5">{v.desc}</div>
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Filter Tabs & Search Bar */}
      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3">
          <Row className="g-3 align-items-center justify-content-between">
            {/* Category Tabs */}
            <Col lg={6}>
              <Nav variant="pills" className="gap-1 p-1 bg-light rounded-3 d-inline-flex flex-wrap">
                <Nav.Item>
                  <Nav.Link
                    active={activeCategoryTab === 'all'}
                    onClick={() => setActiveCategoryTab('all')}
                    className="py-1 px-3 fs-7 fw-semibold"
                  >
                    সকল টেমপ্লেট ({templates.length})
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeCategoryTab === 'whatsapp_sms'}
                    onClick={() => setActiveCategoryTab('whatsapp_sms')}
                    className="py-1 px-3 fs-7 fw-semibold"
                  >
                    WhatsApp ও SMS
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeCategoryTab === 'whatsapp_only'}
                    onClick={() => setActiveCategoryTab('whatsapp_only')}
                    className="py-1 px-3 fs-7 fw-semibold"
                  >
                    শুধু WhatsApp
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    active={activeCategoryTab === 'sms_only'}
                    onClick={() => setActiveCategoryTab('sms_only')}
                    className="py-1 px-3 fs-7 fw-semibold"
                  >
                    শুধু SMS
                  </Nav.Link>
                </Nav.Item>
              </Nav>
            </Col>

            {/* Language Filter & Search Bar */}
            <Col lg={6}>
              <div className="d-flex align-items-center gap-2 justify-content-lg-end">
                <Form.Select
                  size="sm"
                  style={{ width: '130px' }}
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="fs-7"
                >
                  <option value="all">সব ভাষা</option>
                  <option value="bn">বাংলা (Bengali)</option>
                  <option value="en">English</option>
                </Form.Select>

                <div className="input-group input-group-sm" style={{ maxWidth: '260px' }}>
                  <span className="input-group-text bg-light">
                    <Search size={14} />
                  </span>
                  <Form.Control
                    placeholder="টেমপ্লেট খুঁজুন..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="fs-7"
                  />
                </div>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Templates List / Grid */}
      {isLoading ? (
        <LoadingSpinner message="মেসেজ টেমপ্লেটসমূহ লোড হচ্ছে..." />
      ) : filteredTemplates.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center p-5">
          <Card.Body>
            <div className="text-muted mb-3">
              <MessageSquare size={48} className="text-muted opacity-50" />
            </div>
            <h5 className="fw-bold text-dark">কোনো মেসেজ টেমপ্লেট পাওয়া যায়নি</h5>
            <p className="text-muted fs-7 mb-4">
              আপনার ফিল্টারের সাথে মিলে এমন কোনো টেমপ্লেট পাওয়া যায়নি। নতুন টেমপ্লেট তৈরি করুন অথবা ডিফল্ট রিস্টোর করুন।
            </p>
            <Button
              variant="primary"
              size="sm"
              className="fw-bold px-4 py-2 rounded-3"
              onClick={handleOpenCreate}
            >
              <Plus size={16} className="me-1" /> নতুন টেমপ্লেট যোগ করুন
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredTemplates.map((template) => {
            const smsStats = calculateSmsParts(template.text);
            const isDefault = Boolean(template.is_default);

            return (
              <Col key={template.id} lg={6}>
                <Card className={`border shadow-sm rounded-4 h-100 overflow-hidden ${isDefault ? 'border-success border-2' : ''}`}>
                  {/* Card Header */}
                  <Card.Header className="bg-white border-bottom p-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="p-1.5 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          backgroundColor: template.category === 'sms' ? '#fffae6' : '#E7FFDB',
                          color: template.category === 'sms' ? '#d97706' : '#075E54',
                        }}
                      >
                        <MessageSquare size={16} />
                      </div>
                      <div>
                        <div className="fw-bold text-dark fs-7 d-flex align-items-center gap-1.5">
                          <span>{template.name}</span>
                          {isDefault && (
                            <Badge bg="success" className="px-2 py-0.5 fs-9 fw-bold d-flex align-items-center gap-1">
                              <Star size={10} fill="currentColor" /> ডিফল্ট
                            </Badge>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-2 mt-0.5">
                          <Badge bg="light" text="secondary" className="border fs-9">
                            {template.language === 'bn' ? 'বাংলা (BN)' : 'English (EN)'}
                          </Badge>
                          <Badge
                            bg={
                              template.category === 'sms'
                                ? 'warning-subtle'
                                : template.category === 'whatsapp'
                                ? 'success-subtle'
                                : 'info-subtle'
                            }
                            className={`border fs-9 ${
                              template.category === 'sms'
                                ? 'text-warning-emphasis border-warning-subtle'
                                : template.category === 'whatsapp'
                                ? 'text-success-emphasis border-success-subtle'
                                : 'text-info-emphasis border-info-subtle'
                            }`}
                          >
                            {template.category === 'sms'
                              ? 'SMS Only'
                              : template.category === 'whatsapp'
                              ? 'WhatsApp Only'
                              : 'WhatsApp & SMS'}
                          </Badge>
                          {template.is_system && (
                            <Badge bg="light" text="muted" className="border fs-9">
                              সিস্টেম
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick Default Button */}
                    {!isDefault && (
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="py-1 px-2 fs-8 fw-semibold rounded-2"
                        onClick={() => setDefaultMutation.mutate(template)}
                        disabled={setDefaultMutation.isPending}
                        title="এই টেমপ্লেটটিকে প্রাথমিক ডিফল্ট করুন"
                      >
                        ডিফল্ট করুন
                      </Button>
                    )}
                  </Card.Header>

                  {/* Card Body - Message Preview */}
                  <Card.Body className="p-3 d-flex flex-column justify-content-between">
                    <div
                      className="p-3 rounded-3 mb-3 font-monospace small"
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.82rem',
                        lineHeight: '1.5',
                        minHeight: '130px',
                        maxHeight: '220px',
                        overflowY: 'auto',
                        color: '#1e293b',
                      }}
                    >
                      {template.text}
                    </div>

                    {/* Stats & Actions Footer */}
                    <div>
                      {/* Character & SMS Estimator Footer Bar */}
                      <div className="d-flex align-items-center justify-content-between text-muted fs-8 p-2 bg-light rounded-3 mb-3 border">
                        <span className="d-flex align-items-center gap-1">
                          <Hash size={13} className="text-secondary" />
                          <span>মোট বর্ণ: <strong>{smsStats.charCount}</strong></span>
                        </span>
                        <span className="badge bg-secondary-subtle text-secondary font-monospace">
                          {smsStats.isUnicode ? 'Unicode (বাংলা)' : 'GSM (English)'}
                        </span>
                        <span>
                          এসএমএস পরিমাপ:{' '}
                          <strong className={smsStats.parts > 1 ? 'text-warning' : 'text-success'}>
                            {smsStats.parts} টি Part
                          </strong>
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="d-flex align-items-center justify-content-between pt-2 border-top gap-2 flex-wrap">
                        <div className="d-flex gap-1.5">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="d-flex align-items-center gap-1 py-1 px-2.5 fs-8 fw-semibold rounded-2"
                            onClick={() => handleOpenTest(template)}
                          >
                            <Eye size={13} />
                            <span>লাইভ টেস্ট</span>
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="d-flex align-items-center gap-1 py-1 px-2 fs-8 rounded-2"
                            onClick={() => handleCopyText(template.text, template.name)}
                            title="মেসেজ টেক্সট কপি করুন"
                          >
                            <Copy size={13} />
                          </Button>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="d-flex align-items-center gap-1 py-1 px-2 fs-8 rounded-2"
                            onClick={() => handleDuplicate(template)}
                            title="টেমপ্লেট ডুপ্লিকেট / কপি তৈরি করুন"
                          >
                            <Plus size={13} />
                          </Button>
                        </div>

                        <div className="d-flex gap-1.5">
                          <Button
                            variant="outline-dark"
                            size="sm"
                            className="d-flex align-items-center gap-1 py-1 px-2.5 fs-8 fw-semibold rounded-2"
                            onClick={() => handleOpenEdit(template)}
                          >
                            <Edit3 size={13} />
                            <span>এডিট</span>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="d-flex align-items-center py-1 px-2 fs-8 rounded-2"
                            onClick={() => setDeleteConfirm({ show: true, template })}
                            title="টেমপ্লেট মুছে ফেলুন"
                            disabled={Boolean(template.is_default)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* CREATE / EDIT TEMPLATE MODAL */}
      <Modal
        show={modalOpen}
        onHide={() => {
          setModalOpen(false);
          setEditingTemplate(null);
        }}
        size="xl"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            <span>{editingTemplate ? 'টেমপ্লেট সম্পাদনা করুন (Edit Template)' : 'নতুন মেসেজ টেমপ্লেট তৈরি করুন'}</span>
          </Modal.Title>
        </Modal.Header>

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name.trim() || !form.text.trim()) {
              toast.error('অনুগ্রহ করে টেমপ্লেটের নাম ও মেসেজের বিবরণ লিখুন।');
              return;
            }
            saveMutation.mutate(form);
          }}
        >
          <Modal.Body className="p-3 p-md-4">
            <Row className="g-4">
              {/* Left Column: Form Fields & Variable Clickers */}
              <Col lg={7}>
                <Form.Group className="mb-3">
                  <Form.Label className="fs-7 fw-semibold">
                    টেমপ্লেটের নাম ও বিবরণ <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="যেমন: ১. স্ট্যান্ডার্ড বাংলা তাগিদ (রবিবার সকালের ফলো-আপ)"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="fs-7 fw-semibold"
                  />
                </Form.Group>

                <Row className="g-3 mb-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fs-7 fw-semibold">মাধ্যম / ক্যাটাগরি</Form.Label>
                      <Form.Select
                        size="sm"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                        className="fs-7"
                      >
                        <option value="whatsapp_sms">WhatsApp ও SMS উভয় মাধ্যম</option>
                        <option value="whatsapp">শুধু WhatsApp</option>
                        <option value="sms">শুধু SMS</option>
                        <option value="general">সাধারণ নোটিশ / General</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fs-7 fw-semibold">ভাষা (Language)</Form.Label>
                      <Form.Select
                        size="sm"
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value as any })}
                        className="fs-7"
                      >
                        <option value="bn">বাংলা (Bengali)</option>
                        <option value="en">English</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Variable Inserter Pill Bar */}
                <div className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1.5">
                    <span className="fs-8 fw-semibold text-dark d-flex align-items-center gap-1">
                      <Sparkles size={13} className="text-primary" /> ক্লিক করে ট্যাগ যুক্ত করুন:
                    </span>
                    <span className="text-muted fs-9">কার্সার রেখে ট্যাগে ক্লিক করুন</span>
                  </div>
                  <div className="d-flex flex-wrap gap-1.5 p-2 bg-light rounded-3 border">
                    {TEMPLATE_VARIABLES.map((v) => (
                      <Button
                        key={v.tag}
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className="py-0.5 px-2 fs-8 font-monospace rounded-pill bg-white text-primary border-primary-subtle shadow-xs"
                        onClick={() => handleInsertTag(v.tag)}
                        title={v.desc}
                      >
                        + {v.tag}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Message Textarea */}
                <Form.Group className="mb-3">
                  <Form.Label className="fs-7 fw-semibold d-flex justify-content-between">
                    <span>মেসেজের মূল টেক্সট (Message Body) <span className="text-danger">*</span></span>
                    <span className="text-muted fs-8 font-monospace">
                      {formSmsStats.charCount} বর্ণ | {formSmsStats.parts} টি SMS
                    </span>
                  </Form.Label>
                  <Form.Control
                    ref={textareaRef}
                    as="textarea"
                    rows={8}
                    className="font-monospace fs-7"
                    style={{ lineHeight: '1.5' }}
                    placeholder="মেসেজের বিবরণ লিখুন..."
                    value={form.text}
                    onChange={(e) => setForm({ ...form, text: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Check
                  type="checkbox"
                  id="is_default_checkbox"
                  label="এই টেমপ্লেটটিকে ডিফল্ট সিলেক্টেড হিসেবে সেট করুন"
                  className="fs-7 text-dark fw-semibold"
                  checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                />
              </Col>

              {/* Right Column: Live Rendered Preview */}
              <Col lg={5}>
                <Card className="border shadow-xs h-100 bg-light">
                  <Card.Header className="bg-white py-2.5 border-bottom d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark fs-7 d-flex align-items-center gap-1.5">
                      <Eye size={15} className="text-success" />
                      লাইভ রেন্ডার প্রিভিউ (Live Preview)
                    </span>
                    <Badge bg="success-subtle" className="text-success border border-success-subtle fs-9">
                      Realtime Simulated
                    </Badge>
                  </Card.Header>

                  <Card.Body className="p-3 d-flex flex-column justify-content-between">
                    <div>
                      {/* WhatsApp Simulation Bubble */}
                      <div
                        className="p-3 rounded-3 shadow-xs mb-3 font-monospace"
                        style={{
                          backgroundColor: '#E7FFDB',
                          border: '1px solid #C2ECC1',
                          whiteSpace: 'pre-wrap',
                          fontSize: '0.84rem',
                          lineHeight: '1.5',
                          color: '#111b21',
                          maxHeight: '280px',
                          overflowY: 'auto',
                        }}
                      >
                        {formLivePreview}
                      </div>

                      {/* Sample Teacher Indicator */}
                      <div className="p-2.5 bg-white rounded-3 border small fs-8 text-secondary">
                        <div className="fw-bold text-dark">{sampleTeacher.name}</div>
                        <div>{sampleTeacher.designation} | {sampleTeacher.department_name}</div>
                        <div className="text-muted font-monospace mt-1">ব্যাচ: {sampleBatch.title}</div>
                      </div>
                    </div>

                    {/* SMS estimation breakdown */}
                    <div className="mt-3 p-2.5 bg-white rounded-3 border fs-8 text-muted">
                      <div className="d-flex justify-content-between mb-1">
                        <span>এনকোডিং:</span>
                        <strong className="text-dark">{formSmsStats.isUnicode ? 'Unicode (বাংলা)' : 'GSM-7 (English)'}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-1">
                        <span>মোট অক্ষর:</span>
                        <strong className="text-dark">{formSmsStats.charCount} টি</strong>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>আনুমানিক SMS খরচ:</span>
                        <strong className={formSmsStats.parts > 1 ? 'text-warning' : 'text-success'}>
                          {formSmsStats.parts} টি SMS Part
                        </strong>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer className="bg-light">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setModalOpen(false);
                setEditingTemplate(null);
              }}
            >
              বাতিল
            </Button>
            <Button
              variant="success"
              type="submit"
              size="sm"
              className="fw-bold px-4 text-white"
              style={{ backgroundColor: '#075E54', borderColor: '#075E54' }}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : editingTemplate ? 'আপডেট সম্পন্ন করুন' : 'টেমপ্লেট সংরক্ষণ করুন'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* LIVE TEST & PREVIEW MODAL */}
      <Modal
        show={testModalOpen}
        onHide={() => {
          setTestModalOpen(false);
          setTestTemplate(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: '#fff' }}>
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <Eye size={18} />
            <span>লাইভ টেস্ট প্রিভিউ ও টেস্ট সেন্ড ({testTemplate?.name})</span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-3 p-md-4 bg-light">
          {testTemplate && (
            <>
              {/* Teacher Customizer Form */}
              <Card className="border shadow-xs bg-white mb-3">
                <Card.Body className="p-3">
                  <span className="fw-bold text-dark fs-7 d-block mb-2">
                    টেস্ট করার জন্য কাল্পনিক শিক্ষকের তথ্য পরিবর্তন করুন:
                  </span>
                  <Row className="g-2">
                    <Col md={5}>
                      <Form.Control
                        size="sm"
                        placeholder="শিক্ষকের নাম"
                        value={sampleTeacher.name}
                        onChange={(e) => setSampleTeacher({ ...sampleTeacher, name: e.target.value })}
                        className="fs-8"
                      />
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        size="sm"
                        value={sampleTeacher.salutation}
                        onChange={(e) => setSampleTeacher({ ...sampleTeacher, salutation: e.target.value })}
                        className="fs-8"
                      >
                        <option value="Sir">Sir</option>
                        <option value="Madam">Madam</option>
                        <option value="জনাব">জনাব</option>
                        <option value="মহোদয়া">মহোদয়া</option>
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Form.Control
                        size="sm"
                        placeholder="মোবাইল নম্বর (e.g. 01780017602)"
                        value={sampleTeacher.phone || ''}
                        onChange={(e) => setSampleTeacher({ ...sampleTeacher, phone: e.target.value })}
                        className="fs-8 font-monospace"
                      />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Rendered WhatsApp Preview Bubble */}
              <div
                className="p-3 rounded-3 shadow-xs mb-3"
                style={{
                  backgroundColor: '#E7FFDB',
                  border: '1px solid #C2ECC1',
                  whiteSpace: 'pre-wrap',
                  fontSize: '0.88rem',
                  lineHeight: '1.5',
                  color: '#111b21',
                  maxHeight: '320px',
                  overflowY: 'auto',
                }}
              >
                {renderReminderMessage(testTemplate.text, sampleTeacher, sampleBatch)}
              </div>

              <div className="d-flex align-items-center justify-content-between p-2.5 bg-white rounded-3 border">
                <div className="small text-muted fs-8">
                  📱 টেস্ট প্রাপক: <strong>{sampleTeacher.name}</strong> ({sampleTeacher.phone})
                </div>

                <div className="d-flex gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="d-flex align-items-center gap-1 py-1 px-3 fs-8 fw-semibold"
                    onClick={() => {
                      const msg = renderReminderMessage(testTemplate.text, sampleTeacher, sampleBatch);
                      handleCopyText(msg, 'টেস্ট মেসেজ');
                    }}
                  >
                    <Copy size={13} />
                    <span>মেসেজ কপি</span>
                  </Button>

                  <Button
                    variant="success"
                    size="sm"
                    className="d-flex align-items-center gap-1.5 py-1 px-3 fs-8 fw-bold text-white"
                    style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                    onClick={() => {
                      const msg = renderReminderMessage(testTemplate.text, sampleTeacher, sampleBatch);
                      openWhatsAppChat(sampleTeacher.phone || '', msg);
                    }}
                    disabled={!sampleTeacher.phone || sampleTeacher.phone === '0'}
                  >
                    <Send size={13} />
                    <span>WhatsApp-এ টেস্ট ওপেন</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTestModalOpen(false);
              setTestTemplate(null);
            }}
          >
            বন্ধ করুন
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={deleteConfirm.show}
        title="টেমপ্লেট মুছে ফেলুন"
        message={`আপনি কি নিশ্চিতভাবে "${deleteConfirm.template?.name}" টেমপ্লেটটি মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.template && deleteMutation.mutate(deleteConfirm.template.id)}
        onCancel={() => setDeleteConfirm({ show: false, template: null })}
      />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        show={resetConfirm}
        title="সিস্টেম ডিফল্ট রিস্টোর"
        message="আপনি কি সকল মেসেজ টেমপ্লেটকে সিস্টেম ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান? এতে আপনার কাস্টম তৈরি টেমপ্লেটগুলো ডিফল্ট তালিকায় রিসেট হবে।"
        confirmText="হ্যাঁ, ডিফল্ট রিস্টোর করুন"
        variant="warning"
        isLoading={resetMutation.isPending}
        onConfirm={() => resetMutation.mutate()}
        onCancel={() => setResetConfirm(false)}
      />
    </div>
  );
};

export default MessageTemplateSettings;
