import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, ProgressBar, Alert, Badge, Spinner } from 'react-bootstrap';
import { 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Printer, 
  Check, 
  Sparkles,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { formSubmissionsApi, type PublicFormSchemaData } from '../../api/formSubmissions';
import { toast } from 'react-toastify';

export const PublicFormView: React.FC = () => {
  const { slug, type } = useParams<{ slug?: string; type?: string }>();
  const [searchParams] = useSearchParams();
  const formIdentifier = slug || type || searchParams.get('form') || 'admission';

  const [schemaData, setSchemaData] = useState<PublicFormSchemaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');

  // Multi-step Wizard state
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileData, setFileData] = useState<Record<string, File>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Post-submission confirmation state
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    id: number;
    tracking_number: string;
    applicant_name: string;
    applicant_email: string | null;
    applicant_phone: string | null;
    form_title: string;
    form_type: string;
    status: string;
    submitted_at: string;
    post_payment_action: string;
    tracking_url: string;
  } | null>(null);

  useEffect(() => {
    loadFormSchema();
  }, [formIdentifier]);

  const loadFormSchema = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await formSubmissionsApi.getPublicForm(formIdentifier);
      if (res.data) {
        setSchemaData(res.data);
      } else {
        setError('আবেদন ফরমটি পাওয়া যায়নি।');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'ফরমটি লোড করা সম্ভব হয়নি বা বর্তমানে বন্ধ রয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const sections = schemaData?.schema_data?.sections || [];
  const currentSection = sections[currentStepIndex] || null;
  const isLastStep = currentStepIndex === sections.length - 1;

  // Handle standard input change
  const handleInputChange = (fieldKey: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldKey]: value }));
    if (validationErrors[fieldKey]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  // Handle file input change
  const handleFileChange = (fieldKey: string, file: File | null) => {
    if (!file) return;

    setFileData((prev) => ({ ...prev, [fieldKey]: file }));
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreviews((prev) => ({ ...prev, [fieldKey]: previewUrl }));
    }

    if (validationErrors[fieldKey]) {
      setValidationErrors((prev) => {
        const copy = { ...prev };
        delete copy[fieldKey];
        return copy;
      });
    }
  };

  // Validate fields in a given section
  const validateSection = (sec: any): boolean => {
    const errors: Record<string, string> = {};
    if (!sec || !sec.fields) return true;

    for (const field of sec.fields) {
      if (field.visible === false) continue;

      const val = formData[field.key];
      const hasFile = !!fileData[field.key];

      if (field.required) {
        if (field.type === 'file') {
          if (!hasFile && !val) {
            errors[field.key] = language === 'bn' ? `${field.label_bn || field.label_en} আপলোড করা আবশ্যক` : `${field.label_en || field.label_bn} is required`;
          }
        } else {
          if (val === undefined || val === null || String(val).trim() === '') {
            errors[field.key] = language === 'bn' ? `${field.label_bn || field.label_en} পূরণ করা আবশ্যক` : `${field.label_en || field.label_bn} is required`;
          }
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (!currentSection) return;

    if (validateSection(currentSection)) {
      if (currentStepIndex < sections.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        window.scrollTo({ top: 120, behavior: 'smooth' });
      }
    } else {
      toast.warning(language === 'bn' ? 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন।' : 'Please fill all required fields.');
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  const handleSubmitApplication = async () => {
    // Validate current (or all) sections
    if (!validateSection(currentSection)) {
      toast.warning(language === 'bn' ? 'অনুগ্রহ করে সকল আবশ্যকীয় তথ্য পূরণ করুন।' : 'Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const submissionPayload = new FormData();
      submissionPayload.append('data', JSON.stringify(formData));

      // Append attached files
      Object.entries(fileData).forEach(([fieldKey, file]) => {
        submissionPayload.append(fieldKey, file);
      });

      const res = await formSubmissionsApi.submitPublicForm(schemaData?.slug || formIdentifier, submissionPayload);
      if (res.data) {
        setSubmittedReceipt(res.data);
        toast.success(language === 'bn' ? 'আপনার আবেদন সফলভাবে গৃহীত হয়েছে!' : 'Application submitted successfully!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'আবেদন জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
          <h5 className="mt-3 text-dark fw-bold">আবেদন ফরম লোড হচ্ছে...</h5>
          <p className="text-muted small">Loading application form, please wait...</p>
        </div>
      </div>
    );
  }

  if (error || !schemaData) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light py-5">
        <Container style={{ maxWidth: '600px' }}>
          <Card className="border-0 shadow-lg text-center p-4 rounded-4">
            <AlertCircle size={48} className="text-danger mx-auto mb-3" />
            <h4 className="fw-bold text-dark mb-2">আবেদন ফরমটি পাওয়া যায়নি</h4>
            <p className="text-muted mb-4">{error || 'এই ফরমটির আবেদন গ্রহণ সাময়িকভাবে স্থগিত রয়েছে বা লিংকটি সঠিক নয়।'}</p>
            <div className="d-flex justify-content-center gap-2">
              <Link to="/login" className="btn btn-outline-primary px-4">হোমপেইজে যান</Link>
              <Button variant="primary" onClick={loadFormSchema} className="px-4">পুনরায় চেষ্টা করুন</Button>
            </div>
          </Card>
        </Container>
      </div>
    );
  }

  // ==========================================
  // VIEW: APPLICATION SUBMITTED CONFIRMATION SLIP
  // ==========================================
  if (submittedReceipt) {
    return (
      <div className="min-vh-100 bg-light py-4 py-md-5">
        <Container style={{ maxWidth: '850px' }}>
          {/* Action Header (Hidden in Print) */}
          <div className="d-flex align-items-center justify-content-between mb-4 d-print-none">
            <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5">
              <ArrowLeft size={16} /> হোমপেইজ
            </Link>
            <div className="d-flex gap-2">
              <Button variant="primary" className="d-flex align-items-center gap-1.5 shadow-sm" onClick={() => window.print()}>
                <Printer size={16} /> প্রবেশপত্র / আবেদন কপি প্রিন্ট করুন (Print Slip)
              </Button>
            </div>
          </div>

          {/* Printable Official Application Slip Card */}
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden print-card">
            {/* Top Brand Stripe */}
            <div className="bg-primary text-white p-4 text-center position-relative">
              <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
                <img src="/logo.png" alt="BSISC Logo" style={{ width: 65, height: 65, objectFit: 'contain' }} className="bg-white rounded p-1 shadow-sm" />
                <div className="text-start">
                  <h4 className="fw-bold mb-0">Baridhara Scholars' International School and College</h4>
                  <div className="small text-white-50">EIIN: 133988 | School Code: 1242 | College Code: 1760</div>
                  <div className="small text-warning fw-semibold">ডিজিটাল অনলাইন আবেদন রশিদ ও ভর্তি প্রবেশপত্র (Official Application Slip)</div>
                </div>
              </div>
            </div>

            <Card.Body className="p-4 p-md-5">
              {/* Success Badge */}
              <div className="text-center mb-4">
                <div className="d-inline-flex p-3 bg-success bg-opacity-10 text-success rounded-circle mb-2">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="fw-bold text-success mb-1">আবেদন সফলভাবে গৃহীত হয়েছে!</h4>
                <div className="text-muted small">Application Reference Slip & Tracking Card</div>
              </div>

              {/* Reference Tracking Box */}
              <div className="bg-light p-3 rounded-3 border border-primary border-opacity-25 mb-4 text-center">
                <span className="text-muted small text-uppercase d-block fw-semibold mb-1">Application Tracking ID / আবেদন ট্র্যাকিং নম্বর</span>
                <span className="fs-3 fw-bold font-monospace text-primary text-tracking letter-spacing-1">
                  {submittedReceipt.tracking_number}
                </span>
                <div className="mt-2 text-muted small">
                  ভবিষ্যতে যেকোনো অনুসন্ধান ও পরীক্ষার জন্য এই ট্র্যাকিং নম্বরটি সংরক্ষণ করুন।
                </div>
              </div>

              {/* Candidate Info Grid */}
              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="p-3 border rounded-3 h-100 bg-white shadow-xs">
                    <div className="text-muted small mb-1">আবেদনকারীর নাম (Applicant Name):</div>
                    <div className="fw-bold fs-6 text-dark">{submittedReceipt.applicant_name}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border rounded-3 h-100 bg-white shadow-xs">
                    <div className="text-muted small mb-1">আবেদনকৃত ফরম (Form Title):</div>
                    <div className="fw-bold fs-6 text-primary">{submittedReceipt.form_title}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border rounded-3 h-100 bg-white shadow-xs">
                    <div className="text-muted small mb-1">যোগাযোগের মোবাইল নম্বর (Phone):</div>
                    <div className="fw-bold text-dark font-monospace">{submittedReceipt.applicant_phone || 'N/A'}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border rounded-3 h-100 bg-white shadow-xs">
                    <div className="text-muted small mb-1">আবেদনের সময় (Submission Time):</div>
                    <div className="fw-bold text-dark">{new Date(submittedReceipt.submitted_at).toLocaleString('bn-BD')}</div>
                  </div>
                </Col>
              </Row>

              {/* Notice & Instructions */}
              <Alert variant="info" className="d-flex gap-3 align-items-center mb-4">
                <Sparkles size={24} className="flex-shrink-0 text-info" />
                <div className="small">
                  <strong>জরুরি নির্দেশিকা:</strong> আপনার আবেদনটি প্রাতিষ্ঠানিক স্ক্রিনিং কমিটিতে জমা হয়েছে। কর্তৃপক্ষ কর্তৃক আবেদন যাছাইয়ের পর পরীক্ষার সময়সূচি ও পরবর্তী নির্দেশনা এসএমএস বা ফোন নম্বরে জানিয়ে দেওয়া হবে।
                </div>
              </Alert>

              {/* Signature Blocks for Print */}
              <div className="mt-5 pt-4 border-top d-flex justify-content-between text-center">
                <div>
                  <div className="border-bottom border-dark border-1 mb-1 mx-auto" style={{ width: '160px', height: '40px' }} />
                  <span className="small text-muted">অভিভাবক / প্রার্থীর স্বাক্ষর</span>
                </div>
                <div>
                  <div className="border-bottom border-dark border-1 mb-1 mx-auto" style={{ width: '160px', height: '40px' }} />
                  <span className="small text-muted">অনুমোদনকারী কর্মকর্তার স্বাক্ষর</span>
                </div>
              </div>
            </Card.Body>

            <Card.Footer className="bg-light text-center py-3 text-muted small d-print-none">
              <Button variant="link" className="text-decoration-none text-muted" onClick={() => window.location.reload()}>
                নতুন আরেকটি আবেদন করুন (Submit Another Form)
              </Button>
            </Card.Footer>
          </Card>
        </Container>
      </div>
    );
  }

  // ==========================================
  // VIEW: DYNAMIC PUBLIC APPLICATION FORM
  // ==========================================
  const progressPercent = sections.length > 0 ? Math.round(((currentStepIndex + 1) / sections.length) * 100) : 100;

  return (
    <div className="min-vh-100 bg-light py-4 py-md-5">
      <Container style={{ maxWidth: '920px' }}>
        {/* Institutional Public Header */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden institutional-header">
          <div className="bg-primary text-white p-3 p-md-4">
            <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
              <div className="d-flex align-items-center gap-3 text-center text-md-start">
                <img src="/logo.png" alt="BSISC Logo" style={{ width: 55, height: 55, objectFit: 'contain' }} className="bg-white rounded p-1 shadow-sm flex-shrink-0" />
                <div>
                  <h5 className="fw-bold mb-0">Baridhara Scholars' International School and College</h5>
                  <div className="small text-white-50">EIIN: 133988 | School: 1242 | College: 1760</div>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="btn-group btn-group-sm shadow-xs" role="group">
                <Button 
                  variant={language === 'bn' ? 'warning' : 'outline-light'} 
                  onClick={() => setLanguage('bn')}
                  className="fw-bold px-2.5"
                >
                  বাংলা
                </Button>
                <Button 
                  variant={language === 'en' ? 'warning' : 'outline-light'} 
                  onClick={() => setLanguage('en')}
                  className="fw-bold px-2.5"
                >
                  English
                </Button>
              </div>
            </div>
          </div>

          {/* Form Banner Info */}
          <Card.Body className="bg-white p-3 p-md-4 border-bottom">
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <div>
                <h4 className="fw-bold text-dark mb-1">{schemaData.title}</h4>
                <div className="text-muted small">
                  {schemaData.description || 'অনলাইন ফরমটি সতর্কতার সাথে পূরণ করুন। সকল তথ্য সঠিক হওয়া বাধ্যতামূলক।'}
                </div>
              </div>
              <Badge bg="success" className="px-3 py-2 font-monospace fs-7 d-flex align-items-center gap-1.5 shadow-xs">
                <span className="spinner-grow spinner-grow-sm" style={{ width: '6px', height: '6px' }} />
                অনলাইন আবেদন চালু (Live)
              </Badge>
            </div>

            {/* Instructions Alert if any */}
            {schemaData.instructions && (
              <Alert variant="secondary" className="mt-3 mb-0 small py-2 d-flex align-items-center gap-2">
                <HelpCircle size={16} className="text-primary flex-shrink-0" />
                <div>{schemaData.instructions}</div>
              </Alert>
            )}
          </Card.Body>

          {/* Step Progress Navigation Bar */}
          {sections.length > 1 && (
            <div className="bg-light px-3 py-2 border-bottom">
              <div className="d-flex justify-content-between align-items-center small text-muted mb-1.5 fw-semibold">
                <span>
                  {language === 'bn' ? `ধাপ ${currentStepIndex + 1} / ${sections.length}: ` : `Step ${currentStepIndex + 1} of ${sections.length}: `}
                  <strong className="text-primary">{language === 'bn' ? currentSection?.title_bn || currentSection?.title_en : currentSection?.title_en || currentSection?.title_bn}</strong>
                </span>
                <span>{progressPercent}% Complete</span>
              </div>
              <ProgressBar now={progressPercent} variant="primary" style={{ height: '6px' }} />

              {/* Section Pills */}
              <div className="d-flex gap-1.5 mt-2 overflow-auto py-1 no-scrollbar">
                {sections.map((sec: any, idx: number) => {
                  const isActive = idx === currentStepIndex;
                  const isDone = idx < currentStepIndex;
                  const title = language === 'bn' ? sec.title_bn || sec.title_en : sec.title_en || sec.title_bn;

                  return (
                    <button
                      key={sec.id || idx}
                      type="button"
                      onClick={() => {
                        if (idx < currentStepIndex || validateSection(currentSection)) {
                          setCurrentStepIndex(idx);
                        }
                      }}
                      className={`btn btn-sm text-nowrap rounded-pill py-1 px-2.5 font-sans ${
                        isActive ? 'btn-primary fw-bold shadow-xs' : isDone ? 'btn-outline-success bg-success bg-opacity-10 text-success' : 'btn-outline-secondary opacity-75'
                      }`}
                      style={{ fontSize: '12px' }}
                    >
                      {isDone && <Check size={12} className="me-1 d-inline" />}
                      {idx + 1}. {title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Dynamic Section Fields Form */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Header className="bg-white p-3 p-md-4 border-bottom">
            <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <span className="badge bg-primary rounded-circle" style={{ width: '26px', height: '26px', lineHeight: '18px' }}>
                {currentStepIndex + 1}
              </span>
              {language === 'bn' ? currentSection?.title_bn || currentSection?.title_en : currentSection?.title_en || currentSection?.title_bn}
            </h5>
          </Card.Header>

          <Card.Body className="p-3 p-md-4">
            <Form onSubmit={(e) => e.preventDefault()}>
              <Row className="g-3">
                {currentSection?.fields?.filter((f: any) => f.visible !== false).map((field: any) => {
                  const fieldLabel = language === 'bn' ? field.label_bn || field.label_en : field.label_en || field.label_bn;
                  const fieldHelp = language === 'bn' ? field.placeholder_bn || field.placeholder_en : field.placeholder_en || field.placeholder_bn;
                  const isFieldRequired = field.required;
                  const fieldError = validationErrors[field.key];
                  const fieldValue = formData[field.key] || '';

                  // Dynamic Layout Width (12 columns default or 6 for standard)
                  const colWidth = ['textarea', 'address', 'full_address'].includes(field.type) ? 12 : (field.col_width || 6);

                  return (
                    <Col key={field.key} md={colWidth}>
                      <Form.Group className="mb-2">
                        <Form.Label className="fw-semibold small text-dark d-flex align-items-center justify-content-between mb-1">
                          <span>
                            {fieldLabel} {isFieldRequired && <span className="text-danger">*</span>}
                          </span>
                          {field.category_tag && (
                            <span className="badge bg-light text-muted font-monospace" style={{ fontSize: '9px' }}>
                              {field.category_tag}
                            </span>
                          )}
                        </Form.Label>

                        {/* RENDER FIELD TYPE: SELECT / DROPDOWN */}
                        {field.type === 'select' && (
                          <Form.Select
                            value={fieldValue}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            isInvalid={!!fieldError}
                            className="shadow-none py-2"
                          >
                            <option value="">{language === 'bn' ? '-- নির্বাচন করুন --' : '-- Select Option --'}</option>
                            {field.options?.map((opt: any, optIdx: number) => {
                              const optVal = typeof opt === 'string' ? opt : opt.value;
                              const optLabel = typeof opt === 'string' ? opt : (language === 'bn' ? opt.label_bn || opt.label_en : opt.label_en || opt.label_bn);
                              return (
                                <option key={optIdx} value={optVal}>
                                  {optLabel}
                                </option>
                              );
                            })}
                          </Form.Select>
                        )}

                        {/* RENDER FIELD TYPE: RADIO OPTIONS */}
                        {field.type === 'radio' && (
                          <div className="d-flex flex-wrap gap-2 pt-1">
                            {field.options?.map((opt: any, optIdx: number) => {
                              const optVal = typeof opt === 'string' ? opt : opt.value;
                              const optLabel = typeof opt === 'string' ? opt : (language === 'bn' ? opt.label_bn || opt.label_en : opt.label_en || opt.label_bn);
                              const isChecked = fieldValue === optVal;

                              return (
                                <Form.Check
                                  key={optIdx}
                                  type="radio"
                                  id={`${field.key}-${optIdx}`}
                                  name={field.key}
                                  label={optLabel}
                                  checked={isChecked}
                                  onChange={() => handleInputChange(field.key, optVal)}
                                  className={`p-2 border rounded-3 px-3 shadow-xs ${isChecked ? 'bg-primary bg-opacity-10 border-primary text-primary fw-bold' : 'bg-light'}`}
                                />
                              );
                            })}
                          </div>
                        )}

                        {/* RENDER FIELD TYPE: TEXTAREA */}
                        {field.type === 'textarea' && (
                          <Form.Control
                            as="textarea"
                            rows={3}
                            placeholder={fieldHelp || (language === 'bn' ? 'এখানে বিস্তারিত লিখুন...' : 'Enter details here...')}
                            value={fieldValue}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            isInvalid={!!fieldError}
                            className="shadow-none"
                          />
                        )}

                        {/* RENDER FIELD TYPE: DATE */}
                        {field.type === 'date' && (
                          <Form.Control
                            type="date"
                            value={fieldValue}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            isInvalid={!!fieldError}
                            className="shadow-none py-2"
                          />
                        )}

                        {/* RENDER FIELD TYPE: FILE UPLOAD */}
                        {field.type === 'file' && (
                          <div className="p-3 border rounded-3 bg-light text-center">
                            {filePreviews[field.key] ? (
                              <div className="mb-2">
                                <img
                                  src={filePreviews[field.key]}
                                  alt="Preview"
                                  style={{ width: 90, height: 90, objectFit: 'cover' }}
                                  className="rounded border shadow-sm mx-auto mb-2 d-block"
                                />
                                <span className="small text-success fw-bold d-block">
                                  <CheckCircle2 size={14} className="d-inline me-1" />
                                  {fileData[field.key]?.name}
                                </span>
                              </div>
                            ) : (
                              <Upload size={24} className="text-muted mb-1" />
                            )}
                            <Form.Control
                              type="file"
                              size="sm"
                              onChange={(e: any) => handleFileChange(field.key, e.target.files?.[0] || null)}
                              isInvalid={!!fieldError}
                              className="mx-auto"
                              style={{ maxWidth: '300px' }}
                            />
                            <div className="text-muted extra-small mt-1" style={{ fontSize: '11px' }}>
                              {fieldHelp || 'ছবি অথবা পিডিএফ ফাইল (সর্বোচ্চ ৫ মেগাবাইট)'}
                            </div>
                          </div>
                        )}

                        {/* RENDER FIELD TYPE: STANDARD TEXT / NUMBER / TEL / EMAIL */}
                        {!['select', 'radio', 'textarea', 'date', 'file'].includes(field.type) && (
                          <Form.Control
                            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : 'text'}
                            placeholder={fieldHelp || fieldLabel}
                            value={fieldValue}
                            onChange={(e) => handleInputChange(field.key, e.target.value)}
                            isInvalid={!!fieldError}
                            className="shadow-none py-2"
                          />
                        )}

                        {/* Error message */}
                        {fieldError && (
                          <Form.Control.Feedback type="invalid" className="d-block small">
                            {fieldError}
                          </Form.Control.Feedback>
                        )}
                      </Form.Group>
                    </Col>
                  );
                })}
              </Row>
            </Form>
          </Card.Body>

          {/* Navigation Controls Footer */}
          <Card.Footer className="bg-light p-3 p-md-4 border-top d-flex justify-content-between align-items-center">
            {currentStepIndex > 0 ? (
              <Button variant="outline-secondary" onClick={handlePrevStep} className="d-flex align-items-center gap-1.5 px-3 py-2">
                <ArrowLeft size={16} /> {language === 'bn' ? 'পূর্ববর্তী ধাপ' : 'Previous Step'}
              </Button>
            ) : (
              <div />
            )}

            {!isLastStep ? (
              <Button variant="primary" onClick={handleNextStep} className="d-flex align-items-center gap-1.5 px-4 py-2 fw-bold shadow-sm">
                {language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'} <ArrowRight size={16} />
              </Button>
            ) : (
              <Button 
                variant="success" 
                onClick={handleSubmitApplication} 
                disabled={submitting}
                className="d-flex align-items-center gap-2 px-4 py-2 fw-bold shadow-sm"
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" animation="border" /> {language === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Check size={18} /> {language === 'bn' ? 'আবেদন জমা দিন (Submit Application)' : 'Submit Application'}
                  </>
                )}
              </Button>
            )}
          </Card.Footer>
        </Card>

        {/* Footer info */}
        <div className="text-center text-muted small py-2">
          &copy; 2026 Baridhara Scholars' International School and College. All Rights Reserved.
        </div>
      </Container>
    </div>
  );
};