import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { Download, X, Share } from 'lucide-react';
import { useTranslation } from '../../locales/i18n';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const { language } = useTranslation();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed previously in this session
    if (sessionStorage.getItem('pwa_prompt_dismissed') === 'true') {
      setIsDismissed(true);
    }

    // Check iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  // Show only if install prompt is available or on iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <div
      className="pwa-install-banner position-fixed bottom-0 start-50 translate-middle-x p-2 mb-2 mb-md-3 shadow-lg rounded-4"
      style={{
        zIndex: 1060,
        width: 'calc(100% - 24px)',
        maxWidth: '560px',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: '#ffffff',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}
    >
      <div className="d-flex align-items-center justify-content-between p-2">
        <div className="d-flex align-items-center gap-3">
          <img
            src="/logo.png"
            alt="BSISC Logo"
            className="rounded-3 bg-white p-1 shadow-sm"
            style={{ width: '42px', height: '42px', objectFit: 'contain' }}
          />
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold fs-7 leading-tight">BSISC Lesson Plan App</span>
              <Badge bg="warning" text="dark" className="fs-9 py-0.5 px-1.5 fw-semibold">
                PWA
              </Badge>
            </div>
            <div className="text-white-50 fs-8 leading-tight mt-0.5">
              {language === 'bn'
                ? 'হোম স্ক্রিনে ১ ক্লিকে ইনস্টল করুন ও সহজে ব্যবহার করুন'
                : 'Install on Home Screen for 1-click easy access'}
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="warning"
            size="sm"
            className="fw-bold text-dark d-flex align-items-center gap-1.5 rounded-3 py-1.5 px-3 fs-8 shadow-sm"
            onClick={handleInstallClick}
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

      {/* iOS Instructions Dropdown */}
      {showIosGuide && (
        <div className="border-top border-white-50 pt-2 mt-2 px-2 fs-8 text-white-50">
          <div className="d-flex align-items-center gap-1.5 text-warning fw-semibold mb-1">
            <Share size={14} />
            <span>iPhone / iPad এ ইনস্টল করার নিয়ম:</span>
          </div>
          <div>
            Safari ব্রাউজারের নিচে থাকা <strong>Share (শেয়ার)</strong> বাটনে ট্যাপ করুন এবং{' '}
            <strong>'Add to Home Screen'</strong> নির্বাচন করুন।
          </div>
        </div>
      )}
    </div>
  );
};