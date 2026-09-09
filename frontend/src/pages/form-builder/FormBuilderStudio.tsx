import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  Modal,
  ProgressBar,
  Dropdown,
  Table,
  Spinner,
  Alert
} from 'react-bootstrap';
import {
  Sliders,
  Save,
  Plus,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Monitor,
  Link as LinkIcon,
  HelpCircle,
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
  Sparkles,
  FolderPlus
} from 'lucide-react';
import { toast } from 'react-toastify';
import { formSchemasApi } from '../../api/formSchemas';
import { formSubmissionsApi, type FormSubmissionRecord } from '../../api/formSubmissions';
import type { FormSchema, FormSchemaData, FormField, FormSection, FormType, FieldType } from '../../types/formBuilder';
import { defaultAdmissionSchemaData } from '../../data/defaultAdmissionSchema';
import { defaultCustomSchemaData } from '../../data/defaultCustomSchema';

export const FormBuilderStudio: React.FC = () => {
  const { type } = useParams<{ type?: string }>();
  const navigate = useNavigate();

  // Active form type (admission, job, tender, custom)
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
  const [showAddSectionModal, setShowAddSectionModal] = useState<boolean>(false);
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

  // New Custom Section state
  const [newSectionNameEn, setNewSectionNameEn] = useState<string>('');
  const [newSectionNameBn, setNewSectionNameBn] = useState<string>('');
  const [newSectionIcon, setNewSectionIcon] = useState<string>('FileText');

  // New Custom Field state
  const [newFieldSectionId, setNewFieldSectionId] = useState<string>('');
  const [newFieldKey, setNewFieldKey] = useState<string>('');
  const [newFieldLabelEn, setNewFieldLabelEn] = useState<string>('');
  const [newFieldLabelBn, setNewFieldLabelBn] = useState<string>('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldOptions, setNewFieldOptions] = useState<string>('');
  const [newFieldRequired, setNewFieldRequired] = useState<boolean>(true);
  const [newFieldVisible, setNewFieldVisible] = useState<boolean>(true);
  const [newFieldCol, setNewFieldCol] = useState<number>(6);

  // New Template title state
  const [newTemplateTitle, setNewTemplateTitle] = useState<string>('');

  // Sample Preview form input values
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  useEffect(() => {
    if (type && ['admission', 'job', 'tender', 'custom'].includes(type)) {
      setFormType(type as FormType);
    }
  }, [type]);

  useEffect(() => {
    loadSchemas(formType);
  }, [formType]);

  const getDefaultDataForType = (selectedType: FormType): FormSchemaData => {
    if (selectedType === 'custom') {
      return defaultCustomSchemaData;
    }
    return defaultAdmissionSchemaData;
  };

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
        const fallbackData = getDefaultDataForType(selectedType);
        setSchemaData(fallbackData);
        setTemplateTitle(fallbackData.title);
        setPostPaymentDoc(fallbackData.post_payment_document || 'Application Voucher (কাগজী পেসে প্রবেশপত্র)');
        setLayoutStyle(fallbackData.layout_style || 'wizard');
      }
    } catch (err) {
      console.error('Failed to load form schemas', err);
      const fallbackData = getDefaultDataForType(selectedType);
      setSchemaData(fallbackData);
      setTemplateTitle(fallbackData.title);
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
          form_type: formType,
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
      console.error('Failed to save schema', err);
      toast.error(err?.response?.data?.message || 'ফরম স্কিমা সেভ করতে সমস্যা হয়েছে।');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateTemplate = async () => {
    if (!currentSchemaId) {
      toast.info('অনুগ্রহ করে প্রথমে সেভ করা একটি টেমপ্লেট নির্বাচন করুন।');
      return;
    }
    try {
      const res = await formSchemasApi.duplicateSchema(currentSchemaId);
      toast.success('টেমপ্লেট সফলভাবে ডুপ্লিকেট করা হয়েছে!');
      loadSchemas(formType);
      if (res.data.data?.id) {
        setCurrentSchemaId(res.data.data.id);
        setSchemaSlug(res.data.data.slug || formType);
      }
    } catch (err) {
      console.error('Failed to duplicate schema', err);
      toast.error('ডুপ্লিকেট করতে ব্যর্থ হয়েছে।');
    }
  };

  const handleDeleteTemplate = async () => {
    if (!currentSchemaId) return;
    if (window.confirm('আপনি কি নিশ্চিত যে এই টেমপ্লেটটি মুছে ফেলতে চান?')) {
      try {
        await formSchemasApi.deleteSchema(currentSchemaId);
        toast.success('টেমপ্লেট মুছে ফেলা হয়েছে।');
        loadSchemas(formType);
      } catch (err) {
        toast.error('মুছে ফেলতে সমস্যা হয়েছে।');
      }
    }
  };

  // Open Responses Viewer
  const handleOpenSubmissions = async () => {
    if (!currentSchemaId) {
      toast.info('কোনো সক্রিয় স্কিমা পাওয়া যায়নি।');
      return;
    }
    setShowSubmissionsModal(true);
    setLoadingSubmissions(true);
    try {
      const res = await formSubmissionsApi.getSubmissions(currentSchemaId, { per_page: 50 });
      setSubmissionsList(res.data || []);
      setSubmissionCount(res.meta?.total || res.data?.length || 0);
    } catch (err) {
      console.error('Failed to load submissions', err);
      toast.error('রেসপন্স লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleUpdateSubmissionStatus = async (submissionId: number, newStatus: string) => {
    try {
      await formSubmissionsApi.updateSubmissionStatus(submissionId, { status: newStatus });
      toast.success(`স্ট্যাটাস পরিবর্তিত হয়েছে: ${newStatus.toUpperCase()}`);
      setSubmissionsList((prev) =>
        prev.map((sub) => (sub.id === submissionId ? { ...sub, status: newStatus as any } : sub))
      );
      if (selectedSubmissionDetail && selectedSubmissionDetail.id === submissionId) {
        setSelectedSubmissionDetail((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch (err) {
      toast.error('স্ট্যাটাস আপডেট ব্যর্থ হয়েছে।');
    }
  };

  // Export responses to CSV
  const handleExportCSV = () => {
    if (submissionsList.length === 0) {
      toast.info('কোনো রেসপন্স নেই এক্সপোর্ট করার মতো।');
      return;
    }
    const headers = ['Tracking No', 'Applicant Name', 'Phone', 'Email', 'Status', 'Submitted At'];
    const rows = submissionsList.map((s) => [
      s.tracking_number,
      `"${(s.applicant_name || '').replace(/"/g, '""')}"`,
      s.applicant_phone || '',
      s.applicant_email || '',
      s.status,
      new Date(s.created_at).toLocaleString(),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${schemaSlug}_submissions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV ডাউনলোড শুরু হয়েছে!');
  };

  // Field manipulation handlers
  const handleToggleRequired = (sectionId: string, fieldId: string) => {
    setSchemaData((prev) => {
      const newSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newFields = sec.fields.map((f) => {
          if (f.id !== fieldId) return f;
          return { ...f, required: !f.required };
        });
        return { ...sec, fields: newFields };
      });
      return { ...prev, sections: newSections };
    });
  };

  const handleToggleVisibility = (sectionId: string, fieldId: string) => {
    setSchemaData((prev) => {
      const newSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newFields = sec.fields.map((f) => {
          if (f.id !== fieldId) return f;
          return { ...f, visible: !f.visible };
        });
        return { ...sec, fields: newFields };
      });
      return { ...prev, sections: newSections };
    });
  };

  const handleMoveField = (sectionId: string, fieldIndex: number, direction: 'up' | 'down') => {
    setSchemaData((prev) => {
      const newSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newFields = [...sec.fields];
        const targetIndex = direction === 'up' ? fieldIndex - 1 : fieldIndex + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return sec;

        const temp = newFields[fieldIndex];
        newFields[fieldIndex] = newFields[targetIndex];
        newFields[targetIndex] = temp;
        return { ...sec, fields: newFields };
      });
      return { ...prev, sections: newSections };
    });
  };

  const handleUpdateFieldLabel = (sectionId: string, fieldId: string, lang: 'en' | 'bn', value: string) => {
    setSchemaData((prev) => {
      const newSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        const newFields = sec.fields.map((f) => {
          if (f.id !== fieldId) return f;
          if (lang === 'en') return { ...f, label_en: value };
          return { ...f, label_bn: value };
        });
        return { ...sec, fields: newFields };
      });
      return { ...prev, sections: newSections };
    });
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    if (!window.confirm('আপনি কি নিশ্চিত যে এই ফিল্ডটি মুছে ফেলতে চান?')) return;
    setSchemaData((prev) => {
      const newSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        return { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) };
      });
      return { ...prev, sections: newSections };
    });
    toast.info('ফিল্ডটি মুছে ফেলা হয়েছে।');
  };

  // Section manipulation handlers
  const handleAddSection = () => {
    if (!newSectionNameEn.trim() && !newSectionNameBn.trim()) {
      toast.error('সেকশনের নাম দিন।');
      return;
    }
    const secOrder = schemaData.sections.length + 1;
    const newSecId = 'sec_cust_' + Date.now();
    const newSec: FormSection = {
      id: newSecId,
      section_key: 'sec_' + Date.now(),
      name_en: `${secOrder}. ${newSectionNameEn.trim() || newSectionNameBn.trim()}`,
      name_bn: `${secOrder}. ${newSectionNameBn.trim() || newSectionNameEn.trim()}`,
      title_en: `${secOrder}. ${newSectionNameEn.trim() || newSectionNameBn.trim()}`,
      title_bn: `${secOrder}. ${newSectionNameBn.trim() || newSectionNameEn.trim()}`,
      icon: newSectionIcon || 'FileText',
      order: secOrder,
      fields: [],
    };

    setSchemaData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSec],
    }));

    setActiveSectionId(newSecId);
    setShowAddSectionModal(false);
    setNewSectionNameEn('');
    setNewSectionNameBn('');
    toast.success('🎉 নতুন সেকশন সফলভাবে যুক্ত হয়েছে!');
  };

  const handleDeleteSection = (sectionId: string) => {
    if (schemaData.sections.length <= 1) {
      toast.warning('কমপক্ষে একটি সেকশন থাকা আবশ্যক।');
      return;
    }
    if (!window.confirm('আপনি কি নিশ্চিত যে সম্পূর্ণ সেকশনটি মুছে ফেলতে চান?')) return;

    setSchemaData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
    setActiveSectionId('all');
    toast.info('সেকশন মুছে ফেলা হয়েছে।');
  };

  const handleMoveSection = (sectionIndex: number, direction: 'up' | 'down') => {
    setSchemaData((prev) => {
      const newSections = [...prev.sections];
      const targetIndex = direction === 'up' ? sectionIndex - 1 : sectionIndex + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return prev;

      const temp = newSections[sectionIndex];
      newSections[sectionIndex] = newSections[targetIndex];
      newSections[targetIndex] = temp;
      return { ...prev, sections: newSections };
    });
  };

  // Add Custom Field to Schema
  const handleAddCustomField = () => {
    if (!newFieldLabelEn.trim() && !newFieldLabelBn.trim()) {
      toast.error('ফিল্ডের শিরোনাম (Label) দিন।');
      return;
    }

    const targetSection = newFieldSectionId || schemaData.sections[0]?.id;
    if (!targetSection) {
      toast.error('অনুগ্রহ করে একটি সেকশন সিলেক্ট করুন।');
      return;
    }

    const key = newFieldKey.trim() || 'custom_' + Date.now();

    // Parse options if select/radio/checkbox
    let parsedOptions: any[] | undefined = undefined;
    if (['select', 'radio', 'checkbox'].includes(newFieldType) && newFieldOptions.trim()) {
      parsedOptions = newFieldOptions
        .split(',')
        .map((opt) => opt.trim())
        .filter(Boolean)
        .map((opt) => ({
          label_en: opt,
          label_bn: opt,
          value: opt.toLowerCase().replace(/\s+/g, '_'),
        }));
    }

    const newField: FormField = {
      id: 'f_' + Date.now(),
      field_key: key,
      key: key,
      label_en: newFieldLabelEn || newFieldLabelBn,
      label_bn: newFieldLabelBn || newFieldLabelEn,
      type: newFieldType,
      options: parsedOptions,
      required: newFieldRequired,
      visible: newFieldVisible,
      grid_col: newFieldCol,
      col_width: newFieldCol,
      category: 'CUSTOM_FIELD',
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
    setNewFieldKey('');
    setNewFieldLabelEn('');
    setNewFieldLabelBn('');
    setNewFieldOptions('');
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

  const getSectionIcon = (iconName?: string) => {
    switch (iconName) {
      case 'User':
      case 'student_identity':
        return <User size={15} className="me-1 text-primary" />;
      case 'Users':
      case 'parents_details':
        return <Users size={15} className="me-1 text-success" />;
      case 'Shield':
      case 'guardian_details':
        return <Shield size={15} className="me-1 text-warning" />;
      case 'MapPin':
      case 'address_geo':
        return <MapPin size={15} className="me-1 text-danger" />;
      case 'UserCheck':
      case 'sibling_info':
        return <UserCheck size={15} className="me-1 text-info" />;
      case 'Paperclip':
      case 'documents_upload':
      case 'attachments_docs':
        return <Paperclip size={15} className="me-1 text-secondary" />;
      case 'Briefcase':
        return <Briefcase size={15} className="me-1 text-info" />;
      case 'Layers':
        return <Layers size={15} className="me-1 text-dark" />;
      case 'Sparkles':
        return <Sparkles size={15} className="me-1 text-warning" />;
      default:
        return <FileText size={15} className="me-1 text-primary" />;
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
                <h5 className="fw-bold mb-0 text-dark">Dynamic Form Studio & Schema Builder</h5>
                <Badge bg="warning" text="dark" className="fw-bold px-2 py-1 fs-8 text-uppercase">
                  PRO
                </Badge>
              </div>
              <small className="text-muted">
                Configure mandatory fields, create custom forms, instructions & share Google Forms-style links
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
              <Button
                variant={formType === 'custom' ? 'success' : 'light'}
                size="sm"
                className={`rounded-pill px-3 fw-bold d-flex align-items-center gap-1 ${
                  formType === 'custom' ? 'text-white shadow-sm' : 'text-primary'
                }`}
                onClick={() => {
                  setFormType('custom');
                  navigate('/form-builder/custom');
                }}
              >
                <Sparkles size={14} /> Custom Form
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

      {/* Saved Templates & Action Toolbar */}
      <div className="bg-white rounded-3 shadow-sm p-3 mb-3 border">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="small fw-bold text-muted text-uppercase">SAVED TEMPLATES:</span>
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
            {isActive && (
              <Badge bg="success" className="px-2 py-1 fw-bold">
                ● Accepting Submissions
              </Badge>
            )}
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
              variant="outline-success"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-2 fw-semibold"
              onClick={() => setShowAddSectionModal(true)}
            >
              <FolderPlus size={14} /> Add Section
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1 rounded-2 fw-semibold"
              style={{ backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
              onClick={() => {
                setNewFieldSectionId(schemaData.sections[0]?.id || '');
                setShowCustomQuestionModal(true);
              }}
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
              <HelpCircle size={14} /> Sync Dictionary
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
            {currentSchemaId && schemasList.length > 1 && (
              <Button
                variant="outline-danger"
                size="sm"
                className="d-flex align-items-center gap-1 rounded-2"
                onClick={handleDeleteTemplate}
              >
                <Trash2 size={14} /> Delete
              </Button>
            )}
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
                placeholder="Enter form template title"
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
                className="text-success fw-bold bg-success-subtle border-success"
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
                className="text-primary fw-bold bg-primary-subtle border-primary"
              >
                <option value="wizard">🎛️ Multi-Step Wizard</option>
                <option value="single_page">📜 Single Page Form</option>
                <option value="tabbed">📑 Tabbed Section</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {/* Section Navigation Tabs & Manager */}
      <div className="bg-white rounded-3 shadow-sm p-2 mb-3 border">
        <div className="d-flex align-items-center justify-content-between mb-2 px-2">
          <small className="text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
            <span>👆 Drag tabs or click section buttons to inspect and configure specific fields</span>
          </small>
          <Button
            variant="link"
            size="sm"
            className="p-0 text-success fw-semibold text-decoration-none d-flex align-items-center gap-1"
            onClick={() => setShowAddSectionModal(true)}
          >
            <Plus size={14} /> Add New Section
          </Button>
        </div>

        <div className="d-flex align-items-center gap-2 overflow-auto pb-1" style={{ whiteSpace: 'nowrap' }}>
          <Button
            variant={activeSectionId === 'all' ? 'primary' : 'light'}
            size="sm"
            className="rounded-pill px-3 py-1 fw-bold fs-7 d-flex align-items-center gap-1"
            onClick={() => setActiveSectionId('all')}
          >
            All Sections ({schemaData.sections.reduce((acc, s) => acc + s.fields.length, 0)})
          </Button>

          {schemaData.sections.map((sec, idx) => {
            const isActiveTab = activeSectionId === sec.id;
            const secName = sec.title_en || sec.name_en || `Section ${idx + 1}`;
            return (
              <Button
                key={sec.id}
                variant={isActiveTab ? 'primary' : 'outline-secondary'}
                size="sm"
                className={`rounded-pill px-3 py-1 fs-7 d-flex align-items-center gap-1 ${
                  isActiveTab ? 'fw-bold shadow-sm' : 'bg-light border-light-subtle text-dark'
                }`}
                onClick={() => setActiveSectionId(sec.id)}
              >
                {getSectionIcon(sec.icon || sec.section_key)}
                <span>
                  {idx + 1}. {secName} ({sec.fields.length})
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Split Workspace: Schema Builder (Left) & Live Preview (Right) */}
      <Row className="g-3">
        {/* Left Column: Schema Field Configuration Editor */}
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
                Showing <strong>{displayedSections.reduce((acc, s) => acc + s.fields.length, 0)}</strong> fields
              </div>
            </div>

            {/* Sections and Fields List */}
            <div className="d-flex flex-column gap-3" style={{ maxHeight: '780px', overflowY: 'auto', paddingRight: '4px' }}>
              {displayedSections.map((sec, secIdx) => {
                const secTitleEn = sec.title_en || sec.name_en;
                const secTitleBn = sec.title_bn || sec.name_bn;
                return (
                  <div key={sec.id} className="mb-2">
                    <div className="d-flex align-items-center justify-content-between mb-2 p-2 bg-light rounded-2 border">
                      <div className="d-flex align-items-center gap-2">
                        {getSectionIcon(sec.icon || sec.section_key)}
                        <span className="fw-bold text-primary fs-7">
                          {secTitleEn} / {secTitleBn}
                        </span>
                        <Badge bg="secondary">{sec.fields.length} Fields</Badge>
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="py-0 px-2 fs-8"
                          onClick={() => {
                            setNewFieldSectionId(sec.id);
                            setShowCustomQuestionModal(true);
                          }}
                        >
                          <Plus size={12} /> Add Field
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="p-1 border"
                          onClick={() => handleMoveSection(secIdx, 'up')}
                          disabled={secIdx === 0}
                          title="Move Section Up"
                        >
                          <ChevronUp size={13} />
                        </Button>
                        <Button
                          variant="light"
                          size="sm"
                          className="p-1 border"
                          onClick={() => handleMoveSection(secIdx, 'down')}
                          disabled={secIdx === schemaData.sections.length - 1}
                          title="Move Section Down"
                        >
                          <ChevronDown size={13} />
                        </Button>
                        {schemaData.sections.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1"
                            onClick={() => handleDeleteSection(sec.id)}
                            title="Delete Section"
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="d-flex flex-column gap-2">
                      {sec.fields.map((field, fieldIdx) => {
                        return (
                          <Card
                            key={field.id}
                            className={`border rounded-3 transition-all ${
                              field.visible ? 'bg-white shadow-xs' : 'opacity-60 bg-light-subtle'
                            }`}
                            style={{
                              borderLeft: field.required ? '4px solid #ef4444' : '4px solid #94a3b8',
                            }}
                          >
                            <Card.Body className="p-2">
                              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <Badge bg="light" text="dark" className="border font-monospace small px-2 py-1">
                                    {field.category || field.type.toUpperCase()}
                                  </Badge>
                                  <strong className="fs-7 text-dark">
                                    {field.label_en || field.field_key || field.key}
                                  </strong>
                                  <Badge bg="info" className="px-1.5 py-0.5 text-uppercase" style={{ fontSize: '9px' }}>
                                    {field.type}
                                  </Badge>
                                  {field.profile_sync && (
                                    <span
                                      className="badge bg-info-subtle text-info border small"
                                      style={{ fontSize: '10px' }}
                                    >
                                      Profile Sync: {field.profile_sync}
                                    </span>
                                  )}
                                </div>

                                <div className="d-flex align-items-center gap-1">
                                  <Button
                                    variant={field.required ? 'danger' : 'outline-secondary'}
                                    size="sm"
                                    className="py-0 px-2 fs-8 fw-bold rounded-2 d-flex align-items-center gap-1"
                                    onClick={() => handleToggleRequired(sec.id, field.id)}
                                  >
                                    {field.required ? '★ Required' : '☆ Optional'}
                                  </Button>
                                  <Button
                                    variant={field.visible ? 'success' : 'outline-secondary'}
                                    size="sm"
                                    className="py-0 px-2 fs-8 fw-bold rounded-2 d-flex align-items-center gap-1"
                                    onClick={() => handleToggleVisibility(sec.id, field.id)}
                                  >
                                    {field.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                    {field.visible ? 'Visible' : 'Hidden'}
                                  </Button>
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="p-1 border"
                                    onClick={() => handleMoveField(sec.id, fieldIdx, 'up')}
                                    disabled={fieldIdx === 0}
                                    title="Move Up"
                                  >
                                    <ChevronUp size={13} />
                                  </Button>
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="p-1 border"
                                    onClick={() => handleMoveField(sec.id, fieldIdx, 'down')}
                                    disabled={fieldIdx === sec.fields.length - 1}
                                    title="Move Down"
                                  >
                                    <ChevronDown size={13} />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="p-1"
                                    onClick={() => handleDeleteField(sec.id, field.id)}
                                    title="Delete Field"
                                  >
                                    <Trash2 size={13} />
                                  </Button>
                                </div>
                              </div>

                              <Row className="g-2">
                                {(editorLanguage === 'en' || editorLanguage === 'both') && (
                                  <Col md={editorLanguage === 'both' ? 6 : 12}>
                                    <Form.Control
                                      type="text"
                                      size="sm"
                                      value={field.label_en || ''}
                                      onChange={(e) => handleUpdateFieldLabel(sec.id, field.id, 'en', e.target.value)}
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
                                      value={field.label_bn || ''}
                                      onChange={(e) => handleUpdateFieldLabel(sec.id, field.id, 'bn', e.target.value)}
                                      placeholder="বাংলা লেবেল / নির্দেশনা"
                                      className="fs-8 text-primary"
                                    />
                                  </Col>
                                )}
                              </Row>
                            </Card.Body>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Col>

        {/* Right Column: Live Candidate View Preview */}
        <Col lg={5} xl={5}>
          <div className="bg-white rounded-3 shadow-sm p-3 border position-sticky" style={{ top: '15px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success rounded-circle p-1 d-inline-block" style={{ width: 8, height: 8 }} />
                <strong className="fs-7 text-dark">Live Candidate View Preview</strong>
              </div>
              <div className="d-flex align-items-center gap-2">
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

            {/* Simulated Live Form Container */}
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
              {/* Institution Header */}
              <div className="bg-white rounded-3 p-3 mb-3 border text-center shadow-xs">
                <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                  <img
                    src="/logo.png"
                    alt="Logo"
                    style={{ width: 32, height: 32, objectFit: 'contain' }}
                    onError={(e: any) => {
                      e.target.style.display = 'none';
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
                    📄 {postPaymentDoc}
                  </Badge>
                  <Badge bg="success" className="px-2 py-1 fs-8">
                    ● Live Preview
                  </Badge>
                </div>
              </div>

              {/* Progress Indicator */}
              {currentPreviewSection && (
                <div className="bg-white rounded-3 p-2 mb-3 border shadow-xs">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold fs-8 text-primary">
                      Step {activePreviewStep + 1} of {schemaData.sections.length}:{' '}
                      {previewLanguage === 'bn'
                        ? currentPreviewSection.title_bn || currentPreviewSection.name_bn
                        : currentPreviewSection.title_en || currentPreviewSection.name_en}
                    </span>
                    <span className="small text-muted fs-8">{previewProgress}% Completed</span>
                  </div>
                  <ProgressBar now={previewProgress} variant="primary" style={{ height: 6 }} className="rounded-pill mb-2" />
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
                        <span
                          className="badge rounded-circle bg-white text-dark p-0"
                          style={{ width: 14, height: 14, lineHeight: '14px' }}
                        >
                          {idx + 1}
                        </span>
                        <span>
                          {previewLanguage === 'bn'
                            ? (sec.title_bn || sec.name_bn || '').split('.')[1] || sec.title_bn || sec.name_bn
                            : (sec.title_en || sec.name_en || '').split('.')[1] || sec.title_en || sec.name_en}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Form Section Fields */}
              {currentPreviewSection && (
                <div className="bg-white rounded-3 p-3 border shadow-xs mb-3">
                  <h6 className="fw-bold text-dark border-bottom pb-2 mb-3 fs-7 d-flex align-items-center gap-1">
                    {getSectionIcon(currentPreviewSection.icon || currentPreviewSection.section_key)}
                    {previewLanguage === 'bn'
                      ? currentPreviewSection.title_bn || currentPreviewSection.name_bn
                      : currentPreviewSection.title_en || currentPreviewSection.name_en}
                  </h6>

                  <Row className="g-2.5">
                    {currentPreviewSection.fields
                      .filter((f) => f.visible)
                      .map((f) => {
                        const label = previewLanguage === 'bn' ? f.label_bn || f.label_en : f.label_en || f.label_bn;
                        const placeholder =
                          previewLanguage === 'bn'
                            ? f.placeholder_bn || f.placeholder_en || f.placeholder
                            : f.placeholder_en || f.placeholder_bn || f.placeholder;
                        const fieldKey = (f.key || f.field_key || f.id) as string;

                        return (
                          <Col key={f.id} xs={previewDevice === 'mobile' ? 12 : f.col_width || f.grid_col || 6}>
                            <Form.Group className="mb-2">
                              <Form.Label className="small fw-semibold text-dark mb-1 d-flex align-items-center justify-content-between">
                                <span>
                                  {label} {f.required && <span className="text-danger ms-1">*</span>}
                                </span>
                              </Form.Label>
                              {f.type === 'select' ? (
                                <Form.Select size="sm" className="bg-light">
                                  <option value="">-- {previewLanguage === 'bn' ? 'নির্বাচন করুন' : 'Select'} --</option>
                                  {f.options?.map((opt: any, idx: number) => (
                                    <option key={idx} value={typeof opt === 'string' ? opt : opt.value}>
                                      {typeof opt === 'string'
                                        ? opt
                                        : previewLanguage === 'bn'
                                        ? opt.label_bn || opt.label_en
                                        : opt.label_en}
                                    </option>
                                  ))}
                                </Form.Select>
                              ) : f.type === 'radio' ? (
                                <div className="d-flex flex-wrap gap-2 pt-1">
                                  {(f.options || []).map((opt: any, idx: number) => (
                                    <Form.Check
                                      key={idx}
                                      type="radio"
                                      name={fieldKey}
                                      id={`${fieldKey}_${idx}`}
                                      label={typeof opt === 'string' ? opt : previewLanguage === 'bn' ? opt.label_bn || opt.label_en : opt.label_en}
                                    />
                                  ))}
                                </div>
                              ) : f.type === 'checkbox' ? (
                                <div className="d-flex flex-wrap gap-2 pt-1">
                                  {(f.options || []).map((opt: any, idx: number) => (
                                    <Form.Check
                                      key={idx}
                                      type="checkbox"
                                      name={fieldKey}
                                      id={`${fieldKey}_${idx}`}
                                      label={typeof opt === 'string' ? opt : previewLanguage === 'bn' ? opt.label_bn || opt.label_en : opt.label_en}
                                    />
                                  ))}
                                </div>
                              ) : f.type === 'textarea' ? (
                                <Form.Control
                                  as="textarea"
                                  rows={2}
                                  size="sm"
                                  placeholder={placeholder || label}
                                  className="bg-light"
                                  value={previewValues[fieldKey] || ''}
                                  onChange={(e) => setPreviewValues({ ...previewValues, [fieldKey]: e.target.value })}
                                />
                              ) : f.type === 'file' ? (
                                <div className="p-2 border rounded bg-light text-center">
                                  <Paperclip size={16} className="text-muted mb-1" />
                                  <Form.Control type="file" size="sm" />
                                </div>
                              ) : (
                                <Form.Control
                                  type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : 'text'}
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
                  <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled={activePreviewStep === 0}
                      onClick={() => setActivePreviewStep((prev) => Math.max(0, prev - 1))}
                    >
                      <ChevronLeft size={14} /> {previewLanguage === 'bn' ? 'পূর্ববর্তী' : 'Previous'}
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5' }}
                      onClick={() => {
                        if (activePreviewStep < schemaData.sections.length - 1) {
                          setActivePreviewStep((prev) => prev + 1);
                        } else {
                          toast.success('🎉 লাইভ প্রিভিউ ফর্ম সফলভাবে সাবমিট হয়েছে!');
                        }
                      }}
                      className="d-flex align-items-center gap-1 fw-bold px-3"
                    >
                      <span>
                        {activePreviewStep < schemaData.sections.length - 1
                          ? previewLanguage === 'bn'
                            ? 'পরবর্তী ধাপ'
                            : 'Next Step'
                          : previewLanguage === 'bn'
                          ? 'আবেদন সাবমিট'
                          : 'Submit Application'}
                      </span>
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      {/* 1. Modal: Add New Section */}
      <Modal show={showAddSectionModal} onHide={() => setShowAddSectionModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <FolderPlus size={18} className="text-success" />
            Add New Section (নতুন সেকশন যুক্ত করুন)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Section Title (English)</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="e.g. Academic History & Transcript"
                value={newSectionNameEn}
                onChange={(e) => setNewSectionNameEn(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Section Title (বাংলা)</Form.Label>
              <Form.Control
                type="text"
                size="sm"
                placeholder="যেমন: পূর্ববর্তী শিক্ষাগত যোগ্যতা ও ফলাফল"
                value={newSectionNameBn}
                onChange={(e) => setNewSectionNameBn(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Section Icon (আইকন নির্বাচন করুন)</Form.Label>
              <Form.Select
                size="sm"
                value={newSectionIcon}
                onChange={(e) => setNewSectionIcon(e.target.value)}
              >
                <option value="FileText">📄 File / Document (FileText)</option>
                <option value="User">👤 User / Person (User)</option>
                <option value="Users">👥 Group / Parents (Users)</option>
                <option value="Shield">🛡️ Security / Legal (Shield)</option>
                <option value="MapPin">📍 Location / Address (MapPin)</option>
                <option value="Paperclip">📎 Attachment / Upload (Paperclip)</option>
                <option value="Briefcase">💼 Job / Work (Briefcase)</option>
                <option value="Layers">📑 Category / Layers</option>
                <option value="Sparkles">✨ Custom / Highlights</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={() => setShowAddSectionModal(false)}>
            বাতিল
          </Button>
          <Button variant="success" size="sm" className="fw-bold" onClick={handleAddSection}>
            সেকশন যুক্ত করুন
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 2. Modal: Add Custom Question / Field */}
      <Modal show={showCustomQuestionModal} onHide={() => setShowCustomQuestionModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <Plus size={18} className="text-primary" />
            Add Custom Question / Field (কাস্টম ফিল্ড তৈরি করুন)
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Target Section (সেকশন নির্বাচন করুন)</Form.Label>
                  <Form.Select
                    size="sm"
                    value={newFieldSectionId}
                    onChange={(e) => setNewFieldSectionId(e.target.value)}
                  >
                    {schemaData.sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title_en || sec.name_en} / {sec.title_bn || sec.name_bn}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Field Type (ইনপুট ধরন)</Form.Label>
                  <Form.Select
                    size="sm"
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value as any)}
                  >
                    <option value="text">Single Line Text (এক লাইনের টেক্সট)</option>
                    <option value="textarea">Multi-line Textarea (বড় প্যারাগ্রাফ)</option>
                    <option value="select">Dropdown Select (ড্রপডাউন অপশন)</option>
                    <option value="radio">Radio Buttons (একক নির্বাচন)</option>
                    <option value="checkbox">Checkboxes (বহুনির্বাচন)</option>
                    <option value="date">Date Picker (তারিখ)</option>
                    <option value="number">Numeric / Amount (সংখ্যা/টাকা)</option>
                    <option value="tel">Phone / Mobile No (মোবাইল নম্বর)</option>
                    <option value="email">Email Address (ইমেইল)</option>
                    <option value="file">Document / Image Upload (ফাইল আপলোড)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Label (English Title)</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="e.g. Previous Extracurricular Awards"
                    value={newFieldLabelEn}
                    onChange={(e) => setNewFieldLabelEn(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Label (বাংলা শিরোনাম)</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="যেমন: পূর্ববর্তী সহশিক্ষা কার্যক্রম ও পুরস্কার"
                    value={newFieldLabelBn}
                    onChange={(e) => setNewFieldLabelBn(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {['select', 'radio', 'checkbox'].includes(newFieldType) && (
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-primary">
                  Options (কমা দিয়ে অপশনগুলো লিখুন):
                </Form.Label>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="e.g. Option 1, Option 2, Option 3 (কমা দিয়ে আলাদা করুন)"
                  value={newFieldOptions}
                  onChange={(e) => setNewFieldOptions(e.target.value)}
                />
                <small className="text-muted" style={{ fontSize: '11px' }}>
                  প্রতিটি অপশন কমা (,) দিয়ে আলাদা করে লিখুন। যেমন: Yes, No, Other
                </small>
              </Form.Group>
            )}

            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Grid Column Width</Form.Label>
                  <Form.Select
                    size="sm"
                    value={newFieldCol}
                    onChange={(e) => setNewFieldCol(Number(e.target.value))}
                  >
                    <option value={6}>Half Width (6 Columns - পাশাপাশি)</option>
                    <option value={12}>Full Width (12 Columns - সম্পূর্ণ লাইন)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Field Identifier Key</Form.Label>
                  <Form.Control
                    type="text"
                    size="sm"
                    placeholder="custom_field_key (Optional)"
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-2 mb-2 p-2 bg-light rounded-2 border">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="custom-req-switch"
                  label="Required (বাধ্যতামূলক ফিল্ড)"
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
          <Button variant="primary" size="sm" className="fw-bold" onClick={handleAddCustomField}>
            কাস্টম ফিল্ড যুক্ত করুন
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 3. Modal: Google Forms-Style Shareable Public Link & QR Code */}
      <Modal show={showPublicLinkModal} onHide={() => setShowPublicLinkModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
            <Share2 size={18} />
            Google Forms এর মতো পাবলিক শেয়ার লিংক ও QR Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex p-3 rounded-circle bg-primary-subtle text-primary mb-2 shadow-xs"
              style={{ width: 64, height: 64, alignItems: 'center', justifyContent: 'center' }}
            >
              <CheckCircle2 size={36} />
            </div>
            <h5 className="fw-bold text-dark mb-1">ফর্মটি পাবলিক আবেদনের জন্য সম্পূর্ণ প্রস্তুত!</h5>
            <p className="text-muted small mb-0">
              নিচের লিংকটি কপি করে সামাজিক মাধ্যম, ওয়েবসাইট বা নোটিশে শেয়ার করুন। যে কেউ কোনো লগইন ছাড়াই আবেদন করতে পারবে।
            </p>
          </div>

          <Card className="border p-3 bg-light mb-4 rounded-3">
            <Form.Label className="small fw-bold text-uppercase text-muted mb-1">
              পাবলিক শেয়ারেবল লিংক (Public Sharable Link):
            </Form.Label>
            <div className="input-group mb-2">
              <span className="input-group-text bg-white text-muted">
                <LinkIcon size={16} />
              </span>
              <Form.Control type="text" readOnly value={publicShareUrl} className="fw-bold bg-white text-primary" />
              <Button
                variant="primary"
                onClick={() => {
                  navigator.clipboard.writeText(publicShareUrl);
                  toast.success('📋 লিংকটি সফলভাবে ক্লিপবোর্ডে কপি করা হয়েছে!');
                }}
                className="d-flex align-items-center gap-1.5 px-3"
              >
                <Copy size={16} />
                <span>Copy Link</span>
              </Button>
            </div>

            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2 pt-2 border-top">
              <div className="d-flex align-items-center gap-2">
                <Form.Check
                  type="switch"
                  id="accepting-responses-toggle"
                  label={
                    <span className="small fw-bold">
                      {isActive ? '🟢 রেসপন্স গ্রহণ চালু আছে (Accepting Responses)' : '🔴 রেসপন্স গ্রহণ বন্ধ'}
                    </span>
                  }
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => window.open(publicShareUrl, '_blank')}
                  className="d-flex align-items-center gap-1"
                >
                  <ExternalLink size={14} /> Open Live Form
                </Button>
              </div>
            </div>
          </Card>

          {/* QR Code Preview & Direct Share */}
          <Row className="g-3 align-items-center">
            <Col md={5} className="text-center border-end">
              <div className="p-2 border rounded-3 d-inline-block bg-white shadow-xs mb-2">
                <img src={qrCodeUrl} alt="QR Code" style={{ width: 140, height: 140 }} />
              </div>
              <div className="small fw-bold text-dark d-flex align-items-center justify-content-center gap-1">
                <QrCode size={14} className="text-primary" />
                <span>স্ক্যান করে সরাসরি ফর্ম ওপেন করুন</span>
              </div>
            </Col>
            <Col md={7}>
              <h6 className="fw-bold text-dark mb-2">সোশ্যাল ও মেসেঞ্জারে সরাসরি শেয়ার করুন:</h6>
              <div className="d-flex flex-column gap-2">
                <Button
                  variant="outline-success"
                  size="sm"
                  className="d-flex align-items-center justify-content-start gap-2 py-2"
                  onClick={() =>
                    window.open(
                      `https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `${templateTitle} - অনলাইন আবেদন লিংক: ${publicShareUrl}`
                      )}`,
                      '_blank'
                    )
                  }
                >
                  <span>💬 WhatsApp এ শেয়ার করুন</span>
                </Button>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center justify-content-start gap-2 py-2"
                  onClick={() =>
                    window.open(
                      `mailto:?subject=${encodeURIComponent(templateTitle)}&body=${encodeURIComponent(
                        `অনলাইন আবেদন করতে নিচের লিংকে ক্লিক করুন:\n${publicShareUrl}`
                      )}`,
                      '_blank'
                    )
                  }
                >
                  <span>✉️ Email এর মাধ্যমে পাঠান</span>
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="d-flex align-items-center justify-content-start gap-2 py-2"
                  onClick={() => {
                    const trackUrl = `${window.location.origin}/track`;
                    navigator.clipboard.writeText(trackUrl);
                    toast.success('📋 ট্র্যাকিং পোর্টাল লিংক কপি করা হয়েছে!');
                  }}
                >
                  <span>🔍 ট্র্যাকিং পোর্টাল লিংক কপি করুন (/track)</span>
                </Button>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPublicLinkModal(false)}>
            বন্ধ করুন
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.open(publicShareUrl, '_blank');
              setShowPublicLinkModal(false);
            }}
          >
            ফর্মটি ওপেন করুন
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 4. Modal: Responses & Submissions Viewer */}
      <Modal show={showSubmissionsModal} onHide={() => setShowSubmissionsModal(false)} size="xl" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <Users size={18} className="text-primary" />
            <span>
              ফর্ম রেসপন্স ও আবেদনকারীদের তালিকা — {templateTitle} ({submissionsList.length})
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div className="d-flex align-items-center gap-2">
              <div className="input-group input-group-sm" style={{ width: '280px' }}>
                <span className="input-group-text bg-white text-muted">
                  <Search size={14} />
                </span>
                <Form.Control
                  placeholder="নাম বা ট্র্যাকিং নম্বর দিয়ে খুঁজুন..."
                  value={submissionSearch}
                  onChange={(e) => setSubmissionSearch(e.target.value)}
                />
              </div>

              <Form.Select
                size="sm"
                value={submissionStatusFilter}
                onChange={(e) => setSubmissionStatusFilter(e.target.value)}
                style={{ width: '160px' }}
              >
                <option value="all">সকল স্ট্যাটাস</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-success"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={handleExportCSV}
              >
                <Download size={14} /> Export CSV
              </Button>
            </div>
          </div>

          {loadingSubmissions ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <div className="mt-2 text-muted small">রেসপন্স ডাটা লোড হচ্ছে...</div>
            </div>
          ) : submissionsList.length === 0 ? (
            <Alert variant="info" className="text-center py-4 mb-0">
              এখনও পর্যন্ত এই ফর্মে কোনো আবেদন জমা পড়েনি। পাবলিক লিংক শেয়ার করুন!
            </Alert>
          ) : (
            <div className="table-responsive border rounded-3">
              <Table hover className="align-middle mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th>Tracking ID</th>
                    <th>Applicant Name</th>
                    <th>Mobile No</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissionsList
                    .filter((s) => {
                      const matchesSearch =
                        !submissionSearch ||
                        s.applicant_name?.toLowerCase().includes(submissionSearch.toLowerCase()) ||
                        s.tracking_number?.toLowerCase().includes(submissionSearch.toLowerCase());
                      const matchesStatus =
                        submissionStatusFilter === 'all' || s.status === submissionStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map((s) => (
                      <tr key={s.id}>
                        <td>
                          <span className="font-monospace fw-bold text-primary">{s.tracking_number}</span>
                        </td>
                        <td className="fw-semibold text-dark">{s.applicant_name}</td>
                        <td>{s.applicant_phone || 'N/A'}</td>
                        <td className="text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                        <td>
                          <Badge
                            bg={
                              s.status === 'approved'
                                ? 'success'
                                : s.status === 'rejected'
                                ? 'danger'
                                : s.status === 'shortlisted'
                                ? 'info'
                                : 'warning'
                            }
                            text={s.status === 'pending' ? 'dark' : 'white'}
                            className="px-2 py-1 text-uppercase"
                          >
                            {s.status}
                          </Badge>
                        </td>
                        <td className="text-end">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="py-0 px-2 me-1 fs-8"
                            onClick={() => setSelectedSubmissionDetail(s)}
                          >
                            View Details
                          </Button>
                          <Dropdown className="d-inline-block">
                            <Dropdown.Toggle variant="light" size="sm" className="py-0 px-1 border" />
                            <Dropdown.Menu align="end">
                              <Dropdown.Item onClick={() => handleUpdateSubmissionStatus(s.id, 'reviewed')}>
                                Mark as Reviewed
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleUpdateSubmissionStatus(s.id, 'shortlisted')}>
                                Mark as Shortlisted
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleUpdateSubmissionStatus(s.id, 'approved')}>
                                Approve Application
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleUpdateSubmissionStatus(s.id, 'rejected')} className="text-danger">
                                Reject Application
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </div>
          )}

          {/* Submission Details Modal / Drawer */}
          {selectedSubmissionDetail && (
            <Modal show={true} onHide={() => setSelectedSubmissionDetail(null)} size="lg" centered>
              <Modal.Header closeButton className="bg-light">
                <Modal.Title className="fs-6 fw-bold">
                  Application Details — {selectedSubmissionDetail.tracking_number}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded-2 border">
                  <div>
                    <h6 className="fw-bold mb-0">{selectedSubmissionDetail.applicant_name}</h6>
                    <small className="text-muted">
                      Phone: {selectedSubmissionDetail.applicant_phone || 'N/A'} | Email:{' '}
                      {selectedSubmissionDetail.applicant_email || 'N/A'}
                    </small>
                  </div>
                  <Badge bg="primary" className="px-2 py-1 fs-7 text-uppercase">
                    Status: {selectedSubmissionDetail.status}
                  </Badge>
                </div>

                <h6 className="fw-bold small text-muted text-uppercase mb-2">Submitted Field Data:</h6>
                <div className="table-responsive border rounded-2 mb-3">
                  <Table size="sm" bordered hover className="mb-0 small">
                    <tbody>
                      {Object.entries(selectedSubmissionDetail.data || {}).map(([key, val]) => (
                        <tr key={key}>
                          <td className="fw-bold bg-light text-secondary text-capitalize" style={{ width: '40%' }}>
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td className="text-dark">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>

                {selectedSubmissionDetail.attachments && (
                  <>
                    <h6 className="fw-bold small text-muted text-uppercase mb-2">Uploaded Attachments:</h6>
                    <div className="d-flex flex-column gap-1 mb-3">
                      {Object.entries(selectedSubmissionDetail.attachments).map(([fieldKey, att]: any) => (
                        <div
                          key={fieldKey}
                          className="p-2 border rounded-2 bg-light d-flex justify-content-between align-items-center"
                        >
                          <div className="d-flex align-items-center gap-2">
                            <Paperclip size={14} className="text-primary" />
                            <span className="small fw-semibold">{att.original_name}</span>
                          </div>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="py-0 px-2 fs-8"
                            onClick={() => window.open(att.file_url, '_blank')}
                          >
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" size="sm" onClick={() => setSelectedSubmissionDetail(null)}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSubmissionsModal(false)}>
            বন্ধ করুন
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 5. Modal: Link Circulars */}
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

      {/* 6. Modal: Create New Form Template */}
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