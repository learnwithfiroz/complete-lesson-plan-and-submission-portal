import React from 'react';
import { Globe, Clock, CheckCircle2, Copy, Check } from 'lucide-react';
import { useLiveSystemInfo } from '../../hooks/useLiveSystemInfo';
import { useTranslation } from '../../locales/i18n';

interface LiveSystemBadgeProps {
  variant?: 'header' | 'login' | 'footer' | 'pill' | 'compact';
  showDate?: boolean;
  showStatus?: boolean;
  className?: string;
}

export const LiveSystemBadge: React.FC<LiveSystemBadgeProps> = ({
  variant = 'pill',
  showDate = true,
  showStatus = true,
  className = '',
}) => {
  const { ip, timeString, dateString, copied, copyIp } = useLiveSystemInfo();
  const { language } = useTranslation();

  if (variant === 'header') {
    return (
      <div className={`d-flex align-items-center gap-1.5 gap-md-2 flex-wrap ${className}`}>
        {/* BD Time Live Clock */}
        <div 
          className="d-flex align-items-center bg-light border border-secondary-subtle px-2 px-sm-2.5 py-1 rounded-pill shadow-xs"
          style={{ fontSize: '0.75rem' }}
          title={language === 'bn' ? 'বাংলাদেশ সময় (BST UTC+6)' : 'Bangladesh Standard Time (BST UTC+6)'}
        >
          <Clock size={13} className="text-primary me-1 flex-shrink-0" />
          <span className="fw-bold font-monospace text-dark text-nowrap">{timeString}</span>
          <span className="badge bg-primary-subtle text-primary ms-1 d-none d-lg-inline py-0.5 px-1.5" style={{ fontSize: '9px' }}>
            BD TIME
          </span>
        </div>

        {/* IP Address Pill */}
        <div 
          className="d-flex align-items-center bg-light border border-secondary-subtle px-2 px-sm-2.5 py-1 rounded-pill shadow-xs cursor-pointer user-select-all"
          style={{ fontSize: '0.75rem' }}
          onClick={copyIp}
          title={language === 'bn' ? 'আপনার বর্তমান আইপি অ্যাড্রেস (ক্লিক করে কপি করুন)' : 'Your Current IP Address (Click to copy)'}
        >
          <Globe size={13} className="text-success me-1 flex-shrink-0" />
          <span className="text-muted me-1 d-none d-md-inline">{language === 'bn' ? 'আইপি:' : 'IP:'}</span>
          <span className="fw-semibold font-monospace text-dark text-nowrap">{ip}</span>
          {copied ? (
            <Check size={12} className="text-success ms-1 flex-shrink-0" />
          ) : (
            <Copy size={11} className="text-muted ms-1 flex-shrink-0 opacity-50 d-none d-sm-inline" />
          )}
        </div>
      </div>
    );
  }

  if (variant === 'login') {
    return (
      <div className={`w-100 rounded-3 p-2 p-sm-2.5 bg-white bg-opacity-95 shadow-sm border ${className}`}>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 text-dark small">
          {/* BD Live Time */}
          <div className="d-flex align-items-center gap-1.5">
            <span className="badge bg-primary text-white d-flex align-items-center px-2 py-1 rounded-pill">
              <Clock size={12} className="me-1" />
              <span>{language === 'bn' ? 'বাংলাদেশ সময়' : 'BD Time'}</span>
            </span>
            <span className="fw-bold font-monospace text-primary text-nowrap" style={{ fontSize: '0.85rem' }}>
              {timeString}
            </span>
            {showDate && (
              <span className="text-muted d-none d-sm-inline font-monospace" style={{ fontSize: '0.75rem' }}>
                • {dateString}
              </span>
            )}
          </div>

          {/* Client IP Address */}
          <div 
            className="d-flex align-items-center gap-1 bg-light border px-2.5 py-1 rounded-pill cursor-pointer"
            onClick={copyIp}
            title={language === 'bn' ? 'আপনার আইপি অ্যাড্রেস (কপি করতে ক্লিক করুন)' : 'Your IP Address (Click to copy)'}
          >
            <Globe size={13} className="text-success" />
            <span className="text-secondary small">{language === 'bn' ? 'আপনার আইপি:' : 'Your IP:'}</span>
            <span className="fw-bold font-monospace text-dark" style={{ fontSize: '0.8rem' }}>{ip}</span>
            {copied && <span className="badge bg-success py-0 px-1 text-white ms-1" style={{ fontSize: '9px' }}>Copied</span>}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className={`d-flex align-items-center justify-content-center justify-content-md-between flex-wrap gap-2 text-muted px-2 py-1.5 ${className}`} style={{ fontSize: '0.75rem' }}>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span className="d-flex align-items-center text-dark">
            <Clock size={13} className="text-primary me-1" />
            <strong className="me-1">{language === 'bn' ? 'বাংলাদেশ সময়:' : 'BST (BD Time):'}</strong>
            <span className="font-monospace fw-semibold">{timeString}</span>
          </span>
          {showDate && <span className="d-none d-sm-inline">• {dateString}</span>}
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <span 
            className="d-flex align-items-center text-dark cursor-pointer bg-light border px-2 py-0.5 rounded-pill"
            onClick={copyIp}
            title="Click to copy IP"
          >
            <Globe size={12} className="text-success me-1" />
            <span className="text-muted me-1">{language === 'bn' ? 'ক্লায়েন্ট আইপি:' : 'Client IP:'}</span>
            <span className="font-monospace fw-bold">{ip}</span>
            {copied && <Check size={11} className="text-success ms-1" />}
          </span>

          {showStatus && (
            <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill d-flex align-items-center py-1 px-2">
              <CheckCircle2 size={11} className="me-1" />
              {language === 'bn' ? 'সিস্টেম অনলাইন' : 'System Online'}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default Pill Variant
  return (
    <div className={`d-inline-flex align-items-center gap-2 bg-white border shadow-xs px-3 py-1.5 rounded-pill flex-wrap ${className}`} style={{ fontSize: '0.78rem' }}>
      <div className="d-flex align-items-center">
        <Clock size={13} className="text-primary me-1" />
        <span className="fw-bold font-monospace text-dark">{timeString}</span>
      </div>
      <span className="text-muted opacity-50">•</span>
      <div 
        className="d-flex align-items-center cursor-pointer"
        onClick={copyIp}
        title="Click to copy IP"
      >
        <Globe size={13} className="text-success me-1" />
        <span className="text-muted me-1">IP:</span>
        <span className="font-monospace fw-semibold text-dark">{ip}</span>
        {copied && <Check size={12} className="text-success ms-1" />}
      </div>
    </div>
  );
};