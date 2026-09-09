import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Badge, Modal, Row, Col, ProgressBar, Table, Spinner, Alert } from 'react-bootstrap';
import {
  Save,
  Plus,
  Copy,
  RefreshCw,
  Link as LinkIcon,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Trash2,
  Sliders,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Users,
  MapPin,
  UserCheck,
  Paperclip,
  FileText,
  Briefcase,
  Layers,
  Share2,
  ExternalLink,
  QrCode,
  CheckCircle2,
  Download,
  Search,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formSchemasApi } from '../../api/formSchemas';
import { formSubmissionsApi, type FormSubmissionRecord } from '../../api/formSubmissions';
import type { FormSchema, FormSchemaData, FormField, FormType, FieldType } from '../../types/formBuilder';
import { defaultAdmissionSchemaData } from '../../data/defaultAdmissionSchema';

export const FormBuilderStudio: React.FC = () => {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();

  // Active form type (admission, job, tender)
  const [formType, setFormType] = useState<FormType>((type as FormType) || 'admission');
  const [schemasList, setSchemasList] = useState<FormSchema[]>([]);
  const [currentSchemaId, setCurrentSchemaId] = useState<number | null>(null);
  const [schemaSlug, setSchemaSlug] = useState<string>('admission');
  const [schemaData, setSchemaData] = useState<FormSchemaData>(defaultAdmissionSchemaData);
  const [templateTitle, setTemplateTitle] = useState<string>(defaultAdmissionSchemaData.title);
  const [postPaymentDoc, setPostPaymentDoc] = useState<string>(defaultAdmissionSchemaData.post_payment_document);
  const [layoutStyle, setLayoutStyle] = useState<'wizard' | 'single_page' | 'tabbed'>('wizard');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [submissionCount, setSubmissionCount] = useState<number>(0);

  // UI state
  const [activeSectionId, setActiveSectionId] = useState<string>('all');
  const [editorLanguage, setEditorLanguage] = useState<'en' | 'bn' | 'both'>('both');
  const [previewLanguage, setPreviewLanguage] = useState<'bn' | 'en'>('bn');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activePreviewStep, setActivePreviewStep] = useState<number>(0);
  const [saving, setSaving] = useState<boolean>(false);

  // Modals state
  const [showCustomQuestionModal, setShowCustomQuestionModal] = useState<boolean>(false);
  const [showLinkCircularModal, setShowLinkCircularModal] = useState<boolean>(false);
  const [showNewTemplateModal, setShowNewTemplateModal] = useState<boolean>(false);
  const [showPublicLinkModal, setShowPublicLinkModal] = useState<boolean>(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState<boolean>(false);

  // Submissions state
  const [submissionsList, setSubmissionsList] = useState<FormSubmissionRecord[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState<boolean>(false);
  const [submissionSearch, setSubmissionSearch] = useState<string>('');
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<string>('all');
  const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState<FormSubmissionRecord | null>(null);

  // New Custom Field state
  const [newFieldSectionId, setNewFieldSectionId] = useState<string>('');
  const [newFieldKey, setNewFieldKey] = useState<string>('');
  const [newFieldLabelEn, setNewFieldLabelEn] = useState<string>('');
  const [newFieldLabelBn, setNewFieldLabelBn] = useState<string>('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState<boolean>(true);
  const [newFieldVisible, setNewFieldVisible] = useState<boolean>(true);

  // New Template title state
  const [newTemplateTitle, setNewTemplateTitle] = useState<string>('');

  // Sample Preview form input values
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (type && ['admission', 'job', 'tender'].includes(type)) {
      setFormType(type as FormType);
    }
  }, [type]);

  useEffect(() => {
    loadSchemas(formType);
  }, [formType]);

  const loadSchemas = async (selectedType: FormType) => {
    try {
      const res = await formSchemasApi.getSchemas(selectedType);
      const list = res.data.data || [];
      setSchemasList(list);

      if (list.length > 0) {
        const defaultOrFirst = list.find((s: FormSchema) => s.is_default) || list[0];
        setCurrentSchemaId(defaultOrFirst.id);
        setSchemaSlug(defaultOrFirst.slug || selectedType);
        setIsActive(defaultOrFirst.is_active ?? true);
        setSubmissionCount(defaultOrFirst.submission_count || (defaultOrFirst as any).submissions_count || 0);

        if (defaultOrFirst.schema_data && defaultOrFirst.schema_data.sections) {
          setSchemaData(defaultOrFirst.schema_data);
          setTemplateTitle(defaultOrFirst.title || defaultOrFirst.schema_data.title);
          setPostPaymentDoc(defaultOrFirst.schema_data.post_payment_document || 'Application Voucher (কাগজী পেসে প্রবেশপত্র)');
          setLayoutStyle(defaultOrFirst.schema_data.layout_style || 'wizard');
        }
      } else {
        setCurrentSchemaId(null);
        setSchemaSlug(selectedType);
        setSchemaData(defaultAdmissionSchemaData);
        setTemplateTitle(defaultAdmissionSchemaData.title);
      }
    } catch (err) {
      console.error('Failed to load form schemas', err);
    }
  };

  const handleSelectTemplate = (idStr: string) => {
    const id = Number(idStr);
    if (!id) return;
    const selected = schemasList.find((s) => s.id === id);
    if (selected) {
      setCurrentSchemaId(selected.id);
      setSchemaSlug(selected.slug || formType);
      setIsActive(selected.is_active ?? true);
      setSubmissionCount(selected.submission_count || (selected as any).submissions_count || 0);
      if (selected.schema_data && selected.schema_data.sections) {
        setSchemaData(selected.schema_data);
        setTemplateTitle(selected.title || selected.schema_data.title);
        setPostPaymentDoc(selected.schema_data.post_payment_document || 'Application Voucher (কাগজী পেসে প্রবেশপত্র)');
        setLayoutStyle(selected.schema_data.layout_style || 'wizard');
      }
    }
  };

  const handleSaveSchema = async () => {
    setSaving(true);
    const payloadData: FormSchemaData = {
      ...schemaData,
      title: templateTitle,
      post_payment_document: postPaymentDoc,
      layout_style: layoutStyle,
    };

    try {
      let savedSlug = schemaSlug;
      if (currentSchemaId) {
        const res = await formSchemasApi.updateSchema(currentSchemaId, {
          title: templateTitle,
          schema_data: payloadData,
          post_payment_action: postPaymentDoc,
          layout_style: layoutStyle,
          is_active: isActive,
        });
        savedSlug = res.data.data?.slug || schemaSlug;
        setSchemaSlug(savedSlug);
        toast.success('✨ ফরম স্কিমা ও কনফিগারেশন সফলভাবে সেভ করা হয়েছে!');
      } else {
        const res = await formSchemasApi.createSchema({
          form_type: formType,
          title: templateTitle,
          is_default: true,
          schema_data: payloadData,
          post_payment_action: postPaymentDoc,
          layout_style: layoutStyle,
          is_active: isActive,
        });
        if (res.data.data?.id) {
          setCurrentSchemaId(res.data.data.id);
          savedSlug = res.data.data.slug || formType;
          setSchemaSlug(savedSlug);
        }
        toast.success('✨ নতুন ফরম স্কিমা সফলভাবে তৈরি ও সেভ করা হয়েছে!');
      }
      loadSchemas(formType);
      // Automatically show the Google Forms-style public link popup!
      setShowPublicLinkModal(true);
    } catch (err: any) {
      localStorage.setItem(`bsisc_form_schema_${formType}`, JSON.stringify(payloadData));
      toast.success('✨ ফরম স্কিমা লোকাল স্টোরেজে সফলভাবে সেভ করা হয়েছে!');
      setShowPublicLinkModal(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateTemplate = async () => {
    if (!currentSchemaId) {
      toast.info('অনুগ্রহ করে সেভ করা টেমপ্লেট নির্বাচন করুন।');
      return;
    }
    try {
      await formSchemasApi.duplicateSchema(currentSchemaId);
      toast.success('টেমপ্লেট সফলভাবে ডুপ্লিকেট করা হয়েছে!');
      loadSchemas(formType);
    } catch (err) {
      toast.error('ডুপ্লিকেট করতে ব্যর্থ হয়েছে।');
    }
  };

  // Load Submissions for the active schema
  const handleOpenSubmissions = async () => {
    if (!currentSchemaId) {
      toast.info('অনুগ্রহ করে প্রথমে ফরমটি সেভ করুন।');
      return;
    }
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const res = await formSubmissionsApi.getSubmissions(currentSchemaId, {
        search: submissionSearch || undefined,
        status: submissionStatusFilter !== 'all' ? submissionStatusFilter : undefined,
      });
      setSubmissionsList(res.data || []);
      setSubmissionCount(res.meta?.total || (res.data || []).length);
    } catch (err) {
      console.error('Failed to load submissions', err);
      toast.error('আবেদন তালিকা লোড করা সম্ভব হয়নি।');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleUpdateStatus = async (subId: number, newStatus: string) => {
    try {
      await formSubmissionsApi.updateStatus(subId, { status: newStatus });
      toast.success('আবেদনের স্ট্যাটাস আপডেট করা হয়েছে!');
      setSubmissionsList((prev) =>
        prev.map((s) => (s.id === subId ? { ...s, status: newStatus as any } : s))
      );
      if (selectedSubmissionDetail?.id === subId) {
        setSelectedSubmissionDetail((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err) {
      toast.error('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।');
    }
  };

  // Export Submissions to CSV
  const handleExportCSV = () => {
    if (submissionsList.length === 0) {
      toast.info('এক্সপোর্ট করার মতো কোনো আবেদন ডেটা পাওয়া যায়নি।');
      return;
    }

    const headers = ['Tracking Number', 'Applicant Name', 'Phone', 'Email', 'Status', 'Submission Date'];
    const rows = submissionsList.map((s) => [
      `"${s.tracking_number}"`,
      `"${s.applicant_name}"`,
      `"${s.applicant_phone || ''}"`,
      `"${s.applicant_email || ''}"`,
      `"${s.status}"`,
      `"${new Date(s.created_at).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BSISC_${formType}_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV ফাইল ডাউনলোড শুরু হয়েছে!');
  };

  // Field Edit Handlers
  const handleFieldChange = (
    sectionId: string,
    fieldId: string,
    fieldKey: keyof FormField,
    value: any
  ) => {
    setSchemaData((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const updatedFields = sec.fields.map((f) => {
          if (f.id !== fieldId) return f;
          return { ...f, [fieldKey]: value };
        });
        return { ...sec, fields: updatedFields };
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const handleMoveField = (sectionId: string, fieldIndex: number, direction: 'up' | 'down') => {
    setSchemaData((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newFields = [...sec.fields];
        const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return sec;
        const temp = newFields[fieldIndex];
        newFields[fieldIndex] = newFields[targetIndex];
        newFields[targetIndex] = temp;
        return { ...sec, fields: newFields };
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ফিল্ডটি মুছে ফেলতে চান?')) return;
    setSchemaData((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) };
      });
      return { ...prev, sections: updatedSections };
    });
  };

  const handleAddCustomQuestion = () => {
    if (!newFieldLabelEn.trim() && !newFieldLabelBn.trim()) {
      toast.error('ফিল্ডের একটি ইংরেজি বা বাংলা নাম দিন।');
      return;
    }

    const targetSection = newFieldSectionId || schemaData.sections[0]?.id;
    if (!targetSection) {
      toast.error('অনুগ্রহ করে একটি সেকশন সিলেক্ট করুন।');
      return;
    }

    const key = newFieldKey.trim() || 'custom_' + Date.now();
    const newField: FormField = {
      id: 'f_' + Date.now(),
      key: key,
      label_en: newFieldLabelEn || newFieldLabelBn,
      label_bn: newFieldLabelBn || newFieldLabelEn,
      type: newFieldType,
      required: newFieldRequired,
      visible: newFieldVisible,
      col_width: 6,
      category_tag: 'CUSTOM_FIELD',
      profile_sync: 'customField_' + Date.now(),
    };

    setSchemaData((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id !== targetSection) return sec;
        return { ...sec, fields: [...sec.fields, newField] };
      });
      return { ...prev, sections: updatedSections };
    });

    setShowCustomQuestionModal(false);
    setNewFieldLabelEn('');
    setNewFieldLabelBn('');
    setNewFieldKey('');
    toast.success('কাস্টম ফিল্ড সফলভাবে যুক্ত করা হয়েছে!');
  };

  const handleCreateNewTemplate = () => {
    if (!newTemplateTitle.trim()) {
      toast.error('টেমপ্লেটের একটি শিরোনাম দিন।');
      return;
    }
    setTemplateTitle(newTemplateTitle);
    setCurrentSchemaId(null);
    setShowNewTemplateModal(false);
    setNewTemplateTitle('');
    toast.success('নতুন টেমপ্লেট ড্রাফট তৈরি করা হয়েছে!');
  };

  // Compute public full URL
  const publicShareUrl = `${window.location.origin}/forms/${schemaSlug || formType}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(publicShareUrl)}`;

  // Filter sections based on activeSectionId
  const displayedSections =
    activeSectionId === 'all'
      ? schemaData.sections
      : schemaData.sections.filter((s) => s.id === activeSectionId);

  // Active section for preview wizard
  const currentPreviewSection = schemaData.sections[activePreviewStep] || schemaData.sections[0];
  const previewProgress = Math.round(((activePreviewStep + 1) / (schemaData.sections.length || 1)) * 100);

  const getSectionIcon = (sectionKey?: string) => {
    switch (sectionKey) {
      case 'student_identity':
        return <User size={15} className="me-1" />;
      case 'parents_details':
        return <Users size={15} className="me-1" />;
      case 'guardian_details':
        return <Shield size={15} className="me-1" />;
      case 'address_geo':
        return <MapPin size={15} className="me-1" />;
      case 'sibling_info':
        return <UserCheck size={15} className="me-1" />;
      case 'documents_upload':
        return <Paperclip size={15} className="me-1" />;
      default:
        return <FileText size={15} className="me-1" />;
    }
  };

  return (
    <div className="container-fluid px-3 py-3" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Top Main Header */}
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3 border">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-2 rounded-3 text-white d-flex align-items-center justify-content-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' }}
            >
              <Sliders size={26} />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h4 className="fw-bold text-dark mb-0 fs-5">Dynamic Form Studio & Schema Builder</h4>
                <Badge bg="primary" className="fw-bold px-2 py-1 fs-8 text-uppercase">
                  PRO
                </Badge>
              </div>
              <small className="text-muted">
                Configure mandatory fields, instructions, section visibility & live candidate sync
              </small>
            </div>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Form Type Switchers */}
            <div className="btn-group p-1 bg-light rounded-pill border shadow-xs" role="group">
              <Button
                variant={formType === 'admission' ? 'success' : 'light'}
                size="sm"
                className={`rounded-pill px-3 fw-bold d-flex align-items-center gap-1 ${
                  formType === 'admission' ? 'text-white shadow-sm' : 'text-secondary'
                }`}
                onClick={() => {
                  setFormType('admission');
                  navigate('/form-builder/admission');
                }}
              >
                🎓 Admission Form
              </Button>
              <Button
                variant={formType === 'job' ? 'success' : 'light'}
                size="sm"
                className={`rounded-pill px-3 fw-bold d-flex align-items-center gap-1 ${
                  formType === 'job' ? 'text-white shadow-sm' : 'text-secondary'
                }`}
                onClick={() => {
                  setFormType('job');
                  navigate('/form-builder/job');
                }}
              >
                <Briefcase size={14} /> Job Application
              </Button>
              <Button
                variant={formType === 'tender' ? 'success' : 'light'}
                size="sm"
                className={`rounded-pill px-3 fw-bold d-flex align-items-center gap-1 ${
                  formType === 'tender' ? 'text-white shadow-sm' : 'text-secondary'
                }`}
                onClick={() => {
                  setFormType('tender');
                  navigate('/form-builder/tender');
                }}
              >
                <Layers size={14} /> Tender Form
              </Button>
            </div>

            {/* Public Link Button */}
            <Button
              variant="outline-primary"
              className="d-flex align-items-center gap-1.5 fw-bold px-3 py-2 shadow-xs rounded-3"
              onClick={() => setShowPublicLinkModal(true)}
              title="Google Forms এর মতো পাবলিক লিংক দেখুন ও কপি করুন"
            >
              <LinkIcon size={16} className="text-primary" />
              <span>Public Link (শেয়ার লিংক)</span>
            </Button>

            {/* Submissions / Responses Button */}
            <Button
              variant="outline-secondary"
              className="d-flex align-items-center gap-1.5 fw-bold px-3 py-2 shadow-xs rounded-3 position-relative"
              onClick={handleOpenSubmissions}
              title="আবেদনকারীদের তালিকা ও রেসপন্স দেখুন"
            >
              <Users size={16} />
              <span>Responses</span>
              {submissionCount > 0 && (
                <Badge bg="danger" pill className="ms-1" style={{ fontSize: '10px' }}>
                  {submissionCount}
                </Badge>
              )}
            </Button>

            {/* Save Button */}
            <Button
              variant="success"
              className="d-flex align-items-center gap-2 fw-bold px-4 py-2 shadow-sm rounded-3"
              style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
              onClick={handleSaveSchema}
              disabled={saving}
            >
              <Save size={18} />
              <span>{saving ? 'সংরক্ষণ হচ্ছে...' : 'Save Form Schema'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Saved Templates & Quick Action Toolbar */}
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3 border">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="fw-bold small text-muted text-uppercase tracking-wider">
              SAVED TEMPLATES:
            </span>
            <Form.Select
              size="sm"
              value={currentSchemaId || ''}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              style={{ width: '380px', fontWeight: 600 }}
              className="bg-light border-secondary-subtle"
            >
              {schemasList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} {s.is_default ? '⭐ (Default)' : ''}
                </option>
              ))}
              {schemasList.length === 0 && (
                <option value="">{templateTitle} ⭐ (Default)</option>
              )}
            </Form.Select>
            <Badge bg="secondary" className="px-2 py-1">
              {schemasList.length || 1} Templates
            </Badge>
            <Badge bg="warning" text="dark" className="px-2 py-1 fw-bold">
              Default Template ⭐
            </Badge>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-1.5">
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => setShowLinkCircularModal(true)}
            >
              <LinkIcon size={14} /> Link Circulars
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => setShowCustomQuestionModal(true)}
            >
              <Plus size={14} /> Custom Question
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={() => loadSchemas(formType)}
            >
              <RefreshCw size={14} /> Sync Dictionary
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1 fw-semibold"
              onClick={() => setShowNewTemplateModal(true)}
            >
              <Plus size={14} /> New Template
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1"
              onClick={handleDuplicateTemplate}
            >
              <Copy size={14} /> Duplicate
            </Button>
          </div>
        </div>
      </div>

      {/* Template Metadata & Layout Options */}
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3 border">
        <Row className="g-3 align-items-center">
          <Col md={5}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold text-uppercase mb-1">
                FORM TEMPLATE TITLE
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                className="fw-bold"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold text-uppercase mb-1">
                POST-PAYMENT DOCUMENT DELIVERY
              </Form.Label>
              <Form.Select
                size="sm"
                value={postPaymentDoc}
                onChange={(e) => setPostPaymentDoc(e.target.value)}
                className="text-success fw-bold"
              >
                <option value="Application Voucher (কাগজী পেসে প্রবেশপত্র)">
                  📄 Application Voucher (কাগজী পেসে প্রবেশপত্র)
                </option>
                <option value="Admit Card After Admin Approval">
                  🎟️ Admit Card After Admin Approval
                </option>
                <option value="Instant Token Slip">
                  📑 Instant Token Slip
                </option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small text-muted fw-bold text-uppercase mb-1">
                FORM LAYOUT STYLE
              </Form.Label>
              <Form.Select
                size="sm"
                value={layoutStyle}
                onChange={(e) => setLayoutStyle(e.target.value as any)}
                className="text-primary fw-bold"
              >
                <option value="wizard">🎛️ Multi-Step Wizard</option>
                <option value="single_page">📜 Single-Page Scroll</option>
                <option value="tabbed">📑 Tabbed Form</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Section Navigation Tabs */}
      <div className="bg-white rounded-3 shadow-sm p-2 mb-3 border">
        <div className="small text-muted mb-2 px-2 d-flex align-items-center gap-1">
          <span>👆 Drag tabs with mouse or use arrows to change section order</span>
        </div>
        <div className="d-flex gap-2 overflow-auto pb-1 align-items-center no-scrollbar">
          <Button
            variant={activeSectionId === 'all' ? 'primary' : 'light'}
            size="sm"
            className="rounded-pill px-3 text-nowrap fw-bold shadow-xs"
            onClick={() => setActiveSectionId('all')}
          >
            All Sections ({schemaData.sections.reduce((acc, s) => acc + s.fields.length, 0)})
          </Button>

          {schemaData.sections.map((sec, idx) => {
            const isActiveTab = activeSectionId === sec.id;
            return (
              <Button
                key={sec.id}
                variant={isActiveTab ? 'primary' : 'outline-secondary'}
                size="sm"
                className={`rounded-pill px-3 text-nowrap d-flex align-items-center gap-1.5 ${
                  isActiveTab ? 'fw-bold shadow-xs' : 'bg-light text-dark border-0'
                }`}
                onClick={() => setActiveSectionId(sec.id)}
              >
                {getSectionIcon(sec.key)}
                <span>
                  {idx + 1}. {sec.title_en}
                </span>
                <Badge
                  bg={isActiveTab ? 'light' : 'secondary'}
                  text={isActiveTab ? 'dark' : 'white'}
                  className="rounded-circle px-1.5 py-0.5"
                  style={{ fontSize: '10px' }}
                >
                  {sec.fields.length}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Split Workspace: Schema Builder (Left) & Live Preview (Right) */}
      <Row className="g-3">
        {/* Left Column: Schema Field Configuration Editor */}
        <Col lg={7} xl={7}>
          <div className="d-flex justify-content-between align-items-center mb-2 px-1">
            <div className="d-flex align-items-center gap-2">
              <span className="small fw-bold text-muted text-uppercase">Field Editor Language:</span>
              <div className="btn-group btn-group-sm" role="group">
                <Button
                  variant={editorLanguage === 'en' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setEditorLanguage('en')}
                >
                  English
                </Button>
                <Button
                  variant={editorLanguage === 'bn' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setEditorLanguage('bn')}
                >
                  বাংলা
                </Button>
                <Button
                  variant={editorLanguage === 'both' ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setEditorLanguage('both')}
                >
                  Both (উভয়)
                </Button>
              </div>
            </div>
            <span className="text-muted small">
              Showing <strong>{displayedSections.reduce((acc, s) => acc + s.fields.length, 0)}</strong> fields
            </span>
          </div>

          {/* Render Sections and Fields */}
          {displayedSections.map((section, sIdx) => (
            <Card key={section.id} className="mb-3 border-0 shadow-sm rounded-3 overflow-hidden">
              <Card.Header className="bg-white border-bottom py-2.5 px-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  {getSectionIcon(section.key)}
                  <h6 className="fw-bold text-primary mb-0">
                    {sIdx + 1}. {section.title_en} / {section.title_bn}
                  </h6>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg="secondary" className="px-2 py-1">
                    {section.fields.length} Fields
                  </Badge>
                </div>
              </Card.Header>

              <Card.Body className="p-2.5 bg-light">
                <div className="d-flex flex-column gap-2">
                  {section.fields.map((field, fIdx) => (
                    <div
                      key={field.id}
                      className={`bg-white p-2.5 rounded-3 border transition-all ${
                        field.visible ? 'shadow-xs' : 'opacity-50 bg-light'
                      }`}
                    >
                      <Row className="g-2 align-items-center">
                        {/* Tag & Key */}
                        <Col xs={12} md={3}>
                          <div className="d-flex flex-column">
                            <span className="badge bg-light text-dark border text-start font-monospace mb-1 text-truncate" style={{ fontSize: '10px' }}>
                              {field.category_tag || 'FIELD'}
                            </span>
                            <span className="fw-bold text-dark text-truncate small" title={field.label_en}>
                              {field.label_en}
                            </span>
                            {field.profile_sync && (
                              <span className="text-info extra-small" style={{ fontSize: '10.5px' }}>
                                Profile Sync: {field.profile_sync}
                              </span>
                            )}
                          </div>
                        </Col>

                        {/* Editable Labels */}
                        <Col xs={12} md={5}>
                          <Row className="g-1">
                            {(editorLanguage === 'en' || editorLanguage === 'both') && (
                              <Col xs={editorLanguage === 'both' ? 6 : 12}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  placeholder="English Label"
                                  value={field.label_en}
                                  onChange={(e) => handleFieldChange(section.id, field.id, 'label_en', e.target.value)}
                                  className="form-control-sm"
                                />
                              </Col>
                            )}
                            {(editorLanguage === 'bn' || editorLanguage === 'both') && (
                              <Col xs={editorLanguage === 'both' ? 6 : 12}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  placeholder="বাংলা লেবেল"
                                  value={field.label_bn}
                                  onChange={(e) => handleFieldChange(section.id, field.id, 'label_bn', e.target.value)}
                                  className="form-control-sm font-sans"
                                />
                              </Col>
                            )}
                          </Row>
                        </Col>

                        {/* Action Toggles: Required, Visible, Move, Delete */}
                        <Col xs={12} md={4}>
                          <div className="d-flex align-items-center justify-content-end gap-1.5">
                            {/* Required toggle */}
                            <Button
                              variant={field.required ? 'danger' : 'outline-secondary'}
                              size="sm"
                              className="py-0.5 px-2 font-monospace"
                              style={{ fontSize: '11px' }}
                              onClick={() => handleFieldChange(section.id, field.id, 'required', !field.required)}
                              title={field.required ? 'অবশ্যই পূরণ করতে হবে (Required)' : 'ঐচ্ছিক (Optional)'}
                            >
                              ★ {field.required ? 'Required' : 'Optional'}
                            </Button>

                            {/* Visible toggle */}
                            <Button
                              variant={field.visible ? 'success' : 'outline-secondary'}
                              size="sm"
                              className="py-0.5 px-2 font-monospace"
                              style={{ fontSize: '11px' }}
                              onClick={() => handleFieldChange(section.id, field.id, 'visible', !field.visible)}
                              title={field.visible ? 'ফিল্ডটি দৃশমান (Visible)' : 'লুকানো (Hidden)'}
                            >
                              {field.visible ? <Eye size={12} className="me-1" /> : <EyeOff size={12} className="me-1" />}
                              {field.visible ? 'Visible' : 'Hidden'}
                            </Button>

                            {/* Move Up */}
                            <Button
                              variant="light"
                              size="sm"
                              className="p-1 border"
                              disabled={fIdx === 0}
                              onClick={() => handleMoveField(section.id, fIdx, 'up')}
                              title="উপরে নিন"
                            >
                              <ArrowUp size={13} />
                            </Button>

                            {/* Move Down */}
                            <Button
                              variant="light"
                              size="sm"
                              className="p-1 border"
                              disabled={fIdx === section.fields.length - 1}
                              onClick={() => handleMoveField(section.id, fIdx, 'down')}
                              title="নিচে নিন"
                            >
                              <ArrowDown size={13} />
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="light"
                              size="sm"
                              className="p-1 border text-danger"
                              onClick={() => handleDeleteField(section.id, field.id)}
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          ))}
        </Col>

        {/* Right Column: Live Candidate View Preview */}
        <Col lg={5} xl={5}>
          <div className="sticky-top" style={{ top: '15px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
              <div className="d-flex align-items-center gap-1.5">
                <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }} />
                <span className="fw-bold text-dark small">Live Candidate View Preview</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="btn-group btn-group-sm" role="group">
                  <Button
                    variant={previewLanguage === 'bn' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPreviewLanguage('bn')}
                  >
                    বাংলা (BN)
                  </Button>
                  <Button
                    variant={previewLanguage === 'en' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPreviewLanguage('en')}
                  >
                    English (EN)
                  </Button>
                </div>
                <div className="btn-group btn-group-sm" role="group">
                  <Button
                    variant={previewDevice === 'desktop' ? 'dark' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPreviewDevice('desktop')}
                  >
                    <Monitor size={14} />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'dark' : 'outline-secondary'}
                    size="sm"
                    onClick={() => setPreviewDevice('mobile')}
                  >
                    <Smartphone size={14} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Candidate Frame Simulation */}
            <div
              className={`bg-white rounded-4 shadow-sm border p-3 ${
                previewDevice === 'mobile' ? 'mx-auto' : ''
              }`}
              style={{
                maxWidth: previewDevice === 'mobile' ? '375px' : '100%',
                maxHeight: '85vh',
                overflowY: 'auto',
              }}
            >
              {/* Institution Header in Preview */}
              <div className="text-center pb-3 mb-3 border-bottom">
                <img
                  src="/logo.png"
                  alt="BSISC Logo"
                  style={{ width: 45, height: 45, objectFit: 'contain' }}
                  className="mb-1.5"
                />
                <h6 className="fw-bold text-dark mb-0 fs-6">
                  Baridhara Scholars' International School and College (BSISC)
                </h6>
                <small className="text-muted" style={{ fontSize: '10px' }}>
                  (School ID: 1005)
                </small>
                <div className="mt-2">
                  <span className="badge bg-primary px-3 py-1.5 text-uppercase fw-semibold" style={{ fontSize: '11px' }}>
                    {templateTitle}
                  </span>
                </div>
                <div className="mt-1">
                  <Badge bg="success" className="font-monospace" style={{ fontSize: '10px' }}>
                    📄 {postPaymentDoc} • Live Preview
                  </Badge>
                </div>
              </div>

              {/* Progress Indicator */}
              {schemaData.sections.length > 1 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between small text-muted mb-1 fw-semibold">
                    <span>
                      Step {activePreviewStep + 1} of {schemaData.sections.length}:{' '}
                      <span className="text-primary">
                        {previewLanguage === 'bn' ? currentPreviewSection?.title_bn : currentPreviewSection?.title_en}
                      </span>
                    </span>
                    <span>{previewProgress}%</span>
                  </div>
                  <ProgressBar now={previewProgress} variant="primary" style={{ height: '5px' }} />
                </div>
              )}

              {/* Section Content */}
              {currentPreviewSection && (
                <div>
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 d-flex align-items-center gap-1.5">
                    {getSectionIcon(currentPreviewSection.key)}
                    {previewLanguage === 'bn'
                      ? currentPreviewSection.title_bn || currentPreviewSection.title_en
                      : currentPreviewSection.title_en || currentPreviewSection.title_bn}
                  </h6>

                  <Row className="g-2.5">
                    {currentPreviewSection.fields
                      .filter((f) => f.visible)
                      .map((f) => {
                        const label = previewLanguage === 'bn' ? f.label_bn || f.label_en : f.label_en || f.label_bn;
                        const placeholder = previewLanguage === 'bn' ? f.placeholder_bn || f.placeholder_en : f.placeholder_en || f.placeholder_bn;
                        const fieldKey = (f.key || f.field_key || f.id) as string;
                        return (
                          <Col key={f.id} xs={f.col_width === 12 ? 12 : 12}>
                            <Form.Group className="mb-2">
                              <Form.Label className="small fw-semibold text-dark mb-1">
                                {label} {f.required && <span className="text-danger">*</span>}
                              </Form.Label>
                              {f.type === 'select' ? (
                                <Form.Select size="sm" className="bg-light">
                                  <option value="">-- {previewLanguage === 'bn' ? 'নির্বাচন করুন' : 'Select'} --</option>
                                  {f.options?.map((opt: any, idx: number) => (
                                    <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
                                      {typeof opt === 'string' ? opt : previewLanguage === 'bn' ? opt.label_bn || opt.label_en : opt.label_en}
                                    </option>
                                  ))}
                                </Form.Select>
                              ) : f.type === 'textarea' ? (
                                <Form.Control as="textarea" rows={2} size="sm" placeholder={placeholder || label} className="bg-light" />
                              ) : f.type === 'file' ? (
                                <div className="p-2 border rounded bg-light text-center">
                                  <Paperclip size={16} className="text-muted mb-1" />
                                  <Form.Control type="file" size="sm" />
                                </div>
                              ) : (
                                <Form.Control
                                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
                                  size="sm"
                                  placeholder={placeholder || label}
                                  value={previewValues[fieldKey] || ''}
                                  onChange={(e) => setPreviewValues({ ...previewValues, [fieldKey]: e.target.value })}
                                  className="bg-light"
                                />
                              )}
                            </Form.Group>
                          </Col>
                        );
                      })}
                  </Row>

                  {/* Preview Navigation Steps */}
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-2 border-top">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={activePreviewStep === 0}
                      onClick={() => setActivePreviewStep((prev) => Math.max(0, prev - 1))}
                    >
                      <ChevronLeft size={14} /> {previewLanguage === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                    </Button>
                    <span className="small text-muted font-monospace">
                      {activePreviewStep + 1} / {schemaData.sections.length}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (activePreviewStep < schemaData.sections.length - 1) {
                          setActivePreviewStep((prev) => prev + 1);
                        } else {
                          toast.success('🎉 প্রিভিউ টেস্ট সম্পন্ন হয়েছে!');
                        }
                      }}
                    >
                      {activePreviewStep === schemaData.sections.length - 1
                        ? previewLanguage === 'bn' ? 'সাবমিট প্রিভিউ' : 'Submit Preview'
                        : previewLanguage === 'bn' ? 'পরবর্তী' : 'Next'} <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* ======================================================== */}
      {/* GOOGLE FORMS STYLE PUBLIC SHARABLE LINK MODAL           */}
      {/* ======================================================== */}
      <Modal show={showPublicLinkModal} onHide={() => setShowPublicLinkModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <Share2 size={20} />
            পাবলিক আবেদন ফরম লিংক (Google Forms-Style Shareable Link)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="success" className="d-flex align-items-center gap-2 mb-4 py-2.5">
            <CheckCircle2 size={22} className="text-success flex-shrink-0" />
            <div>
              <strong>ফরমটি পাবলিকলি প্রস্তুত!</strong> শিক্ষার্থী বা প্রার্থীরা কোনো লগইন ছাড়াই এই লিংকে প্রবেশ করে আবেদন সম্পন্ন করতে পারবে।
            </div>
          </Alert>

          {/* Sharable Link Box */}
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold small text-muted text-uppercase mb-1">
              DIRECT PUBLIC URL (ক্যান্ডিডেটদের জন্য সরাসরি লিংক):
            </Form.Label>
            <div className="input-group input-group-lg shadow-sm">
              <Form.Control
                type="text"
                readOnly
                value={publicShareUrl}
                className="bg-light font-monospace fs-6"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <Button
                variant="primary"
                className="fw-bold px-4 d-flex align-items-center gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(publicShareUrl);
                  toast.success('📋 লিংক কপি করা হয়েছে (Link Copied)!');
                }}
              >
                <Copy size={16} /> কপি করুন (Copy)
              </Button>
            </div>
          </Form.Group>

          <Row className="g-3 align-items-center mb-4">
            {/* QR Code */}
            <Col md={4} className="text-center border-end">
              <div className="p-2 border rounded-3 bg-light d-inline-block shadow-xs mb-1">
                <img src={qrCodeUrl} alt="QR Code" style={{ width: 140, height: 140 }} className="rounded" />
              </div>
              <div className="extra-small text-muted" style={{ fontSize: '11px' }}>
                <QrCode size={13} className="d-inline me-1" />
                মোবাইলে স্ক্যান করে আবেদন করুন
              </div>
            </Col>

            {/* Quick Actions & Social Sharing */}
            <Col md={8}>
              <h6 className="fw-bold text-dark mb-2">দ্রুত শেয়ার ও অ্যাকশন:</h6>
              <div className="d-flex flex-column gap-2">
                <a
                  href={publicShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary d-flex align-items-center justify-content-between px-3 py-2 text-decoration-none"
                >
                  <span className="d-flex align-items-center gap-2">
                    <ExternalLink size={16} /> নতুন উইন্ডোতে লাইভ ফরম ওপেন করুন (Open Live Form)
                  </span>
                  <Badge bg="primary">Live</Badge>
                </a>

                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`BSISC অনলাইন আবেদন ফরম লিংক: ${publicShareUrl}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-success d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
                >
                  <span>💬 WhatsApp-এ লিংক পাঠান (Share on WhatsApp)</span>
                </a>

                <a
                  href={`mailto:?subject=${encodeURIComponent(`BSISC অনলাইন আবেদন: ${templateTitle}`)}&body=${encodeURIComponent(`আসসালামু আলাইকুম,\n\nঅনলাইনে আবেদন করার জন্য নিচের লিংকে ক্লিক করুন:\n${publicShareUrl}\n\nধন্যবাদ,\nBSISC অ্যাডমিশন কমিটি`)}`}
                  className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2 text-decoration-none"
                >
                  <span>✉️ Email-এ লিংক পাঠান (Share via Email)</span>
                </a>
              </div>
            </Col>
          </Row>

          {/* Toggle Online Responses */}
          <div className="p-3 bg-light rounded-3 border d-flex justify-content-between align-items-center">
            <div>
              <div className="fw-bold text-dark">অনলাইন আবেদন গ্রহণ স্ট্যাটাস (Accepting Submissions)</div>
              <div className="small text-muted">চালু থাকলে প্রার্থীরা আবেদন সাবমিট করতে পারবে, বন্ধ থাকলে ফরম সাময়িক স্থগিত থাকবে।</div>
            </div>
            <Form.Check
              type="switch"
              id="form-active-switch"
              checked={isActive}
              onChange={(e) => {
                setIsActive(e.target.checked);
                if (currentSchemaId) {
                  formSchemasApi.updateSchema(currentSchemaId, { is_active: e.target.checked });
                  toast.success(e.target.checked ? 'অনলাইন আবেদন গ্রহণ চালু করা হয়েছে।' : 'অনলাইন আবেদন গ্রহণ বন্ধ করা হয়েছে।');
                }
              }}
              className="fs-4"
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowPublicLinkModal(false)}>
            বন্ধ করুন (Close)
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ======================================================== */}
      {/* SUBMISSIONS / RESPONSES VIEWER MODAL                    */}
      {/* ======================================================== */}
      <Modal show={showSubmissionsModal} onHide={() => setShowSubmissionsModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-dark text-white">
          <Modal.Title className="fw-bold fs-5 d-flex align-items-center gap-2">
            <Users size={20} className="text-warning" />
            আবেদনকারী তালিকা ও রেসপন্স ({templateTitle})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {/* Filters & Export Bar */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex gap-2 align-items-center">
              <Form.Control
                type="text"
                size="sm"
                placeholder="প্রার্থীর নাম বা ট্র্যাকিং নম্বর দিয়ে খুঁজুন..."
                value={submissionSearch}
                onChange={(e) => setSubmissionSearch(e.target.value)}
                style={{ width: '280px' }}
              />
              <Form.Select
                size="sm"
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="pending">Pending (অপেক্ষমান)</option>
                <option value="reviewed">Reviewed (যাচাইকৃত)</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="approved">Approved (অনুমোদিত)</option>
                <option value="rejected">Rejected (বাতিল)</option>
              </Form.Select>
              <Button variant="primary" size="sm" onClick={handleOpenSubmissions}>
                <Search size={14} className="me-1" /> খুঁজুন
              </Button>
            </div>

            <div className="d-flex gap-2">
              <Button variant="outline-success" size="sm" onClick={handleExportCSV} className="d-flex align-items-center gap-1.5">
                <Download size={14} /> এক্সেল / CSV ডাউনলোড
              </Button>
            </div>
          </div>

          {/* Submissions Table */}
          {loadingSubmissions ? (
            <div className="py-5 text-center">
              <Spinner animation="border" variant="primary" />
              <div className="text-muted small mt-2">আবেদন তালিকা লোড হচ্ছে...</div>
            </div>
          ) : submissionsList.length === 0 ? (
            <div className="py-5 text-center bg-light rounded-3 border">
              <FileText size={40} className="text-muted mb-2" />
              <h6 className="fw-bold text-dark">কোনো আবেদন জমা পড়েনি</h6>
              <p className="text-muted small mb-0">পাবলিক লিংক শেয়ার করে প্রার্থীদের আবেদন করতে আমন্ত্রণ জানান।</p>
            </div>
          ) : (
            <div className="table-responsive border rounded-3">
              <Table hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Tracking ID</th>
                    <th>প্রার্থীর নাম (Applicant)</th>
                    <th>মোবাইল নম্বর</th>
                    <th>আবেদনের তারিখ</th>
                    <th>স্ট্যাটাস</th>
                    <th className="text-end">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {submissionsList.map((sub) => (
                    <tr key={sub.id}>
                      <td>
                        <span className="font-monospace fw-bold text-primary">{sub.tracking_number}</span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{sub.applicant_name}</div>
                        <div className="small text-muted">{sub.applicant_email || 'No email'}</div>
                      </td>
                      <td className="font-monospace">{sub.applicant_phone || 'N/A'}</td>
                      <td>{new Date(sub.created_at).toLocaleDateString('en-GB')}</td>
                      <td>
                        <Form.Select
                          size="sm"
                          value={sub.status}
                          onChange={(e) => handleUpdateStatus(sub.id, e.target.value)}
                          style={{ width: '130px', fontSize: '12px' }}
                          className={`fw-bold ${
                            sub.status === 'approved' ? 'text-success' : sub.status === 'rejected' ? 'text-danger' : 'text-warning'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </Form.Select>
                      </td>
                      <td className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => setSelectedSubmissionDetail(sub)}
                          className="d-inline-flex align-items-center gap-1"
                        >
                          <Eye size={13} /> বিস্তারিত
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Submission Details Drawer View if selected */}
          {selectedSubmissionDetail && (
            <Card className="mt-3 border-primary border-2 shadow-sm rounded-3">
              <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-2 px-3">
                <span className="fw-bold">
                  আবেদনকারী বিস্তারিত তথ্য: {selectedSubmissionDetail.applicant_name} ({selectedSubmissionDetail.tracking_number})
                </span>
                <Button variant="link" className="text-white p-0" onClick={() => setSelectedSubmissionDetail(null)}>
                  <X size={18} />
                </Button>
              </Card.Header>
              <Card.Body className="p-3 bg-light">
                <Row className="g-2 mb-3">
                  {Object.entries(selectedSubmissionDetail.data || {}).map(([k, v]) => (
                    <Col key={k} md={6}>
                      <div className="p-2 border rounded bg-white shadow-xs">
                        <span className="text-muted extra-small d-block text-uppercase" style={{ fontSize: '10px' }}>
                          {k}
                        </span>
                        <span className="fw-semibold text-dark small">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                      </div>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowSubmissionsModal(false)}>
            বন্ধ করুন (Close)
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Link Circular Modal */}
      <Modal show={showLinkCircularModal} onHide={() => setShowLinkCircularModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-6">Link to Official Notice / Circular</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Select Official Notice / Circular</Form.Label>
            <Form.Select>
              <option value="">-- নোটিশ সিলেক্ট করুন --</option>
              <option value="1">শিক্ষার্থী ভর্তি সংক্রান্ত জরুরি বিজ্ঞপ্তি 2026</option>
              <option value="2">সহকারী শিক্ষক নিয়োগ বিজ্ঞপ্তি 2026</option>
            </Form.Select>
          </Form.Group>
          <Button
            variant="primary"
            className="w-100"
            onClick={() => {
              setShowLinkCircularModal(false);
              toast.success('নোটিশ সফলভাবে সংযুক্ত করা হয়েছে!');
            }}
          >
            সংযুক্ত করুন (Link Notice)
          </Button>
        </Modal.Body>
      </Modal>

      {/* New Template Modal */}
      <Modal show={showNewTemplateModal} onHide={() => setShowNewTemplateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-6">Create New Form Template</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Template Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. বিশেষ কোটা ভর্তি আবেদন ফরম 2026"
              value={newTemplateTitle}
              onChange={(e) => setNewTemplateTitle(e.target.value)}
            />
          </Form.Group>
          <Button variant="primary" className="w-100" onClick={handleCreateNewTemplate}>
            টেমপ্লেট তৈরি করুন (Create Template)
          </Button>
        </Modal.Body>
      </Modal>

      {/* Custom Question Modal */}
      <Modal show={showCustomQuestionModal} onHide={() => setShowCustomQuestionModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold fs-6">Add Custom Field / Question</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Target Section</Form.Label>
            <Form.Select
              value={newFieldSectionId}
              onChange={(e) => setNewFieldSectionId(e.target.value)}
            >
              {schemaData.sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title_en} / {s.title_bn}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">English Label</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Previous School EIIN"
              value={newFieldLabelEn}
              onChange={(e) => setNewFieldLabelEn(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">বাংলা লেবেল</Form.Label>
            <Form.Control
              type="text"
              placeholder="যেমন: পূর্ববর্তী বিদ্যালয়ের EIIN"
              value={newFieldLabelBn}
              onChange={(e) => setNewFieldLabelBn(e.target.value)}
            />
          </Form.Group>

          <Row className="g-2 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Field Type</Form.Label>
                <Form.Select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number</option>
                  <option value="tel">Phone / Mobile</option>
                  <option value="email">Email</option>
                  <option value="date">Date</option>
                  <option value="textarea">Textarea (Long Text)</option>
                  <option value="file">File Upload</option>
                  <option value="select">Dropdown Select</option>
                  <option value="radio">Radio Buttons</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Technical Key</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. previous_school_eiin"
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex gap-3 mb-3">
            <Form.Check
              type="checkbox"
              label="আবশ্যক (Required)"
              checked={newFieldRequired}
              onChange={(e) => setNewFieldRequired(e.target.checked)}
            />
            <Form.Check
              type="checkbox"
              label="দৃশ্যমান (Visible)"
              checked={newFieldVisible}
              onChange={(e) => setNewFieldVisible(e.target.checked)}
            />
          </div>

          <Button variant="primary" className="w-100" onClick={handleAddCustomQuestion}>
            যুক্ত করুন (Add Field)
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};