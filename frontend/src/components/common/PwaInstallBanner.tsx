import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Download, X } from 'lucide-react';
import { useTranslation } from '../../locales/i18n';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { PwaInstallModal } from './PwaInstallModal';

export const PwaInstallBanner: React.FC = () => {
  const { language } = useTranslation();
  const { isInstalled, isModalOpen, openInstallModal, closeInstallModal, promptInstall } = usePwaInstall();
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return sessionStorage.getItem('pwa_prompt_dismissed') === 'true';
  });

  // Auto-hide banner after 1 minute (60,000ms)
  useEffect(() => {
    if (isInstalled || isDismissed) return;

    const timer = setTimeout(() => {
      setIsDismissed(true);
    }, 60000); // 1 minute auto-hide

    return () => clearTimeout(timer);
  }, [isInstalled, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    const success = await promptInstall();
    if (!success) {
      openInstallModal();
    }
  };

  if (isInstalled || isDismissed) {
    return <PwaInstallModal show={isModalOpen} onHide={closeInstallModal} />;
  }

  return (
    <>
      <div
        className="pwa-install-banner position-fixed bottom-0 start-50 translate-middle-x p-2 mb-2 mb-md-3 shadow-lg rounded-4"
        style={{
          zIndex: 1060,
          width: 'calc(100% - 24px)',
          maxWidth: '560px',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="d-flex align-items-center justify-content-between p-2">
          <div className="d-flex align-items-center gap-2.5 cursor-pointer" onClick={openInstallModal}>
            <img
              src="/icon-192.png"
              alt="BSISC Logo"
              className="rounded-3 bg-white p-1 shadow-sm flex-shrink-0"
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
            />
            <div>
              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                <span className="fw-bold fs-7 leading-tight">BSISC Official App</span>
                <Badge bg="warning" text="dark" className="fs-9 py-0.5 px-1.5 fw-semibold">
                  ANDROID
                </Badge>
              </div>
              <div className="text-white-50 fs-8 leading-tight mt-0.5">
                {language === 'bn'
                  ? 'হোম স্ক্রিনে সরাসরি ইনস্টল করে অ্যাপের মতো চালান'
                  : 'Install on Home Screen for direct app experience'}
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
            <Button
              variant="warning"
              size="sm"
              className="fw-bold text-dark d-flex align-items-center gap-1.5 rounded-3 py-1.5 px-2.5 fs-8 shadow-sm"
              onClick={handleInstallClick}
              title="ইনস্টল করুন"
            >
              <Download size={14} />
              <span>{language === 'bn' ? 'ইনস্টল' : 'Install'}</span>
            </Button>

            <button
              type="button"
              className="btn btn-link text-white-50 p-1 text-decoration-none hover-light"
              onClick={handleDismiss}
              aria-label="Dismiss banner"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <PwaInstallModal show={isModalOpen} onHide={closeInstallModal} />
    </>
  );
};