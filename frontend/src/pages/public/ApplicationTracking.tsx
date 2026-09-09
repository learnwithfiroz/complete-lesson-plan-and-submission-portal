import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Card, Form, Button, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { Search, ArrowLeft, Printer } from 'lucide-react';
import { formSubmissionsApi } from '../../api/formSubmissions';
import { toast } from 'react-toastify';

export const ApplicationTracking: React.FC = () => {
  const { trackingNumber: initialNumber } = useParams<{ trackingNumber?: string }>();
  const [query, setQuery] = useState(initialNumber || '');
  const [loading, setLoading] = useState(false);
  const [submission, setSubmission] = useState<any | null>(null);

  useEffect(() => {
    if (initialNumber) {
      handleSearch(initialNumber);
    }
  }, [initialNumber]);

  const handleSearch = async (trackingCode: string) => {
    if (!trackingCode.trim()) {
      toast.warning('অনুগ্রহ করে ট্র্যাকিং নম্বরটি লিখুন।');
      return;
    }

    setLoading(true);
    setSubmission(null);
    try {
      const res = await formSubmissionsApi.trackApplication(trackingCode.trim());
      if (res.data) {
        setSubmission(res.data);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'প্রদত্ত নম্বরে কোনো আবেদন পাওয়া যায়নি।');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'approved':
      case 'admitted':
        return <Badge bg="success" className="px-3 py-1.5 fs-7">অনুমোদিত (Approved / Admitted)</Badge>;
      case 'shortlisted':
        return <Badge bg="info" className="px-3 py-1.5 fs-7">শর্টলিস্টেড (Shortlisted)</Badge>;
      case 'reviewed':
        return <Badge bg="primary" className="px-3 py-1.5 fs-7">যাচাইকৃত (Reviewed)</Badge>;
      case 'rejected':
        return <Badge bg="danger" className="px-3 py-1.5 fs-7">বাতিল (Rejected)</Badge>;
      default:
        return <Badge bg="warning" text="dark" className="px-3 py-1.5 fs-7">অপেক্ষমান (Pending Review)</Badge>;
    }
  };

  return (
    <div className="min-vh-100 bg-light py-4 py-md-5">
      <Container style={{ maxWidth: '800px' }}>
        {/* Navigation & Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 d-print-none">
          <Link to="/" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5">
            <ArrowLeft size={16} /> হোমপেইজ
          </Link>
          {submission && (
            <Button variant="primary" size="sm" className="d-flex align-items-center gap-1.5" onClick={() => window.print()}>
              <Printer size={15} /> প্রিন্ট করুন (Print Slip)
            </Button>
          )}
        </div>

        {/* Search Card */}
        <Card className="border-0 shadow-sm rounded-4 mb-4 d-print-none">
          <Card.Body className="p-4 text-center">
            <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
              <img src="/logo.png" alt="BSISC" style={{ width: 45, height: 45, objectFit: 'contain' }} />
              <h5 className="fw-bold text-dark mb-0">অনলাইন আবেদন ট্র্যাকিং ও প্রবেশপত্র প্রিন্ট</h5>
            </div>
            <p className="text-muted small mb-4">
              আপনার আবেদনের ট্র্যাকিং নম্বর (যেমন: BSISC-ADM-2026-XXXX) দিয়ে অনুসন্ধান করুন।
            </p>

            <Form onSubmit={(e) => { e.preventDefault(); handleSearch(query); }} className="d-flex gap-2 max-w-md mx-auto" style={{ maxWidth: '480px' }}>
              <Form.Control
                type="text"
                placeholder="BSISC-ADM-2026-XXXX"
                value={query}
                onChange={(e) => setQuery(e.target.value.toUpperCase())}
                className="py-2 text-center font-monospace fs-6 shadow-none"
              />
              <Button variant="primary" type="submit" disabled={loading} className="px-4 d-flex align-items-center gap-1.5">
                {loading ? <Spinner size="sm" animation="border" /> : <Search size={16} />}
                অনুসন্ধান
              </Button>
            </Form>
          </Card.Body>
        </Card>

        {/* Tracking Result Card */}
        {submission && (
          <Card className="border-0 shadow-lg rounded-4 overflow-hidden print-card">
            <div className="bg-primary text-white p-4 text-center">
              <div className="d-flex align-items-center justify-content-center gap-3">
                <img src="/logo.png" alt="BSISC Logo" style={{ width: 55, height: 55, objectFit: 'contain' }} className="bg-white rounded p-1 shadow-sm" />
                <div className="text-start">
                  <h5 className="fw-bold mb-0">Baridhara Scholars' International School and College</h5>
                  <div className="small text-white-50">EIIN: 133988 | School: 1242 | College: 1760</div>
                  <div className="small text-warning fw-semibold">আবেদন ও প্রবেশপত্র রশিদ (Application Slip)</div>
                </div>
              </div>
            </div>

            <Card.Body className="p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                  <span className="text-muted small d-block">আবেদনের বর্তমান অবস্থা:</span>
                  {getStatusBadge(submission.status)}
                </div>
                <div className="text-end">
                  <span className="text-muted small d-block">ট্র্যাকিং নম্বর:</span>
                  <span className="fw-bold font-monospace fs-5 text-primary">{submission.tracking_number}</span>
                </div>
              </div>

              <Row className="g-3 mb-4">
                <Col md={6}>
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="text-muted small">আবেদনকারীর নাম:</div>
                    <div className="fw-bold fs-6 text-dark">{submission.applicant_name}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="text-muted small">আবেদনকৃত ফরম:</div>
                    <div className="fw-bold text-dark">{submission.form_title}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="text-muted small">মোবাইল নম্বর:</div>
                    <div className="fw-bold font-monospace text-dark">{submission.applicant_phone || 'N/A'}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 border rounded-3 bg-light">
                    <div className="text-muted small">আবেদনের তারিখ:</div>
                    <div className="fw-bold text-dark">{new Date(submission.submitted_at).toLocaleString('bn-BD')}</div>
                  </div>
                </Col>
              </Row>

              {submission.admin_notes && (
                <Alert variant="info" className="mb-4">
                  <strong>কর্তৃপক্ষের মন্তব্য / নির্দেশনা:</strong> {submission.admin_notes}
                </Alert>
              )}

              {/* Signature Blocks for Print */}
              <div className="mt-5 pt-4 border-top d-flex justify-content-between text-center">
                <div>
                  <div className="border-bottom border-dark border-1 mb-1 mx-auto" style={{ width: '150px', height: '35px' }} />
                  <span className="small text-muted">প্রার্থী / অভিভাবকের স্বাক্ষর</span>
                </div>
                <div>
                  <div className="border-bottom border-dark border-1 mb-1 mx-auto" style={{ width: '150px', height: '35px' }} />
                  <span className="small text-muted">অধ্যক্ষ / দায়িত্বপ্রাপ্ত কর্মকর্তা</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};