import React, { useState, useMemo } from 'react';
import { Modal, Button, Form, Table, Badge, Row, Col, Card } from 'react-bootstrap';
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Search, 
  CheckSquare, 
  Square, 
  Phone, 
  Sparkles,
  Info
} from 'lucide-react';
import { 
  REMINDER_TEMPLATES, 
  renderReminderMessage, 
  openWhatsAppChat, 
  formatWhatsAppPhone,
  type ReminderTeacher, 
  type ReminderBatchInfo 
} from '../../utils/whatsappReminder';
import { toast } from 'react-toastify';

interface Props {
  show: boolean;
  onHide: () => void;
  batch: ReminderBatchInfo;
  missingTeachers: ReminderTeacher[];
}

export const WhatsAppReminderModal: React.FC<Props> = ({
  show,
  onHide,
  batch,
  missingTeachers,
}) => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('bangla_standard');
  const [customText, setCustomText] = useState<string>(() => {
    return REMINDER_TEMPLATES[0].text;
  });
  const [search, setSearch] = useState<string>('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Set<number>>(new Set());
  const [previewTeacherId, setPreviewTeacherId] = useState<number | null>(null);

  // Initialize selected teachers when modal opens or missingTeachers changes
  React.useEffect(() => {
    if (show) {
      const allIds = new Set(
        missingTeachers
          .map((t) => t.teacher_id || t.id)
          .filter((id): id is number => id !== undefined)
      );
      setSelectedTeacherIds(allIds);

      if (missingTeachers.length > 0) {
        setPreviewTeacherId(missingTeachers[0].teacher_id || missingTeachers[0].id || null);
      }
    }
  }, [show, missingTeachers]);

  // Handle template switch
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const found = REMINDER_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      setCustomText(found.text);
    }
  };

  // Filter missing teachers
  const filteredTeachers = useMemo(() => {
    return missingTeachers.filter((t) => {
      const s = search.toLowerCase();
      return (
        t.name.toLowerCase().includes(s) ||
        (t.phone && t.phone.includes(s)) ||
        (t.designation && t.designation.toLowerCase().includes(s)) ||
        (t.department_name && t.department_name.toLowerCase().includes(s))
      );
    });
  }, [missingTeachers, search]);

  // Currently previewed teacher
  const previewTeacher = useMemo(() => {
    if (!previewTeacherId) return missingTeachers[0] || null;
    return missingTeachers.find((t) => (t.teacher_id || t.id) === previewTeacherId) || missingTeachers[0] || null;
  }, [previewTeacherId, missingTeachers]);

  // Rendered preview message
  const renderedPreviewText = useMemo(() => {
    if (!previewTeacher) return '';
    return renderReminderMessage(customText, previewTeacher, batch);
  }, [customText, previewTeacher, batch]);

  // Toggle selection for all filtered
  const handleToggleSelectAll = () => {
    const newSet = new Set(selectedTeacherIds);
    const allFilteredSelected = filteredTeachers.every((t) => {
      const id = t.teacher_id || t.id;
      return id && newSet.has(id);
    });

    if (allFilteredSelected) {
      filteredTeachers.forEach((t) => {
        const id = t.teacher_id || t.id;
        if (id) newSet.delete(id);
      });
    } else {
      filteredTeachers.forEach((t) => {
        const id = t.teacher_id || t.id;
        if (id) newSet.add(id);
      });
    }
    setSelectedTeacherIds(newSet);
  };

  // Single toggle
  const handleToggleTeacher = (id: number) => {
    const newSet = new Set(selectedTeacherIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTeacherIds(newSet);
  };

  // 1-Click Send to Single Teacher
  const handleSendSingleWhatsApp = (teacher: ReminderTeacher) => {
    if (!teacher.phone || teacher.phone === '0' || teacher.phone === 'N/A') {
      toast.error(`${teacher.name}-এর কোনো বৈধ মোবাইল নম্বর পাওয়া যায়নি।`);
      return;
    }

    const msg = renderReminderMessage(customText, teacher, batch);
    const opened = openWhatsAppChat(teacher.phone, msg);
    if (opened) {
      toast.success(`${teacher.name}-কে হোয়াটসঅ্যাপে মেসেজ পাঠানোর উইন্ডো ওপেন হয়েছে।`);
    } else {
      toast.error('হোয়াটসঅ্যাপ ওপেন করা সম্ভব হয়নি।');
    }
  };

  // Copy Single Message
  const handleCopySingleMessage = (teacher: ReminderTeacher) => {
    const msg = renderReminderMessage(customText, teacher, batch);
    navigator.clipboard.writeText(msg);
    toast.success(`${teacher.name}-এর জন্য তৈরি মেসেজ ক্লিপবোর্ডে কপি করা হয়েছে!`);
  };

  // Copy All Selected Phone Numbers
  const handleCopyAllPhones = () => {
    const phones = missingTeachers
      .filter((t) => {
        const id = t.teacher_id || t.id;
        return id && selectedTeacherIds.has(id);
      })
      .map((t) => t.phone)
      .filter((p): p is string => Boolean(p && p !== '0' && p !== 'N/A'));

    if (phones.length === 0) {
      toast.info('নির্বাচিত শিক্ষকদের কোনো ফোন নম্বর পাওয়া যায়নি।');
      return;
    }

    navigator.clipboard.writeText(phones.join(', '));
    toast.success(`মোট ${phones.length} জন শিক্ষকের ফোন নম্বর কপি করা হয়েছে!`);
  };

  // Copy Generic Broadcast Message
  const handleCopyBroadcastMessage = () => {
    const genericTeacher: ReminderTeacher = {
      name: 'সম্মানিত শিক্ষক / শিক্ষিকা',
      salutation: 'Sir/Madam',
      designation: 'Faculty Member',
    };
    const broadcastMsg = renderReminderMessage(customText, genericTeacher, batch);
    navigator.clipboard.writeText(broadcastMsg);
    toast.success('হোয়াটসঅ্যাপ গ্রুপ বা ব্রডকাস্টে পাঠানোর মেসেজ কপি করা হয়েছে!');
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="whatsapp-reminder-modal">
      <Modal.Header closeButton style={{ backgroundColor: '#075E54', color: '#ffffff' }}>
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center">
          <div 
            className="p-1.5 rounded-circle me-2 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: '#25D366' }}
          >
            <MessageSquare size={18} className="text-white" />
          </div>
          হোয়াটসঅ্যাপ তাগিদ / রিমাইন্ডার হাব (WhatsApp Reminder Hub)
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4 bg-light">
        {/* Batch Info Banner */}
        <div className="bg-white p-3 rounded-3 border shadow-xs mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <div className="text-muted small">ব্যাচ ও লেসন প্ল্যান ট্র্যাকিং:</div>
            <h5 className="fw-bold text-dark mb-0">{batch.title}</h5>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge bg="danger" className="p-2 fs-6 fw-semibold">
              বাকি রয়েছে: {missingTeachers.length} জন শিক্ষক
            </Badge>
            <Badge bg="dark" className="p-2 fs-6">
              নির্বাচিত: {selectedTeacherIds.size} জন
            </Badge>
          </div>
        </div>

        <Row className="g-3 mb-3">
          {/* LEFT: Template Selection & Live Customization */}
          <Col lg={6}>
            <Card className="border shadow-xs h-100 bg-white">
              <Card.Header className="bg-white py-2.5 d-flex justify-content-between align-items-center border-bottom">
                <span className="fw-bold text-dark small d-flex align-items-center">
                  <Sparkles size={15} className="text-primary me-1.5" />
                  রিমাইন্ডার মেসেজ টেমপ্লেট নির্বাচন ও এডিট
                </span>
                <Badge bg="light" text="dark" className="border">
                  Live Customizable
                </Badge>
              </Card.Header>
              <Card.Body className="p-3">
                {/* Template Preset Dropdown */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold small mb-1">টেমপ্লেট সিলেক্ট করুন (Preset Templates):</Form.Label>
                  <Form.Select
                    size="sm"
                    value={selectedTemplateId}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                  >
                    {REMINDER_TEMPLATES.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Editable Textarea */}
                <Form.Group className="mb-2">
                  <Form.Label className="fw-semibold small mb-1 d-flex justify-content-between">
                    <span>মেসেজের বিবরণ (Message Body):</span>
                    <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                      ট্যাগ: {'{name}'}, {'{salutation}'}, {'{batchTitle}'}, {'{portalUrl}'}
                    </span>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={8}
                    className="small font-monospace"
                    style={{ fontSize: '0.85rem', lineHeight: '1.45' }}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                    <Info size={13} className="me-1 inline-block" />
                    প্রতিটি শিক্ষকের নাম ও সম্বোধন স্বয়ংক্রিয়ভাবে মেসেজে যুক্ত হবে।
                  </span>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="py-0 px-2"
                    style={{ fontSize: '0.75rem' }}
                    onClick={handleCopyBroadcastMessage}
                  >
                    <Copy size={12} className="me-1" /> ব্রডকাস্ট টেক্সট কপি
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* RIGHT: Live WhatsApp Message Preview */}
          <Col lg={6}>
            <Card className="border shadow-xs h-100 bg-white">
              <Card.Header className="bg-white py-2.5 d-flex justify-content-between align-items-center border-bottom">
                <span className="fw-bold text-dark small d-flex align-items-center">
                  <MessageSquare size={15} className="text-success me-1.5" />
                  হোয়াটসঅ্যাপ মেসেজ লাইভ প্রিভিউ (WhatsApp Live Preview)
                </span>
                {previewTeacher && (
                  <Badge bg="success" className="fw-normal">
                    {previewTeacher.name}
                  </Badge>
                )}
              </Card.Header>

              <Card.Body className="p-3 d-flex flex-column justify-content-between">
                {/* WhatsApp Chat Simulation Bubble */}
                <div 
                  className="p-3 rounded-3 shadow-xs mb-3"
                  style={{ 
                    backgroundColor: '#E7FFDB', 
                    border: '1px solid #C2ECC1',
                    whiteSpace: 'pre-wrap',
                    fontSize: '0.86rem',
                    color: '#111b21',
                    maxHeight: '280px',
                    overflowY: 'auto'
                  }}
                >
                  {renderedPreviewText}
                </div>

                {previewTeacher && (
                  <div className="p-2.5 bg-light rounded border small d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <div className="fw-bold text-dark">{previewTeacher.name}</div>
                      <div className="text-muted font-monospace" style={{ fontSize: '0.8rem' }}>
                        📱 {previewTeacher.phone || 'নম্বর নেই'} ({previewTeacher.designation || 'Teacher'})
                      </div>
                    </div>

                    <div className="d-flex gap-1.5">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="py-1 px-2.5"
                        onClick={() => handleCopySingleMessage(previewTeacher)}
                      >
                        <Copy size={13} className="me-1" /> মেসেজ কপি
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        className="py-1 px-3 fw-bold d-flex align-items-center"
                        style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                        onClick={() => handleSendSingleWhatsApp(previewTeacher)}
                        disabled={!previewTeacher.phone || previewTeacher.phone === '0'}
                      >
                        <Send size={13} className="me-1.5" /> হোয়াটসঅ্যাপে পাঠান
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* BOTTOM: Missing Teachers Selection List & Table */}
        <Card className="border shadow-xs bg-white">
          <Card.Header className="bg-white p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <Button
                variant="outline-dark"
                size="sm"
                className="d-flex align-items-center py-1"
                onClick={handleToggleSelectAll}
              >
                {filteredTeachers.length > 0 && filteredTeachers.every((t) => selectedTeacherIds.has(t.teacher_id || t.id || 0)) ? (
                  <>
                    <CheckSquare size={14} className="me-1 text-primary" /> সব আনসিলেক্ট
                  </>
                ) : (
                  <>
                    <Square size={14} className="me-1" /> সব সিলেক্ট করুন ({filteredTeachers.length})
                  </>
                )}
              </Button>

              <span className="text-muted small">
                ({selectedTeacherIds.size} জন নির্বাচিত)
              </span>
            </div>

            <div className="d-flex align-items-center gap-2">
              {/* Search */}
              <div className="input-group input-group-sm" style={{ width: '260px' }}>
                <span className="input-group-text bg-light">
                  <Search size={13} />
                </span>
                <Form.Control
                  placeholder="শিক্ষকের নাম বা মোবাইল..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Copy Selected Numbers */}
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center py-1"
                onClick={handleCopyAllPhones}
                title="নির্বাচিত সব শিক্ষকের মোবাইল নম্বর কপি করুন"
              >
                <Copy size={13} className="me-1" /> ফোন নম্বর কপি ({selectedTeacherIds.size})
              </Button>
            </div>
          </Card.Header>

          <Card.Body className="p-0">
            <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
              <Table responsive hover size="sm" className="align-middle mb-0 small">
                <thead className="table-light sticky-top" style={{ top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ width: '40px' }} className="text-center">#</th>
                    <th style={{ width: '50px' }} className="text-center">SL</th>
                    <th style={{ width: '80px' }}>EMP ID</th>
                    <th>শিক্ষকের নাম ও পদবি</th>
                    <th>বিভাগ</th>
                    <th>মোবাইল নম্বর</th>
                    <th style={{ width: '110px' }} className="text-center">প্রিভিউ</th>
                    <th style={{ width: '160px' }} className="text-end pe-3">হোয়াটসঅ্যাপ কার্যক্রম</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-4 text-muted">
                        কোনো মিসিং শিক্ষক পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    filteredTeachers.map((t, idx) => {
                      const id = t.teacher_id || t.id || idx;
                      const isSelected = selectedTeacherIds.has(id);
                      const isPreviewing = previewTeacherId === id;
                      const hasValidPhone = formatWhatsAppPhone(t.phone) !== null;

                      return (
                        <tr 
                          key={id} 
                          className={isPreviewing ? 'table-warning' : isSelected ? '' : 'text-muted'}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setPreviewTeacherId(id)}
                        >
                          <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleTeacher(id)}
                            />
                          </td>
                          <td className="text-center">
                            <span className="badge bg-light text-dark border font-monospace fw-bold">
                              {t.serial_number !== undefined && t.serial_number !== null ? t.serial_number : (idx + 1)}
                            </span>
                          </td>
                          <td>
                            {t.employee_id ? (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace px-1.5 py-0.5">
                                {t.employee_id}
                              </span>
                            ) : (
                              <span className="text-muted small">-</span>
                            )}
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{t.name}</div>
                            <div className="text-muted small">{t.designation || 'Teacher'}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-secondary border">
                              {t.department_name || 'General'}
                            </span>
                          </td>
                          <td className="font-monospace">
                            {hasValidPhone ? (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle px-2 py-1">
                                <Phone size={11} className="me-1" />
                                {t.phone}
                              </span>
                            ) : (
                              <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2 py-1">
                                নম্বর নেই
                              </span>
                            )}
                          </td>
                          <td className="text-center">
                            <Button
                              variant={isPreviewing ? 'warning' : 'outline-secondary'}
                              size="sm"
                              className="py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewTeacherId(id);
                              }}
                            >
                              {isPreviewing ? '✓ প্রদর্শিত' : 'প্রিভিউ দেখুন'}
                            </Button>
                          </td>
                          <td className="text-end pe-3" onClick={(e) => e.stopPropagation()}>
                            <div className="d-flex justify-content-end gap-1">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="py-0 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => handleCopySingleMessage(t)}
                                title="এই মেসেজটি কপি করুন"
                              >
                                <Copy size={12} />
                              </Button>
                              <Button
                                variant="success"
                                size="sm"
                                className="py-0.5 px-2.5 d-inline-flex align-items-center fw-semibold text-white"
                                style={{ backgroundColor: '#25D366', borderColor: '#25D366', fontSize: '0.78rem' }}
                                onClick={() => handleSendSingleWhatsApp(t)}
                                disabled={!hasValidPhone}
                                title={hasValidPhone ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান' : 'বৈধ মোবাইল নম্বর নেই'}
                              >
                                <Send size={12} className="me-1" />
                                WhatsApp
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className="bg-light d-flex justify-content-between">
        <div className="text-muted small">
          💡 <strong>টিপস:</strong> WhatsApp Web বা মোবাইলে ওপেন করার পর সরাসরি 'Send' বাটনে চাপলেই মেসেজ চলে যাবে।
        </div>
        <div className="d-flex gap-2">
          <Button variant="secondary" onClick={onHide}>
            বন্ধ করুন
          </Button>
          <Button 
            variant="success" 
            className="d-flex align-items-center fw-bold"
            style={{ backgroundColor: '#075E54', borderColor: '#075E54' }}
            onClick={handleCopyAllPhones}
          >
            <Copy size={15} className="me-1.5" />
            নির্বাচিত {selectedTeacherIds.size} জনের ফোন নম্বর কপি
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};
