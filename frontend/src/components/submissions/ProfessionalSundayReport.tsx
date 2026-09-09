import React from 'react';
import { Table, Row, Col, Button } from 'react-bootstrap';
import { 
  Printer, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Phone, 
  Paperclip, 
  Calendar, 
  Clock, 
  FileText,
  MessageSquare,
  Send,
  Cloud
} from 'lucide-react';
import type { SundayReportData } from '../../types/submissionTracking';
import { openWhatsAppChat, renderReminderMessage, REMINDER_TEMPLATES } from '../../utils/whatsappReminder';
import { getBangladeshLiveTime } from '../../utils/printReport';
import { toast } from 'react-toastify';

interface Props {
  data: SundayReportData;
  onPrint?: () => void;
  onOpenWhatsApp?: () => void;
}

export const ProfessionalSundayReport: React.FC<Props> = ({ data, onPrint, onOpenWhatsApp }) => {
  const handleCopyMissingPhones = () => {
    const phones = data.not_submitted_teachers
      .map((t) => t.phone)
      .filter((p) => p && p !== '0' && p !== 'N/A');

    if (phones.length === 0) {
      toast.info('অনুপস্থিত শিক্ষকদের কোনো ফোন নম্বর পাওয়া যায়নি বা সবাই জমা দিয়েছেন!');
      return;
    }

    navigator.clipboard.writeText(phones.join(', '));
    toast.success(`মোট ${phones.length} জন মিসিং শিক্ষকের ফোন নম্বর কপি করা হয়েছে! (SMS / WhatsApp এ পেস্ট করতে পারেন)`);
  };

  const liveReportTime = getBangladeshLiveTime();
  const isAllSubmitted = data.summary.not_submitted_count === 0 && data.summary.total_teachers > 0;

  return (
    <div className="professional-report-container bg-white p-4 p-md-5 rounded-3 shadow-sm border" id="printable-official-report">
      {/* 1. TOP OFFICIAL INSTITUTIONAL HEADER */}
      <div className="report-header pb-3 mb-4 border-bottom position-relative">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
          {/* Official Logo */}
          <div className="d-flex align-items-center gap-3">
            <div 
              className="logo-box p-1 rounded-circle border shadow-sm bg-white d-flex align-items-center justify-content-center"
              style={{ width: '85px', height: '85px', minWidth: '85px', borderColor: '#1e3a8a' }}
            >
              <img 
                src="/logo.png" 
                alt="BSISC Official Seal" 
                style={{ width: '75px', height: '75px', objectFit: 'contain' }}
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = '/logo.svg';
                }}
              />
            </div>

            <div>
              <h3 className="fw-black text-dark mb-0 tracking-wide" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1e3a8a' }}>
                {data.school_name}
              </h3>
              <div className="text-secondary fw-semibold mb-1" style={{ fontSize: '0.95rem' }}>
                {data.school_name_bn || 'বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ'}
              </div>
              <div className="text-muted small">
                {data.address}
              </div>
            </div>
          </div>

          {/* Institutional Identifiers Badge Box */}
          <div className="text-md-end text-start">
            <div className="d-flex flex-wrap justify-content-md-end gap-1 mb-1">
              <span className="badge bg-light text-primary border px-2 py-1 font-monospace" style={{ fontSize: '0.78rem' }}>
                EIIN: <strong>{data.eiin}</strong>
              </span>
              <span className="badge bg-light text-primary border px-2 py-1 font-monospace" style={{ fontSize: '0.78rem' }}>
                School Code: <strong>{data.school_code}</strong>
              </span>
              <span className="badge bg-light text-primary border px-2 py-1 font-monospace" style={{ fontSize: '0.78rem' }}>
                College Code: <strong>{data.college_code}</strong>
              </span>
            </div>
            <div className="small text-muted font-monospace">
              Ref: <strong className="text-dark">{data.ref_no || `BSISC/ACAD/MONITOR/${data.batch.id}`}</strong>
            </div>

            {onPrint && (
              <div className="mt-2 d-print-none">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="d-inline-flex align-items-center"
                  onClick={onPrint}
                >
                  <Printer size={14} className="me-1" />
                  প্রিন্ট করুন / Save as PDF
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Decorative Institutional Ribbon */}
        <div 
          className="mt-3" 
          style={{ 
            height: '4px', 
            background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 50%, #eab308 100%)',
            borderRadius: '2px'
          }} 
        />
      </div>

      {/* 2. REPORT TITLE & BANNER */}
      <div className="text-center mb-4">
        <div className="d-inline-block px-4 py-2 rounded-pill bg-light border shadow-xs">
          <h5 className="fw-bold text-dark mb-0 text-uppercase d-flex align-items-center justify-content-center" style={{ letterSpacing: '0.5px' }}>
            <FileText size={18} className="me-2 text-primary" />
            {data.batch.category.replace('_', ' ')} Submission & Compliance Report
          </h5>
          <div className="text-muted small fw-medium mt-1">
            পাঠ পরিকল্পনা ও কার্যবিবরণী ট্র্যাকিং রিপোর্ট (রবিবার সকালের বিশেষ মনিটরিং)
          </div>
        </div>
      </div>

      {/* 3. METADATA SUMMARY GRID */}
      <div className="bg-light p-3 rounded-3 border mb-4">
        <Row className="g-2 small">
          <Col md={6}>
            <div className="mb-1">
              <strong>ব্যাচ শিরোনাম (Batch Title):</strong> <span className="text-dark fw-semibold">{data.batch.title}</span>
            </div>
            <div className="mb-1">
              <strong>শ্রেণি / বিভাগ (Target Class):</strong> <span className="badge bg-white text-dark border">{data.batch.class_name}</span>
            </div>
            <div>
              <strong>কার্যকাল (Date Range):</strong> <span className="text-dark">{data.batch.date_range}</span>
            </div>
          </Col>
          <Col md={6} className="text-md-end">
            <div className="mb-1 text-danger fw-semibold">
              <Clock size={13} className="me-1" />
              <strong>ডেডলাইন (Deadline):</strong> {data.batch.deadline_display}
            </div>
            <div className="mb-1">
              <Calendar size={13} className="me-1 text-primary" />
              <strong>রিপোর্ট প্রস্তুতের সময়:</strong> {liveReportTime}
            </div>
            <div>
              <strong>স্ট্যাটাস:</strong>{' '}
              {isAllSubmitted ? (
                <span className="badge bg-success">১০০% সম্পূর্ণ (Fully Compliant)</span>
              ) : (
                <span className="badge bg-danger">জরুরি ফলো-আপ প্রয়োজন (Action Required)</span>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* 4. EXECUTIVE KPI SCORECARDS */}
      <Row className="g-3 mb-4 text-center">
        <Col md={3} xs={6}>
          <div className="p-3 border rounded-3 bg-white shadow-xs">
            <div className="text-muted small fw-semibold">মোট শিক্ষক (Total Faculty)</div>
            <h3 className="fw-bold text-dark mb-0 mt-1">{data.summary.total_teachers}</h3>
            <div className="small text-muted mt-1">জন শিক্ষক</div>
          </div>
        </Col>

        <Col md={3} xs={6}>
          <div className="p-3 border rounded-3 shadow-xs" style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}>
            <div className="text-success small fw-semibold">জমা দিয়েছেন (Submitted)</div>
            <h3 className="fw-bold text-success mb-0 mt-1">{data.summary.submitted_count}</h3>
            <div className="small text-success mt-1">সফলভাবে প্রাপ্ত</div>
          </div>
        </Col>

        <Col md={3} xs={6}>
          <div className="p-3 border rounded-3 shadow-xs" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
            <div className="text-danger small fw-semibold">জমা দেননি (Not Submitted)</div>
            <h3 className="fw-bold text-danger mb-0 mt-1">{data.summary.not_submitted_count}</h3>
            <div className="small text-danger mt-1">বকেয়া / অনুপস্থিত</div>
          </div>
        </Col>

        <Col md={3} xs={6}>
          <div className="p-3 border rounded-3 shadow-xs" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <div className="text-primary small fw-semibold">সম্পূর্ণতার হার (Rate)</div>
            <h3 className="fw-bold text-primary mb-0 mt-1">{data.summary.completion_percent}%</h3>
            <div className="small text-primary mt-1">
              {data.summary.completion_percent > 80 ? 'সন্তোষজনক' : 'ফলো-আপ চলছে'}
            </div>
          </div>
        </Col>
      </Row>

      {/* 5. SECTION A: MISSING / NOT SUBMITTED TEACHERS TABLE */}
      <div className="section-missing mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">
          <div className="d-flex align-items-center">
            <div className="p-1 px-2 rounded bg-danger text-white me-2 small fw-bold">
              SECTION A
            </div>
            <h6 className="fw-bold text-danger mb-0 d-flex align-items-center">
              <AlertTriangle size={17} className="me-2 text-danger" />
              যে সকল শিক্ষক শনিবার রাতের মধ্যে জমা দেননি (অনুপস্থিত তালিকা: {data.not_submitted_teachers.length} জন)
            </h6>
          </div>

          <div className="d-flex gap-2 d-print-none">
            {data.not_submitted_teachers.length > 0 && (
              <>
                {onOpenWhatsApp && (
                  <Button
                    variant="success"
                    size="sm"
                    className="d-flex align-items-center fw-bold text-white shadow-xs"
                    style={{ backgroundColor: '#25D366', borderColor: '#25D366' }}
                    onClick={onOpenWhatsApp}
                  >
                    <MessageSquare size={13} className="me-1" />
                    হোয়াটসঅ্যাপ রিমাইন্ডার হাব ({data.not_submitted_teachers.length})
                  </Button>
                )}
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="d-flex align-items-center fw-semibold"
                  onClick={handleCopyMissingPhones}
                >
                  <Copy size={13} className="me-1" />
                  ফোন নম্বর কপি ({data.not_submitted_teachers.length})
                </Button>
              </>
            )}
          </div>
        </div>

        {data.not_submitted_teachers.length === 0 ? (
          <div className="p-4 bg-success bg-opacity-10 text-success rounded-3 border border-success text-center">
            <CheckCircle2 size={24} className="mb-2" />
            <h6 className="fw-bold mb-1">আলহামদুলিল্লাহ! সকল সম্মানিত শিক্ষক পাঠ পরিকল্পনা জমা দিয়েছেন।</h6>
            <p className="small mb-0 text-muted">এই ব্যাচে কোনো বকেয়া বা অনুপস্থিত শিক্ষক নেই।</p>
          </div>
        ) : (
          <div className="table-responsive border rounded-3 overflow-hidden">
            <Table bordered hover size="sm" className="align-middle mb-0">
              <thead style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
                <tr className="small text-uppercase fw-bold">
                  <th style={{ width: '50px' }} className="text-center">SL</th>
                  <th style={{ width: '85px' }} className="text-center">EMP ID</th>
                  <th>শিক্ষকের নাম (Faculty Member)</th>
                  <th>পদবি (Designation)</th>
                  <th>বিভাগ (Department)</th>
                  <th>মোবাইল নম্বর (Contact Phone)</th>
                  <th className="text-center" style={{ width: '110px' }}>স্ট্যাটাস</th>
                  <th className="text-center d-print-none" style={{ width: '130px' }}>তাগিদ / Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {data.not_submitted_teachers.map((t, idx) => (
                  <tr key={idx} className="table-hover-row">
                    <td className="text-center font-monospace fw-bold">
                      {t.serial_number !== undefined && t.serial_number !== null ? t.serial_number : idx + 1}
                    </td>
                    <td className="text-center font-monospace text-muted small">
                      {t.employee_id || '—'}
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{t.name}</div>
                      {t.salutation && <span className="text-muted small">({t.salutation})</span>}
                    </td>
                    <td>{t.designation}</td>
                    <td>
                      <span className="badge bg-light text-secondary border">
                        {t.department}
                      </span>
                    </td>
                    <td className="font-monospace fw-semibold text-danger">
                      {t.phone && t.phone !== '0' ? (
                        <a href={`tel:${t.phone}`} className="text-decoration-none text-danger d-flex align-items-center">
                          <Phone size={12} className="me-1" />
                          {t.phone}
                        </a>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span 
                        className="badge px-2 py-1"
                        style={{ backgroundColor: '#fecaca', color: '#991b1b', border: '1px solid #f87171' }}
                      >
                        Not Submitted
                      </span>
                    </td>
                    <td className="text-center d-print-none">
                      <Button
                        variant="success"
                        size="sm"
                        className="py-0.5 px-2 d-inline-flex align-items-center text-white fw-semibold"
                        style={{ backgroundColor: '#25D366', borderColor: '#25D366', fontSize: '0.75rem' }}
                        onClick={() => {
                          const msg = renderReminderMessage(REMINDER_TEMPLATES[0].text, {
                            name: t.name,
                            salutation: t.salutation,
                            designation: t.designation,
                            department_name: t.department,
                            phone: t.phone,
                          }, {
                            title: data.batch.title,
                            deadline: data.batch.deadline_display,
                          });
                          if (!t.phone || t.phone === '0' || t.phone === 'N/A') {
                            toast.error('শিক্ষকের কোনো ফোন নম্বর নেই।');
                            return;
                          }
                          openWhatsAppChat(t.phone, msg);
                        }}
                        disabled={!t.phone || t.phone === '0' || t.phone === 'N/A'}
                        title="এই শিক্ষককে হোয়াটসঅ্যাপে রিমাইন্ডার পাঠান"
                      >
                        <Send size={11} className="me-1" /> WhatsApp
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* 6. SECTION B: SUBMITTED TEACHERS TABLE */}
      <div className="section-submitted mb-5">
        <div className="d-flex align-items-center mb-2">
          <div className="p-1 px-2 rounded bg-success text-white me-2 small fw-bold">
            SECTION B
          </div>
          <h6 className="fw-bold text-success mb-0 d-flex align-items-center">
            <CheckCircle2 size={17} className="me-2 text-success" />
            যথা সময়ে জমা দেওয়া শিক্ষক তালিকা ({data.submitted_teachers.length} জন)
          </h6>
        </div>

        {data.submitted_teachers.length === 0 ? (
          <div className="p-3 bg-light text-muted rounded border text-center small">
            এখনও পর্যন্ত কোনো শিক্ষক ফাইল জমা দেননি।
          </div>
        ) : (
          <div className="table-responsive border rounded-3 overflow-hidden">
            <Table bordered hover size="sm" className="align-middle mb-0">
              <thead style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                <tr className="small text-uppercase fw-bold">
                  <th style={{ width: '50px' }} className="text-center">SL</th>
                  <th style={{ width: '85px' }} className="text-center">EMP ID</th>
                  <th>শিক্ষকের নাম (Faculty Member)</th>
                  <th>পদবি ও বিভাগ</th>
                  <th>জমা দেওয়ার তারিখ ও সময়</th>
                  <th>সংযুক্ত ফাইলসমূহ (Attached Files)</th>
                  <th className="text-center" style={{ width: '110px' }}>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="small">
                {data.submitted_teachers.map((t, idx) => (
                  <tr key={idx}>
                    <td className="text-center font-monospace fw-bold">
                      {t.serial_number !== undefined && t.serial_number !== null ? t.serial_number : idx + 1}
                    </td>
                    <td className="text-center font-monospace text-muted small">
                      {t.employee_id || '—'}
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{t.name}</div>
                    </td>
                    <td>
                      <div>{t.designation}</div>
                      <span className="badge bg-light text-secondary border small">{t.department}</span>
                    </td>
                    <td className="text-muted font-monospace">
                      <div>{t.submitted_at || '—'}</div>
                      {t.last_updated_at && t.last_updated_at !== t.submitted_at && (
                        <div className="small text-primary fw-medium" style={{ fontSize: '0.72rem' }}>
                          আপডেট: {t.last_updated_at}
                        </div>
                      )}
                    </td>
                    <td>
                      {t.files && t.files.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {t.files.map((f, fIdx) => (
                            <div key={fIdx} className="d-inline-flex align-items-center gap-1">
                              <a
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="badge bg-light text-primary border text-decoration-none p-1 px-2 d-flex align-items-center"
                                title={f.name}
                              >
                                <Paperclip size={11} className="me-1" />
                                {f.name.length > 20 ? f.name.substring(0, 17) + '...' : f.name}
                              </a>
                              {f.gdrive_view_link && (
                                <a
                                  href={f.gdrive_view_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="badge bg-light text-success border text-decoration-none p-1 px-1.5 d-flex align-items-center"
                                  title="Google Drive-এ ফাইলটি দেখুন"
                                >
                                  <Cloud size={10} className="me-0.5" /> Drive
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <span className="badge bg-success px-2 py-1">Submitted</span>
                      {t.update_count && t.update_count > 1 ? (
                        <div className="mt-1">
                          <span 
                            className="badge px-1.5 py-0.5 font-monospace" 
                            style={{ backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', fontSize: '0.68rem' }}
                            title={`এই শিক্ষক মোট ${t.update_count} বার ফাইল আপডেট করেছেন`}
                          >
                            🔄 রিভিশন #{t.update_count}
                          </span>
                        </div>
                      ) : (
                        <div className="mt-1">
                          <span 
                            className="badge px-1.5 py-0.5 text-muted font-monospace bg-light border" 
                            style={{ fontSize: '0.68rem' }}
                          >
                            ১ম জমা
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>

      {/* 7. OFFICIAL 3-COLUMN SIGNATURE FOOTER */}
      <div className="report-signatures pt-5 mt-4 border-top">
        <Row className="text-center g-3 align-items-end">
          <Col xs={4}>
            <div className="signature-box">
              <div style={{ height: '40px' }}></div>
              <div className="mx-auto mb-2" style={{ width: '85%', maxWidth: '220px', borderTop: '1.5px dotted #94a3b8' }}></div>
              <div className="fw-bold text-dark fs-7" style={{ color: '#0f172a' }}>Aklima Begum</div>
              <div className="fw-semibold text-secondary small" style={{ fontSize: '0.8rem' }}>VP (Jr. Div)</div>
            </div>
          </Col>

          <Col xs={4}>
            <div className="signature-box">
              <div style={{ height: '40px' }}></div>
              <div className="mx-auto mb-2" style={{ width: '85%', maxWidth: '220px', borderTop: '1.5px dotted #94a3b8' }}></div>
              <div className="fw-bold text-dark fs-7" style={{ color: '#0f172a' }}>Masuma Mamataz</div>
              <div className="fw-semibold text-secondary small" style={{ fontSize: '0.8rem' }}>VP (Sr. Div)</div>
            </div>
          </Col>

          <Col xs={4}>
            <div className="signature-box">
              <div style={{ height: '40px' }}></div>
              <div className="mx-auto mb-2" style={{ width: '90%', maxWidth: '300px', borderTop: '1.5px dotted #94a3b8' }}></div>
              <div className="fw-bold text-dark fs-7" style={{ color: '#0f172a', lineHeight: 1.3 }}>
                Brig Gen Akhter Shahid, SUP (BAR), ndc, psc, G+, MPhil (LPR)
              </div>
              <div className="fw-bold small mt-0.5" style={{ fontSize: '0.82rem', color: '#1e3a8a' }}>Principal</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* 8. DOCUMENT SECURITY & CONFIDENTIALITY FOOTER */}
      <div className="report-footer text-center mt-4 pt-3 border-top small text-muted">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ fontSize: '0.75rem' }}>
          <div>
            🔒 <strong>Confidential:</strong> Internal Academic Tracking & Administrative Quality Audit Record.
          </div>
          <div className="font-monospace">
            Generated Automatically by BSISC Academic ERP Portal | {liveReportTime}
          </div>
        </div>
      </div>
    </div>
  );
};