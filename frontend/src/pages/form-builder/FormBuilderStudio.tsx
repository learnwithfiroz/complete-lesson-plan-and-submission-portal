import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Badge, Modal, Row, Col, ProgressBar } from 'react-bootstrap';
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
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formSchemasApi } from '../../api/formSchemas';
import type { FormSchema, FormSchemaData, FormField, FormType, FieldType } from '../../types/formBuilder';
import { defaultAdmissionSchemaData } from '../../data/defaultAdmissionSchema';

export const FormBuilderStudio: React.FC = () => {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();

  // Active form type (admission, job, tender)
  const [formType, setFormType] = useState<FormType>((type as FormType) || 'admission');
  const [schemasList, setSchemasList] = useState<FormSchema[]>([]);
  const [currentSchemaId, setCurrentSchemaId] = useState<number | null>(null);
  const [schemaData, setSchemaData] = useState<FormSchemaData>(defaultAdmissionSchemaData);
  const [templateTitle, setTemplateTitle] = useState<string>(defaultAdmissionSchemaData.title);
  const [postPaymentDoc, setPostPaymentDoc] = useState<string>(defaultAdmissionSchemaData.post_payment_document);
  const [layoutStyle, setLayoutStyle] = useState<'wizard' | 'single_page' | 'tabbed'>('wizard');

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

  // New Custom Field state
  const [newFieldSectionId, setNewFieldSectionId] = useState<string>('');
  const [newFieldKey, setNewFieldKey] = useState<string>('');
  const [newFieldLabelEn, setNewFieldLabelEn] = useState<string>('');
  const [newFieldLabelBn, setNewFieldLabelBn] = useState<string>('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldRequired, setNewFieldRequired] = useState<boolean>(true);
  const [newFieldVisible, setNewFieldVisible] = useState<boolean>(true);
  const [newFieldCol] = useState<number>(6);

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
        if (defaultOrFirst.schema_data && defaultOrFirst.schema_data.sections) {
          setSchemaData(defaultOrFirst.schema_data);
          setTemplateTitle(defaultOrFirst.title || defaultOrFirst.schema_data.title);
          setPostPaymentDoc(defaultOrFirst.schema_data.post_payment_document || 'Application Voucher (কাগজী পেসে প্রবেশপত্র)');
          setLayoutStyle(defaultOrFirst.schema_data.layout_style || 'wizard');
        }
      } else {
        setSchemaData(defaultAdmissionSchemaData);
        setTemplateTitle(defaultAdmissionSchemaData.title);
      }
    } catch (err) {
      console.warn('Could not load online schemas, using standard default schema template.', err);
      setSchemaData(defaultAdmissionSchemaData);
    }
  };

  const handleSelectTemplate = (idStr: string) => {
    const id = Number(idStr);
    const selected = schemasList.find((s) => s.id === id);
    if (selected) {
      setCurrentSchemaId(selected.id);
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
      if (currentSchemaId) {
        await formSchemasApi.updateSchema(currentSchemaId, {
          title: templateTitle,
          schema_data: payloadData,
          post_payment_action: postPaymentDoc,
          layout_style: layoutStyle,
        });
        toast.success('✨ ফরম স্কিমা ও কনফিগারেশন সফলভাবে সেভ করা হয়েছে!');
      } else {
        const res = await formSchemasApi.createSchema({
          form_type: formType,
          title: templateTitle,
          is_default: true,
          schema_data: payloadData,
          post_payment_action: postPaymentDoc,
          layout_style: layoutStyle,
        });
        if (res.data.data?.id) {
          setCurrentSchemaId(res.data.data.id);
        }
        toast.success('✨ নতুন ফরম স্কিমা সফলভাবে তৈরি ও সেভ করা হয়েছে!');
      }
      loadSchemas(formType);
    } catch (err: any) {
      localStorage.setItem(`bsisc_form_schema_${formType}`, JSON.stringify(payloadData));
      toast.success('✨ ফরম স্কিমা লোকাল স্টোরেজে সফলভাবে সেভ করা হয়েছে!');
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
    toast.info('ফিল্ড মুছে ফেলা হয়েছে।');
  };

  const handleAddCustomQuestion = () => {
    if (!newFieldLabelEn && !newFieldLabelBn) {
      toast.error('ফিল্ডের নাম ইংরেজিতে বা বাংলায় লিখুন।');
      return;
    }
    const targetSection = newFieldSectionId || schemaData.sections[0]?.id;
    if (!targetSection) {
      toast.error('একটি সেকশন নির্বাচন করুন।');
      return;
    }

    const newField: FormField = {
      id: 'custom_' + Date.now(),
      field_key: newFieldKey || 'custom_' + Date.now(),
      category: 'CUSTOM_QUESTION',
      label_en: newFieldLabelEn || newFieldLabelBn,
      label_bn: newFieldLabelBn || newFieldLabelEn,
      type: newFieldType,
      required: newFieldRequired,
      visible: newFieldVisible,
      grid_col: newFieldCol,
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

  // Compute total field count across sections
  const totalFieldsCount = schemaData.sections.reduce((acc, s) => acc + s.fields.length, 0);

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
              ⭐ Default Template ⭐
            </Badge>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-2 fw-semibold"
              style={{ borderColor: '#6366f1', color: '#6366f1' }}
              onClick={() => setShowLinkCircularModal(true)}
            >
              <LinkIcon size={14} /> Link Circulars
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-2 fw-semibold"
              style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
              onClick={() => setShowCustomQuestionModal(true)}
            >
              <Plus size={14} /> Custom Question
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-2"
              onClick={() => {
                toast.success('স্কুল ডাটা ডিকশনারি ও অটোমেটিক ফিল্ড সিঙ্ক সম্পন্ন হয়েছে!');
              }}
            >
              <RefreshCw size={14} /> Sync Dictionary
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-2 fw-semibold"
              onClick={() => setShowNewTemplateModal(true)}
            >
              <Plus size={14} /> New Template
            </Button>
            <Button
              variant="outline-dark"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-2"
              onClick={handleDuplicateTemplate}
            >
              <Copy size={14} /> Duplicate
            </Button>
          </div>
        </div>
      </div>

      {/* Form Settings Row */}
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3 border">
        <Row className="g-3 align-items-center">
          <Col md={5}>
            <Form.Label className="small fw-bold text-muted mb-1 text-uppercase">
              FORM TEMPLATE TITLE
            </Form.Label>
            <Form.Control
              type="text"
              size="sm"
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              className="fw-bold"
              placeholder="Enter form template title"
            />
          </Col>
          <Col md={4}>
            <Form.Label className="small fw-bold text-muted mb-1 text-uppercase">
              POST-PAYMENT DOCUMENT DELIVERY
            </Form.Label>
            <Form.Select
              size="sm"
              value={postPaymentDoc}
              onChange={(e) => setPostPaymentDoc(e.target.value)}
              style={{ color: '#059669', fontWeight: 600 }}
              className="bg-success-subtle border-success"
            >
              <option value="Application Voucher (কাগজী পেসে প্রবেশপত্র)">
                📄 Application Voucher (কাগজী পেসে প্রবেশপত্র)
              </option>
              <option value="Instant Admit Card (তাৎক্ষণিক প্রবেশপত্র)">
                🎟️ Instant Admit Card (তাৎক্ষণিক প্রবেশপত্র)
              </option>
              <option value="Payment Acknowledgment Slip">
                🧾 Payment Acknowledgment Slip
              </option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Label className="small fw-bold text-muted mb-1 text-uppercase">
              FORM LAYOUT STYLE
            </Form.Label>
            <Form.Select
              size="sm"
              value={layoutStyle}
              onChange={(e: any) => setLayoutStyle(e.target.value)}
              style={{ color: '#7c3aed', fontWeight: 600 }}
              className="bg-primary-subtle border-primary"
            >
              <option value="wizard">🎛️ Multi-Step Wizard</option>
              <option value="single_page">📜 Single Page Form</option>
              <option value="tabbed">📑 Tabbed Section</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      {/* Section Navigation Bar */}
      <div className="bg-white rounded-3 shadow-sm p-2 mb-3 border">
        <div className="d-flex align-items-center justify-content-between mb-2 px-2">
          <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
            <span>👆 Drag tabs with mouse or use arrows to change section order</span>
          </small>
        </div>
        <div className="d-flex align-items-center gap-2 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
          <Button
            variant={activeSectionId === 'all' ? 'primary' : 'light'}
            size="sm"
            className="rounded-pill px-3 py-1 fw-bold fs-7 d-flex align-items-center gap-1"
            onClick={() => setActiveSectionId('all')}
          >
            All Sections ({totalFieldsCount})
          </Button>

          {schemaData.sections.map((sec) => (
            <Button
              key={sec.id}
              variant={activeSectionId === sec.id ? 'primary' : 'outline-secondary'}
              size="sm"
              className={`rounded-pill px-3 py-1 fs-7 d-flex align-items-center gap-1 ${
                activeSectionId === sec.id ? 'fw-bold shadow-sm' : 'bg-light border-light-subtle text-dark'
              }`}
              onClick={() => setActiveSectionId(sec.id)}
            >
              {getSectionIcon(sec.section_key)}
              <span>
                {sec.name_en} ({sec.fields.length})
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content Workspace: Left Editor Cards + Right Live Preview */}
      <Row className="g-3">
        {/* Left Panel: Field Editor Cards */}
        <Col lg={7} xl={7}>
          <div className="bg-white rounded-3 shadow-sm p-3 border mb-3">
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold text-muted">Field Editor Language:</span>
                <div className="btn-group btn-group-sm" role="group">
                  <Button
                    variant={editorLanguage === 'en' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    className="py-0 px-2"
                    onClick={() => setEditorLanguage('en')}
                  >
                    English
                  </Button>
                  <Button
                    variant={editorLanguage === 'bn' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    className="py-0 px-2"
                    onClick={() => setEditorLanguage('bn')}
                  >
                    বাংলা
                  </Button>
                  <Button
                    variant={editorLanguage === 'both' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    className="py-0 px-2 fw-bold"
                    onClick={() => setEditorLanguage('both')}
                  >
                    Both (উভয়)
                  </Button>
                </div>
              </div>

              <div className="small text-muted">
                Showing <strong>{displayedSections.reduce((a, s) => a + s.fields.length, 0)}</strong> fields
              </div>
            </div>

            {/* Field Cards List */}
            <div className="d-flex flex-column gap-3" style={{ maxHeight: '780px', overflowY: 'auto', paddingRight: '4px' }}>
              {displayedSections.map((sec) => (
                <div key={sec.id} className="mb-2">
                  <div className="d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded-2 border">
                    <span className="fw-bold text-primary fs-7 d-flex align-items-center gap-1">
                      {getSectionIcon(sec.section_key)}
                      {sec.name_en} / {sec.name_bn}
                    </span>
                    <Badge bg="secondary" className="ms-auto">
                      {sec.fields.length} Fields
                    </Badge>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {sec.fields.map((field, fieldIdx) => (
                      <Card
                        key={field.id}
                        className={`border rounded-3 transition-all ${
                          !field.visible ? 'opacity-60 bg-light-subtle' : 'bg-white shadow-xs'
                        }`}
                        style={{ borderLeft: field.required ? '4px solid #ef4444' : '4px solid #94a3b8' }}
                      >
                        <Card.Body className="p-2">
                          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="light" text="dark" className="border font-monospace small px-2 py-1">
                                {field.category || 'FIELD'}
                              </Badge>
                              <strong className="fs-7 text-dark">{field.label_en || field.field_key}</strong>
                              {field.profile_sync && (
                                <span className="badge bg-info-subtle text-info border small" style={{ fontSize: '10px' }}>
                                  Profile Sync: {field.profile_sync}
                                </span>
                              )}
                            </div>

                            <div className="d-flex align-items-center gap-1">
                              {/* Required Toggle */}
                              <Button
                                variant={field.required ? 'danger' : 'outline-secondary'}
                                size="sm"
                                className="py-0 px-2 fs-8 fw-bold rounded-2 d-flex align-items-center gap-1"
                                onClick={() =>
                                  handleFieldChange(sec.id, field.id, 'required', !field.required)
                                }
                              >
                                {field.required ? '★ Required' : '☆ Optional'}
                              </Button>

                              {/* Visible Toggle */}
                              <Button
                                variant={field.visible ? 'success' : 'outline-secondary'}
                                size="sm"
                                className="py-0 px-2 fs-8 fw-bold rounded-2 d-flex align-items-center gap-1"
                                onClick={() =>
                                  handleFieldChange(sec.id, field.id, 'visible', !field.visible)
                                }
                              >
                                {field.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                {field.visible ? 'Visible' : 'Hidden'}
                              </Button>

                              {/* Reorder Buttons */}
                              <Button
                                variant="light"
                                size="sm"
                                className="p-1 border"
                                onClick={() => handleMoveField(sec.id, fieldIdx, 'up')}
                                disabled={fieldIdx === 0}
                                title="Move Up"
                              >
                                <ArrowUp size={13} />
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                className="p-1 border"
                                onClick={() => handleMoveField(sec.id, fieldIdx, 'down')}
                                disabled={fieldIdx === sec.fields.length - 1}
                                title="Move Down"
                              >
                                <ArrowDown size={13} />
                              </Button>

                              {/* Delete for custom fields */}
                              {field.id.startsWith('custom_') && (
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="p-1"
                                  onClick={() => handleDeleteField(sec.id, field.id)}
                                  title="Delete Field"
                                >
                                  <Trash2 size={13} />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Inputs for Labels */}
                          <Row className="g-2">
                            {(editorLanguage === 'en' || editorLanguage === 'both') && (
                              <Col md={editorLanguage === 'both' ? 6 : 12}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={field.label_en}
                                  onChange={(e) =>
                                    handleFieldChange(sec.id, field.id, 'label_en', e.target.value)
                                  }
                                  placeholder="English Label / Title"
                                  className="fs-8"
                                />
                              </Col>
                            )}
                            {(editorLanguage === 'bn' || editorLanguage === 'both') && (
                              <Col md={editorLanguage === 'both' ? 6 : 12}>
                                <Form.Control
                                  type="text"
                                  size="sm"
                                  value={field.label_bn}
                                  onChange={(e) =>
                                    handleFieldChange(sec.id, field.id, 'label_bn', e.target.value)
                                  }
                                  placeholder="বাংলা লেবেল / নির্দেশনা"
                                  className="fs-8 text-primary"
                                />
                              </Col>
                            )}
                          </Row>
                        </Card.Body>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Right Panel: Live Candidate View Preview */}
        <Col lg={5} xl={5}>
          <div className="bg-white rounded-3 shadow-sm p-3 border position-sticky" style={{ top: '15px' }}>
            {/* Live Preview Header Bar */}
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success rounded-circle p-1 d-inline-block" style={{ width: 8, height: 8 }} />
                <strong className="fs-7 text-dark">Live Candidate View Preview</strong>
              </div>

              <div className="d-flex align-items-center gap-2">
                {/* Language Switcher */}
                <div className="btn-group btn-group-sm" role="group">
                  <Button
                    variant={previewLanguage === 'bn' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    className="py-0 px-2 fs-8"
                    onClick={() => setPreviewLanguage('bn')}
                  >
                    বাংলা (BN)
                  </Button>
                  <Button
                    variant={previewLanguage === 'en' ? 'primary' : 'outline-secondary'}
                    size="sm"
                    className="py-0 px-2 fs-8"
                    onClick={() => setPreviewLanguage('en')}
                  >
                    English (EN)
                  </Button>
                </div>

                {/* Device Switcher */}
                <div className="btn-group btn-group-sm" role="group">
                  <Button
                    variant={previewDevice === 'desktop' ? 'dark' : 'outline-secondary'}
                    size="sm"
                    className="py-0 px-2"
                    onClick={() => setPreviewDevice('desktop')}
                    title="Desktop Preview"
                  >
                    <Monitor size={13} />
                  </Button>
                  <Button
                    variant={previewDevice === 'mobile' ? 'dark' : 'outline-secondary'}
                    size="sm"
                    className="py-0 px-2"
                    onClick={() => setPreviewDevice('mobile')}
                    title="Mobile Preview"
                  >
                    <Smartphone size={13} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Live Form Screen Container */}
            <div
              className={`border rounded-4 p-3 bg-light overflow-auto transition-all ${
                previewDevice === 'mobile' ? 'mx-auto' : ''
              }`}
              style={{
                maxWidth: previewDevice === 'mobile' ? '360px' : '100%',
                maxHeight: '740px',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {/* School Header in Preview */}
              <div className="bg-white rounded-3 p-3 mb-3 border text-center shadow-xs">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{ width: 32, height: 32, objectFit: 'contain' }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div>
                    <h6 className="fw-bold mb-0 text-dark fs-7" style={{ lineHeight: '1.2' }}>
                      Baridhara Scholars' International School and College (BSISC)
                    </h6>
                    <small className="text-muted" style={{ fontSize: '10px' }}>
                      (School ID: 1005)
                    </small>
                  </div>
                </div>

                <div className="d-flex flex-wrap align-items-center justify-content-center gap-1 mt-2">
                  <Badge bg="primary-subtle" text="primary" className="border px-2 py-1 fs-8">
                    {templateTitle}
                  </Badge>
                  <Badge bg="success-subtle" text="success" className="border px-2 py-1 fs-8">
                    📄 Download Admit Card After Admin Approval
                  </Badge>
                  <Badge bg="success" className="px-2 py-1 fs-8">
                    ● Live Preview
                  </Badge>
                </div>
              </div>

              {/* Wizard Step Indicator */}
              <div className="bg-white rounded-3 p-2 mb-3 border shadow-xs">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="fw-bold fs-8 text-primary">
                    Step {activePreviewStep + 1} of {schemaData.sections.length}:{' '}
                    {previewLanguage === 'bn' ? currentPreviewSection.name_bn : currentPreviewSection.name_en}
                  </span>
                  <span className="small text-muted fs-8">{previewProgress}% Completed</span>
                </div>
                <ProgressBar now={previewProgress} variant="primary" style={{ height: 6 }} className="rounded-pill mb-2" />

                {/* Step Badges Row */}
                <div className="d-flex gap-1 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
                  {schemaData.sections.map((sec, idx) => (
                    <Button
                      key={sec.id}
                      variant={idx === activePreviewStep ? 'primary' : idx < activePreviewStep ? 'success' : 'light'}
                      size="sm"
                      className="py-0 px-2 rounded-pill fs-8 d-flex align-items-center gap-1 border"
                      onClick={() => setActivePreviewStep(idx)}
                      style={{ fontSize: '10px' }}
                    >
                      <span className="badge rounded-circle bg-white text-dark p-0" style={{ width: 14, height: 14, lineHeight: '14px' }}>
                        {idx + 1}
                      </span>
                      <span>{previewLanguage === 'bn' ? sec.name_bn.split('.')[1] || sec.name_bn : sec.name_en.split('.')[1] || sec.name_en}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Current Step Rendered Form Fields */}
              <div className="bg-white rounded-3 p-3 border shadow-xs mb-3">
                <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 fs-7 d-flex align-items-center gap-1">
                  {getSectionIcon(currentPreviewSection.section_key)}
                  {previewLanguage === 'bn' ? currentPreviewSection.name_bn : currentPreviewSection.name_en}
                </h6>

                <Row className="g-2">
                  {currentPreviewSection.fields
                    .filter((f) => f.visible)
                    .map((f) => (
                      <Col key={f.id} md={previewDevice === 'mobile' ? 12 : f.grid_col || 6} xs={12}>
                        <Form.Group className="mb-2">
                          <Form.Label className="fs-8 fw-semibold mb-1 text-dark d-flex align-items-center justify-content-between">
                            <span>
                              {previewLanguage === 'bn' ? f.label_bn || f.label_en : f.label_en}
                              {f.required && <span className="text-danger ms-1">*</span>}
                            </span>
                          </Form.Label>

                          {/* Field inputs by type */}
                          {f.type === 'select' ? (
                            <Form.Select
                              size="sm"
                              className="fs-8 bg-light"
                              value={previewValues[f.field_key] || ''}
                              onChange={(e) =>
                                setPreviewValues({ ...previewValues, [f.field_key]: e.target.value })
                              }
                            >
                              <option value="">-- Select Option --</option>
                              {(f.options || []).map((opt, oIdx) => (
                                <option key={oIdx} value={opt.value}>
                                  {previewLanguage === 'bn' ? opt.label_bn || opt.label_en : opt.label_en}
                                </option>
                              ))}
                            </Form.Select>
                          ) : f.type === 'textarea' ? (
                            <Form.Control
                              as="textarea"
                              rows={2}
                              size="sm"
                              className="fs-8 bg-light"
                              placeholder={f.placeholder || 'বিস্তারিত লিখুন...'}
                              value={previewValues[f.field_key] || ''}
                              onChange={(e) =>
                                setPreviewValues({ ...previewValues, [f.field_key]: e.target.value })
                              }
                            />
                          ) : f.type === 'file' ? (
                            <div className="border border-dashed rounded-2 p-2 text-center bg-light">
                              <Paperclip size={18} className="text-muted mb-1" />
                              <div className="fs-8 text-muted">Click or drag file to upload</div>
                            </div>
                          ) : (
                            <Form.Control
                              type={f.type}
                              size="sm"
                              className="fs-8 bg-light"
                              placeholder={f.placeholder || 'CANDIDATE INPUT...'}
                              value={previewValues[f.field_key] || ''}
                              onChange={(e) =>
                                setPreviewValues({ ...previewValues, [f.field_key]: e.target.value })
                              }
                            />
                          )}
                        </Form.Group>
                      </Col>
                    ))}
                </Row>
              </div>

              {/* Wizard Bottom Step Navigation */}
              <div className="d-flex justify-content-between align-items-center pt-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={activePreviewStep === 0}
                  onClick={() => setActivePreviewStep((p) => Math.max(0, p - 1))}
                  className="d-flex align-items-center gap-1 fs-8 rounded-2"
                >
                  <ChevronLeft size={14} /> Back
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                  onClick={() => {
                    if (activePreviewStep < schemaData.sections.length - 1) {
                      setActivePreviewStep((p) => p + 1);
                    } else {
                      toast.success('🎉 লাইভ প্রিভিউ ফর্ম সফলভাবে সাবমিট হয়েছে!');
                    }
                  }}
                  className="d-flex align-items-center gap-1 fs-8 fw-bold rounded-2 px-3"
                >
                  <span>
                    {activePreviewStep < schemaData.sections.length - 1
                      ? 'Save & Next Step'
                      : 'Submit Application'}
                  </span>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* Modal 1: Custom Question Modal */}
      <Modal show={showCustomQuestionModal} onHide={() => setShowCustomQuestionModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <Plus size={18} className="text-primary" />
            Add Custom Question / Field
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Target Section (সেকশন নির্বাচন করুন)</Form.Label>
              <Form.Select
                size="sm"
                value={newFieldSectionId}
                onChange={(e) => setNewFieldSectionId(e.target.value)}
              >
                {schemaData.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_en} / {s.name_bn}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Field Type (ইনপুট ধরন)</Form.Label>
              <Form.Select
                size="sm"
                value={newFieldType}
                onChange={(e: any) => setNewFieldType(e.target.value)}
              >
                <option value="text">Single Line Text</option>
                <option value="textarea">Multi-line Textarea</option>
                <option value="select">Dropdown Select</option>
                <option value="date">Date Picker</option>
                <option value="number">Numeric / Amount</option>
                <option value="tel">Phone / Mobile No</option>
                <option value="file">Document / Image Upload</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Label (English)</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="e.g. Previous Extracurricular Awards"
                value={newFieldLabelEn}
                onChange={(e) => setNewFieldLabelEn(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Label (Bangla / বাংলা)</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="যেমন: পূর্ববর্তী সহশিক্ষা কার্যক্রম ও পুরস্কার"
                value={newFieldLabelBn}
                onChange={(e) => setNewFieldLabelBn(e.target.value)}
              />
            </Form.Group>

            <Row className="g-2 mb-2">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="custom-req-switch"
                  label="Required (বাধ্যতামূলক)"
                  checked={newFieldRequired}
                  onChange={(e) => setNewFieldRequired(e.target.checked)}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="custom-vis-switch"
                  label="Visible (দৃশ্যমান)"
                  checked={newFieldVisible}
                  onChange={(e) => setNewFieldVisible(e.target.checked)}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowCustomQuestionModal(false)}>
            বাতিল
          </Button>
          <Button variant="primary" size="sm" className="fw-bold" onClick={handleAddCustomQuestion}>
            কাস্টম ফিল্ড যুক্ত করুন
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal 2: Link Circulars Modal */}
      <Modal show={showLinkCircularModal} onHide={() => setShowLinkCircularModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <LinkIcon size={18} className="text-primary" />
            Link Active Circulars & Campaigns
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-muted mb-3">
            এই ফর্ম টেমপ্লেটটি কোন কোন সার্কুলার বা অ্যাডমিশন ক্যাম্পেইনের জন্য কার্যকর থাকবে তা নির্ধারণ করুন:
          </p>
          <div className="d-flex flex-column gap-2">
            <div className="p-2 border rounded-2 bg-light d-flex align-items-center justify-content-between">
              <div>
                <strong>BSISC Admission Circular 2026-2027</strong>
                <div className="small text-muted">Play to Class IX (Bangla & English Version)</div>
              </div>
              <Form.Check defaultChecked />
            </div>
            <div className="p-2 border rounded-2 bg-light d-flex align-items-center justify-content-between">
              <div>
                <strong>Mid-Term Lateral Entry Admission 2026</strong>
                <div className="small text-muted">Class VI to VIII</div>
              </div>
              <Form.Check />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" size="sm" onClick={() => setShowLinkCircularModal(false)}>
            সংরক্ষণ করুন
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal 3: New Template Modal */}
      <Modal show={showNewTemplateModal} onHide={() => setShowNewTemplateModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <Plus size={18} className="text-primary" />
            Create New Form Template
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Template Title (টেমপ্লেটের নাম)</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="যেমন: একাদশ শ্রেণি ভর্তি আবেদন ফরম ২০২৬"
                value={newTemplateTitle}
                onChange={(e) => setNewTemplateTitle(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowNewTemplateModal(false)}>
            বাতিল
          </Button>
          <Button variant="primary" size="sm" className="fw-bold" onClick={handleCreateNewTemplate}>
            তৈরি করুন
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FormBuilderStudio;
