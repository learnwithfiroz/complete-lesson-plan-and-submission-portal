import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner, ProgressBar } from 'react-bootstrap';
import { Database, CheckCircle, AlertTriangle, RefreshCw, Server, ShieldCheck, Key, UserCheck, ArrowRight, Copy } from 'lucide-react';
import { apiClient } from '../../api/client';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

interface SystemStatus {
  success: boolean;
  system: string;
  version: string;
  php_version: string;
  environment: string;
  app_url: string;
  app_key_set: boolean;
  database: {
    driver: string;
    connected: boolean;
    tables_count: number;
    users_count: number;
    error: string | null;
  };
  storage: {
    writable: boolean;
    linked: boolean;
  };
  needs_initialization: boolean;
}

export const SystemSetup: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningAction, setRunningAction] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get<SystemStatus>('/api/v1/system/status');
      setStatus(response.data);
    } catch (err: any) {
      toast.error('Could not connect to system status API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAction = async (action: string) => {
    setRunningAction(action);
    setLogs([]);
    try {
      const response = await apiClient.post('/api/v1/system/setup', { action });
      if (response.data.success) {
        toast.success(response.data.message || 'Action executed successfully!');
        if (response.data.log) {
          setLogs(Array.isArray(response.data.log) ? response.data.log : [response.data.log]);
        }
        await fetchStatus();
      } else {
        toast.error(response.data.message || 'Action failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Execution error');
      if (err.response?.data?.message) {
        setLogs([err.response.data.message]);
      }
    } finally {
      setRunningAction(null);
    }
  };

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    toast.info(`Copied ${keyName} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        {/* Header */}
        <Row className="justify-content-center mb-4">
          <Col md={10} lg={8} className="text-center">
            <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3 shadow-sm">
              <Database size={40} />
            </div>
            <h2 className="fw-bold text-dark mb-1">সিস্টেম ও ডাটাবেস অটো-সেটআপ</h2>
            <p className="text-muted">
              স্কুল লেসন প্ল্যান ও সাবমিশন পোর্টালের ১-ক্লিক ডাটাবেস ইনিশিয়ালাইজেশন ও সার্ভার হেলথ অ্যাসিস্ট্যান্ট
            </p>
          </Col>
        </Row>

        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            {/* System Status Card */}
            <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <Server className="text-primary" size={20} />
                  <span className="fw-semibold text-dark">সার্ভার ও ডাটাবেস লাইভ স্ট্যাটাস</span>
                </div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={fetchStatus}
                  disabled={loading || !!runningAction}
                  className="rounded-pill d-flex align-items-center gap-1"
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''} /> রিফ্রেশ
                </Button>
              </Card.Header>

              <Card.Body className="p-4">
                {loading && !status ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="text-muted mt-2">সার্ভার স্ট্যাটাস লোড হচ্ছে...</p>
                  </div>
                ) : status ? (
                  <>
                    <Row className="g-3 mb-4">
                      <Col sm={6} md={3}>
                        <div className="p-3 bg-light rounded-3 text-center border">
                          <small className="text-muted d-block">PHP ভার্সন</small>
                          <span className="fw-bold text-dark">{status.php_version?.split('-')[0] || '8.2'}</span>
                        </div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="p-3 bg-light rounded-3 text-center border">
                          <small className="text-muted d-block">ডাটাবেস ড্রাইভার</small>
                          <span className="fw-bold text-dark text-uppercase">{status.database?.driver || 'sqlite'}</span>
                        </div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="p-3 bg-light rounded-3 text-center border">
                          <small className="text-muted d-block">মোট টেবিল সংখ্যা</small>
                          <span className="fw-bold text-primary">{status.database?.tables_count || 0}</span>
                        </div>
                      </Col>
                      <Col sm={6} md={3}>
                        <div className="p-3 bg-light rounded-3 text-center border">
                          <small className="text-muted d-block">মোট ইউজার / শিক্ষক</small>
                          <span className="fw-bold text-success">{status.database?.users_count || 0}</span>
                        </div>
                      </Col>
                    </Row>

                    {/* Status Alerts */}
                    {status.database?.connected ? (
                      status.database.users_count > 0 ? (
                        <Alert variant="success" className="d-flex align-items-center gap-3 rounded-3 mb-4 border-0 shadow-xs">
                          <CheckCircle className="text-success flex-shrink-0" size={24} />
                          <div>
                            <strong>ডাটাবেস সম্পূর্ণ রেডি ও অ্যাক্টিভ!</strong>
                            <div className="small text-muted mt-0.5">
                              সমস্ত টেবিল, শিক্ষক প্রোফাইল, একাডেমিক সেশন ও সেটিংস প্রস্তুত আছে।
                            </div>
                          </div>
                        </Alert>
                      ) : (
                        <Alert variant="warning" className="d-flex align-items-center gap-3 rounded-3 mb-4 border-0 shadow-xs">
                          <AlertTriangle className="text-warning flex-shrink-0" size={24} />
                          <div>
                            <strong>ডাটাবেস কানেক্টেড কিন্তু ডেটা মাইগ্রেশন প্রয়োজন!</strong>
                            <div className="small text-muted mt-0.5">
                              নিচের বাটনে ক্লিক করে ১-ক্লিকে সব টেবিল ও ডিফল্ট ইউজার তৈরি করুন।
                            </div>
                          </div>
                        </Alert>
                      )
                    ) : (
                      <Alert variant="danger" className="d-flex align-items-center gap-3 rounded-3 mb-4 border-0 shadow-xs">
                        <AlertTriangle className="text-danger flex-shrink-0" size={24} />
                        <div>
                          <strong>ডাটাবেস কানেকশন ত্রুটি!</strong>
                          <div className="small mt-1">{status.database?.error || 'ডাটাবেস কানেক্ট করা সম্ভব হয়নি।'}</div>
                        </div>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="d-flex flex-wrap gap-3 mb-3">
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-grow-1 rounded-3 py-2 px-4 shadow-sm d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleAction('init')}
                        disabled={!!runningAction}
                      >
                        {runningAction === 'init' ? (
                          <>
                            <Spinner size="sm" animation="border" /> ডাটাবেস প্রস্তুত হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Database size={18} /> ১-ক্লিকে ডাটাবেস তৈরি ও সিড করুন (Auto Setup)
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline-secondary"
                        size="lg"
                        className="rounded-3 py-2 px-3 d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleAction('sqlite_fallback')}
                        disabled={!!runningAction}
                      >
                        {runningAction === 'sqlite_fallback' ? (
                          <Spinner size="sm" animation="border" />
                        ) : (
                          <>
                            <ShieldCheck size={18} /> SQLite জিরো-কনফিগ
                          </>
                        )}
                      </Button>
                    </div>

                    {runningAction && (
                      <div className="my-3">
                        <ProgressBar animated now={100} variant="primary" style={{ height: '6px' }} />
                      </div>
                    )}

                    {/* Log Console Output */}
                    {logs.length > 0 && (
                      <div className="mt-4 p-3 bg-dark text-success rounded-3 font-monospace small" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <div className="text-muted small mb-1 border-bottom border-secondary pb-1">// এক্সিকিউশন আউটপুট লগ:</div>
                        {logs.map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </Card.Body>
            </Card>

            {/* Default Accounts Card */}
            <Card className="border-0 shadow-sm rounded-4 mb-4">
              <Card.Header className="bg-white border-bottom py-3 d-flex align-items-center gap-2">
                <Key className="text-success" size={20} />
                <span className="fw-semibold text-dark">ডিফল্ট লগইন ইউজার ও ক্রেডেনশিয়াল</span>
              </Card.Header>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={4}>
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <Badge bg="danger" className="mb-2">সুপার অ্যাডমিন</Badge>
                      <div className="small fw-semibold text-dark text-truncate">admin@bsisc.edu.bd</div>
                      <div className="small text-muted mb-2">পাসওয়ার্ড: <code>Password123!</code></div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-center gap-1 py-1"
                        onClick={() => copyToClipboard('admin@bsisc.edu.bd', 'Admin Email')}
                      >
                        <Copy size={12} /> {copiedKey === 'Admin Email' ? 'কপি হয়েছে' : 'ইমেইল কপি'}
                      </Button>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <Badge bg="warning" text="dark" className="mb-2">কো-অর্ডিনেটর</Badge>
                      <div className="small fw-semibold text-dark text-truncate">coordinator@bsisc.edu.bd</div>
                      <div className="small text-muted mb-2">পাসওয়ার্ড: <code>Password123!</code></div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-center gap-1 py-1"
                        onClick={() => copyToClipboard('coordinator@bsisc.edu.bd', 'Coord Email')}
                      >
                        <Copy size={12} /> {copiedKey === 'Coord Email' ? 'কপি হয়েছে' : 'ইমেইল কপি'}
                      </Button>
                    </div>
                  </Col>

                  <Col md={4}>
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <Badge bg="success" className="mb-2">শিক্ষক (Teacher)</Badge>
                      <div className="small fw-semibold text-dark text-truncate">teacher1@bsisc.edu.bd</div>
                      <div className="small text-muted mb-2">পাসওয়ার্ড: <code>Password123!</code></div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 d-flex align-items-center justify-content-center gap-1 py-1"
                        onClick={() => copyToClipboard('teacher1@bsisc.edu.bd', 'Teacher Email')}
                      >
                        <Copy size={12} /> {copiedKey === 'Teacher Email' ? 'কপি হয়েছে' : 'ইমেইল কপি'}
                      </Button>
                    </div>
                  </Col>
                </Row>

                <div className="text-center mt-4 pt-2 border-top">
                  <Link to="/login" className="btn btn-success btn-lg px-5 rounded-pill shadow-sm d-inline-flex align-items-center gap-2">
                    <UserCheck size={20} /> লগইন পেজে প্রবেশ করুন <ArrowRight size={18} />
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};