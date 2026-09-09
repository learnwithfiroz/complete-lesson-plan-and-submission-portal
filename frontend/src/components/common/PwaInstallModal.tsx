import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { Download, Smartphone, CheckCircle2, MoreVertical, Share, Zap, Bell, ShieldCheck, Sparkles } from 'lucide-react';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { useTranslation } from '../../locales/i18n';
import { toast } from 'react-toastify';

interface Props {
  show: boolean;
  onHide: () => void;
}

export const PwaInstallModal: React.FC<Props> = ({ show, onHide }) => {
  const { language } = useTranslation();
  const { isInstalled, hasNativePrompt, promptInstall } = usePwaInstall();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      toast.success(
        language === 'bn'
          ? 'BSISC অ্যাপ সফলভাবে ইনস্টল করা হয়েছে!'
          : 'BSISC App installed successfully on your device!'
      );
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white border-0 py-3">
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
          <Smartphone size={22} className="text-warning" />
          <span>
            {language === 'bn'
              ? 'মোবাইল অ্যাপ ইনস্টল করুন (Android App)'
              : 'Install Mobile App (Android / iOS)'}
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-3 p-md-4">
        {/* App Hero Card */}
        <div
          className="p-3 p-md-4 rounded-4 mb-4 text-white shadow-sm position-relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)',
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <img
              src="/icon-maskable-512.png"
              alt="BSISC Logo"
              className="rounded-4 bg-white p-1.5 shadow-md flex-shrink-0"
              style={{ width: '64px', height: '64px', objectFit: 'contain' }}
            />
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <h5 className="fw-bold mb-0">BSISC Lesson Plan App</h5>
                <Badge bg="warning" text="dark" className="fw-bold py-1 px-2">
                  OFFICIAL APP
                </Badge>
                {isInstalled && (
                  <Badge bg="success" className="d-flex align-items-center gap-1 py-1 px-2">
                    <CheckCircle2 size={12} /> INSTALLED
                  </Badge>
                )}
              </div>
              <p className="text-white-50 small mb-0">
                বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ (EIIN: 133988)
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-top border-white-50 d-flex flex-wrap align-items-center justify-content-between gap-2">
            <span className="text-white-50 fs-8">
              {isInstalled
                ? '✅ অ্যাপটি বর্তমানে আপনার ডিভাইসে ইনস্টল রয়েছে'
                : '📲 অ্যান্ড্রয়েড ও আইওএস উভয় ডিভাইসেই প্লে-স্টোর ছাড়াই ১-ক্লিকে ইনস্টলেবল'}
            </span>

            {!isInstalled && hasNativePrompt && (
              <Button
                variant="warning"
                size="sm"
                className="fw-bold text-dark px-3 py-2 rounded-3 d-flex align-items-center gap-2 shadow-sm"
                onClick={handleInstall}
              >
                <Download size={16} />
                <span>{language === 'bn' ? 'সরাসরি ইনস্টল করুন' : '1-Click Direct Install'}</span>
              </Button>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-1.5">
          <Sparkles size={18} className="text-primary" />
          <span>মোবাইল অ্যাপ ব্যবহারের বিশেষ সুবিধাসমূহ (Features & Benefits)</span>
        </h6>

        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="p-3 rounded-3 bg-light border h-100 d-flex align-items-start gap-2.5">
              <Zap size={20} className="text-warning flex-shrink-0 mt-1" />
              <div>
                <strong className="d-block text-dark small fw-bold">সুপার ফাস্ট ও লাইটওয়েট (Fast & Light)</strong>
                <span className="text-muted fs-8">কোনো অতিরিক্ত মেমোরি খরচ নেই। কোনো ল্যাগ ছাড়া পলকেই লোড হয়।</span>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="p-3 rounded-3 bg-light border h-100 d-flex align-items-start gap-2.5">
              <Bell size={20} className="text-danger flex-shrink-0 mt-1" />
              <div>
                <strong className="d-block text-dark small fw-bold">লাইভ নোটিশ রিয়েল-টাইম স্ক্রোল (Live Notice)</strong>
                <span className="text-muted fs-8">প্রতিষ্ঠান থেকে প্রকাশিত সকল জরুরি সার্কুলার ও নোটিশ সাথে সাথে মোবাইল স্ক্রিনে।</span>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="p-3 rounded-3 bg-light border h-100 d-flex align-items-start gap-2.5">
              <Smartphone size={20} className="text-primary flex-shrink-0 mt-1" />
              <div>
                <strong className="d-block text-dark small fw-bold">হোম স্ক্রিন অ্যাপ আইকন (Native App Experience)</strong>
                <span className="text-muted fs-8">সাধারণ অ্যান্ড্রয়েড অ্যাপের মতো ফুলস্ক্রিন ও হোম স্ক্রিন শর্টকাট থেকে এক ট্যাপে প্রবেশ।</span>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="p-3 rounded-3 bg-light border h-100 d-flex align-items-start gap-2.5">
              <ShieldCheck size={20} className="text-success flex-shrink-0 mt-1" />
              <div>
                <strong className="d-block text-dark small fw-bold">গুগল ড্রাইভ ও নিরাপদ ক্লাউড (Auto Cloud Sync)</strong>
                <span className="text-muted fs-8">শিক্ষকদের তৈরিকৃত পাঠ পরিকল্পনা ও ফাইল সরাসরি কেন্দ্রীয় ড্রাইভে সিঙ্ক ও ব্যাকআপ।</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Step-by-Step Installation Guide */}
        <h6 className="fw-bold text-dark mb-3">
          সহজ ইনস্টলেশন নির্দেশিকা (How to Install manually)
        </h6>

        <div className="p-3 rounded-3 bg-light border mb-2">
          <div className="fw-bold text-primary mb-2 d-flex align-items-center gap-2">
            <MoreVertical size={16} />
            <span>অ্যান্ড্রয়েড ফোন (Google Chrome / Brave / Edge):</span>
          </div>
          <ol className="small mb-0 ps-3 text-secondary space-y-1">
            <li className="mb-1">ব্রাউজারের উপরে ডানদিকের <strong>৩ ডট মেনু (⋮)</strong> বাটনে চাপ দিন।</li>
            <li className="mb-1">মেনু তালিকা থেকে <strong>"Install app"</strong> অথবা <strong>"Add to Home screen" (হোম স্ক্রিনে যোগ করুন)</strong> বাটনে চাপ দিন।</li>
            <li>কনফার্মেশন পপআপে <strong>"Install"</strong> বাটনে চাপলেই আপনার মোবাইলের অ্যাপ ড্রয়ারে আইকন যুক্ত হয়ে যাবে!</li>
          </ol>
        </div>

        <div className="p-3 rounded-3 bg-light border">
          <div className="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
            <Share size={16} className="text-info" />
            <span>আইফোন / আইপ্যাড (Apple Safari):</span>
          </div>
          <ol className="small mb-0 ps-3 text-secondary space-y-1">
            <li className="mb-1">Safari ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার)</strong> আইকনে ট্যাপ করুন।</li>
            <li>তালিকায় স্ক্রোল করে <strong>'Add to Home Screen' (হোম স্ক্রিনে যোগ করুন)</strong> চাপ দিন এবং উপরে 'Add' এ ট্যাপ করুন।</li>
          </ol>
        </div>
      </Modal.Body>

      <Modal.Footer className="bg-light d-flex justify-content-between">
        <Button variant="secondary" size="sm" onClick={onHide}>
          বন্ধ করুন (Close)
        </Button>
        {!isInstalled && (
          <Button
            variant="primary"
            size="sm"
            className="fw-bold d-flex align-items-center gap-2 px-3"
            onClick={handleInstall}
          >
            <Download size={15} />
            <span>{hasNativePrompt ? 'ইনস্টল বাটনে চাপুন' : 'অ্যাপ ইনস্টল করুন'}</span>
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};