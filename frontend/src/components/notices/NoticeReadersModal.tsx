import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, ProgressBar, Nav, Table, Form, Spinner, InputGroup } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { noticeApi } from '../../api/notices';
import type { NoticeReadersResponse, NoticeUnreaderItem } from '../../types/notice';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  MessageCircle,
  Laptop,
  Smartphone,
  Tablet,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

interface NoticeReadersModalProps {
  show: boolean;
  noticeId: number | null;
  onHide: () => void;
}

export const NoticeReadersModal: React.FC<NoticeReadersModalProps> = ({ show, noticeId, onHide }) => {
  const { language } = useTranslation();
  const [data, setData] = useState<NoticeReadersResponse['data'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'readers' | 'unreaders'>('readers');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (show && noticeId) {
      loadReaders(noticeId);
    } else {
      setData(null);
      setSearchQuery('');
    }
  }, [show, noticeId]);

  const loadReaders = async (id: number) => {
    try {
      setLoading(true);
      const res = await noticeApi.getNoticeReaders(id);
      if (res.success) {
        setData(res.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'পাঠক তালিকা লোড করা সম্ভব হয়নি');
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (deviceType?: string) => {
    if (deviceType === 'Mobile') return <Smartphone size={14} className="text-primary" />;
    if (deviceType === 'Tablet') return <Tablet size={14} className="text-info" />;
    return <Laptop size={14} className="text-secondary" />;
  };

  const formatBDDateTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const sendWhatsAppReminder = (teacher: NoticeUnreaderItem) => {
    if (!teacher.phone) {
      toast.warning('এই শিক্ষকের মোবাইল নম্বর সংরক্ষিত নেই।');
      return;
    }

    let cleanPhone = teacher.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '88' + cleanPhone;
    } else if (!cleanPhone.startsWith('880')) {
      cleanPhone = '880' + cleanPhone;
    }

    const title = data?.title_bn || data?.title_en || 'জরুরি প্রাতিষ্ঠানিক নোটিশ';
    const message = `আসসালামু আলাইকুম ${teacher.name},\n\nবারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ (BSISC) এর নোটিশ বোর্ডে একটি নতুন নোটিশ প্রকাশিত হয়েছে:\n📌 "${title}"\n\nঅনুগ্রহ করে লগইন করে নোটিশটি দেখে নিন।\nলগইন লিঙ্ক: ${window.location.origin}/notices\n\n- BSISC Administration`;

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Filter lists based on search
  const filteredReaders = (data?.readers || []).filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      (r.name_bn && r.name_bn.toLowerCase().includes(q)) ||
      (r.employee_id && r.employee_id.toLowerCase().includes(q)) ||
      (r.department && r.department.toLowerCase().includes(q))
    );
  });

  const filteredUnreaders = (data?.unreaders || []).filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.name_bn && u.name_bn.toLowerCase().includes(q)) ||
      (u.employee_id && u.employee_id.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <Users size={20} className="text-primary" />
          <span>নোটিশ পাঠক ও প্রাপ্তিস্বীকার বিবরণী (Notice Readers & Receipts)</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <div className="text-muted mt-2 fs-7">পাঠক বিবরণী লোড হচ্ছে...</div>
          </div>
        ) : data ? (
          <>
            {/* Notice Title Banner */}
            <div className="bg-primary-subtle border border-primary-subtle rounded-3 p-3 mb-4">
              <div className="d-flex align-items-center gap-2 mb-1">
                <Badge bg="primary" className="text-uppercase fs-9">
                  {(data.target_audience || 'all').toUpperCase()}
                </Badge>
                {data.priority === 'urgent' && (
                  <Badge bg="danger" className="fs-9">⚡ URGENT</Badge>
                )}
                <span className="text-muted fs-8">
                  প্রকাশকাল: {formatBDDateTime(data.publish_date || undefined)}
                </span>
              </div>
              <h5 className="fw-bold text-dark mb-0 fs-6">
                {language === 'bn' ? (data.title_bn || data.title_en) : (data.title_en || data.title_bn)}
              </h5>
            </div>

            {/* Read Stats Progress Grid */}
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="card border-0 shadow-xs bg-light p-3 text-center rounded-3">
                  <div className="text-muted fs-8 fw-semibold">মোট লক্ষ্যভুক্ত শিক্ষক</div>
                  <div className="fs-4 fw-bold text-dark">{data.total_target} জন</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-xs bg-success bg-opacity-10 border border-success border-opacity-25 p-3 text-center rounded-3">
                  <div className="text-success fs-8 fw-semibold">পড়েছেন (Read Receipts)</div>
                  <div className="fs-4 fw-bold text-success">
                    {data.total_readers} জন ({data.read_percentage}%)
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-xs bg-danger bg-opacity-10 border border-danger border-opacity-25 p-3 text-center rounded-3">
                  <div className="text-danger fs-8 fw-semibold">এখনও পড়েননি (Unread)</div>
                  <div className="fs-4 fw-bold text-danger">{data.total_unreaders} জন</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="d-flex justify-content-between fs-8 text-muted mb-1">
                <span>পড়ার হার (Read Progress)</span>
                <span className="fw-bold text-dark">{data.read_percentage}%</span>
              </div>
              <ProgressBar
                now={data.read_percentage}
                variant={data.read_percentage >= 80 ? 'success' : data.read_percentage >= 50 ? 'primary' : 'warning'}
                style={{ height: '10px' }}
                className="rounded-pill"
              />
            </div>

            {/* Tabs & Search Bar */}
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
              <Nav variant="pills" activeKey={activeTab} onSelect={(k) => k && setActiveTab(k as any)}>
                <Nav.Item>
                  <Nav.Link eventKey="readers" className="fw-semibold fs-7 d-flex align-items-center gap-1.5 py-1.5 px-3">
                    <CheckCircle2 size={16} className="text-success" />
                    <span>পড়েছেন এমন শিক্ষক ({data.total_readers})</span>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link eventKey="unreaders" className="fw-semibold fs-7 d-flex align-items-center gap-1.5 py-1.5 px-3">
                    <AlertCircle size={16} className="text-danger" />
                    <span>এখনও পড়েননি ({data.total_unreaders})</span>
                  </Nav.Link>
                </Nav.Item>
              </Nav>

              <div style={{ maxWidth: '300px' }} className="w-100">
                <InputGroup size="sm">
                  <InputGroup.Text className="bg-white border-end-0">
                    <Search size={14} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="নাম, EMP ID বা বিভাগ খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-start-0 fs-8"
                  />
                </InputGroup>
              </div>
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'readers' ? (
              <div className="table-responsive border rounded-3 overflow-hidden">
                <Table hover className="align-middle mb-0 fs-7">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>শিক্ষক / কর্মকর্তা</th>
                      <th>পদবি ও বিভাগ</th>
                      <th>পড়ার সময় (Read At)</th>
                      <th>ডিভাইস ও আইপি</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReaders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">
                          {searchQuery ? 'কোনো ফলাফল পাওয়া যায়নি' : 'এখনও কোনো শিক্ষক পড়েননি'}
                        </td>
                      </tr>
                    ) : (
                      filteredReaders.map((r, idx) => (
                        <tr key={r.id}>
                          <td className="text-muted font-monospace">{idx + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold overflow-hidden"
                                style={{ width: 32, height: 32, fontSize: '13px', minWidth: 32 }}
                              >
                                {r.avatar ? (
                                  <img src={r.avatar} alt={r.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  (r.name || 'U').charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="fw-semibold text-dark leading-tight">{r.name}</div>
                                {r.name_bn && <small className="text-muted d-block">{r.name_bn}</small>}
                                <div className="d-flex gap-1 mt-0.5">
                                  {r.serial_number !== undefined && r.serial_number !== null && (
                                    <Badge bg="dark" className="fs-9 font-monospace">SL #{r.serial_number}</Badge>
                                  )}
                                  {r.employee_id && (
                                    <Badge bg="secondary" className="fs-9 font-monospace">ID: {r.employee_id}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="fw-medium text-secondary">{r.designation || 'Teacher'}</div>
                            <small className="text-muted">{r.department || 'General'}</small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1.5 text-success fw-semibold font-monospace fs-8">
                              <Clock size={13} />
                              <span>{formatBDDateTime(r.read_at)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1 fs-8 text-secondary">
                              {getDeviceIcon(r.device_type)}
                              <span>{r.device_type} ({r.browser || 'Browser'})</span>
                            </div>
                            <small className="text-muted font-monospace">{r.ip_address || 'IP: Unknown'}</small>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="table-responsive border rounded-3 overflow-hidden">
                <Table hover className="align-middle mb-0 fs-7">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>শিক্ষক / কর্মকর্তা</th>
                      <th>পদবি ও বিভাগ</th>
                      <th>মোবাইল নম্বর</th>
                      <th className="text-end">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUnreaders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-success fw-semibold">
                          🎉 অভিনন্দন! সকল শিক্ষক নোটিশটি পড়েছেন।
                        </td>
                      </tr>
                    ) : (
                      filteredUnreaders.map((u, idx) => (
                        <tr key={u.id}>
                          <td className="text-muted font-monospace">{idx + 1}</td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center fw-bold overflow-hidden"
                                style={{ width: 32, height: 32, fontSize: '13px', minWidth: 32 }}
                              >
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  (u.name || 'U').charAt(0).toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="fw-semibold text-dark leading-tight">{u.name}</div>
                                {u.name_bn && <small className="text-muted d-block">{u.name_bn}</small>}
                                <div className="d-flex gap-1 mt-0.5">
                                  {u.serial_number !== undefined && u.serial_number !== null && (
                                    <Badge bg="dark" className="fs-9 font-monospace">SL #{u.serial_number}</Badge>
                                  )}
                                  {u.employee_id && (
                                    <Badge bg="secondary" className="fs-9 font-monospace">ID: {u.employee_id}</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="fw-medium text-secondary">{u.designation || 'Teacher'}</div>
                            <small className="text-muted">{u.department || 'General'}</small>
                          </td>
                          <td>
                            <span className="font-monospace text-primary fw-semibold">{u.phone || 'N/A'}</span>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="success"
                              size="sm"
                              className="rounded-3 d-inline-flex align-items-center gap-1.5 fs-8 fw-semibold"
                              onClick={() => sendWhatsAppReminder(u)}
                              disabled={!u.phone}
                              title="হোয়াটসঅ্যাপে নোটিশ দেখার রিমাইন্ডার পাঠান"
                            >
                              <MessageCircle size={14} />
                              <span>WhatsApp Reminder</span>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </>
        ) : null}
      </Modal.Body>

      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" size="sm" onClick={onHide} className="rounded-3 px-3">
          বন্ধ করুন
        </Button>
      </Modal.Footer>
    </Modal>
  );
};