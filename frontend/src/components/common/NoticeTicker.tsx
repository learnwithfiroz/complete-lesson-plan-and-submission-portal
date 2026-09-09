import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../../locales/i18n';
import { noticeApi } from '../../api/notices';
import type { Notice } from '../../types/notice';
import { NoticeDetailModal } from '../notices/NoticeDetailModal';
import { triggerNoticeAlert } from '../../utils/alertNotifications';
import { Megaphone, Pause, Play, Pin, Paperclip, BellRing } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NoticeTicker: React.FC = () => {
  const { language } = useTranslation();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const knownNoticeIdsRef = useRef<Set<number>>(new Set());
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    loadTicker();
    const interval = setInterval(loadTicker, 10000); // Fast live poll every 10s

    const handleUpdate = () => {
      loadTicker();
    };

    // 1. Same-tab custom event
    window.addEventListener('notices-updated', handleUpdate);

    // 2. Cross-tab BroadcastChannel
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel('bsisc_notices_channel');
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'notices-updated') {
            loadTicker();
          }
        };
      }
    } catch {
      // fallback to storage
    }

    // 3. Storage event fallback
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bsisc_notices_last_update') {
        loadTicker();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notices-updated', handleUpdate);
      window.removeEventListener('storage', handleStorage);
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, []);

  const loadTicker = async () => {
    try {
      const res = await noticeApi.getLiveTicker();
      const list = Array.isArray(res.data) ? res.data : [];
      setNotices(list);

      // Check for new notices to trigger mobile vibration & chime
      if (!isInitialLoadRef.current && list.length > 0) {
        const freshNotices = list.filter((n) => !knownNoticeIdsRef.current.has(n.id));
        if (freshNotices.length > 0) {
          triggerNoticeAlert(freshNotices[0]);
        }
      }

      // Update known IDs
      knownNoticeIdsRef.current = new Set(list.map((n) => n.id));
      isInitialLoadRef.current = false;
    } catch {
      // silent
    }
  };

  const handleOpenNotice = (n: Notice) => {
    setSelectedNotice(n);
    // Mark as read in backend
    noticeApi.markNoticeAsRead(n.id).catch(() => {});
  };

  if (!notices || notices.length === 0) {
    return null;
  }

  // Duplicate notices for seamless infinite marquee loop
  const marqueeItems = notices.length > 0 ? [...notices, ...notices] : [];
  // Calculate dynamic duration based on count (e.g. 15s per notice set, min 25s)
  const scrollDuration = Math.max(25, notices.length * 15);

  return (
    <>
      <div
        className="live-notice-ticker bg-dark text-white d-flex align-items-center justify-content-between shadow-sm"
        style={{ height: '40px', zIndex: 1020 }}
      >
        {/* Left Side: Pulsing Institutional Badge */}
        <div className="ticker-label-badge d-flex align-items-center flex-shrink-0 px-2.5 px-md-3 py-1 bg-danger text-white h-100 shadow-sm">
          <span className="spinner-grow spinner-grow-sm text-light me-1.5" style={{ width: '7px', height: '7px' }} />
          <Megaphone size={14} className="me-1.5" />
          <span className="fw-bold text-uppercase tracking-wider small d-none d-sm-inline" style={{ fontSize: '11.5px', letterSpacing: '0.05em' }}>
            {language === 'bn' ? 'লাইভ ঘোষণা' : 'LIVE NOTICES'}
          </span>
          <span className="fw-bold text-uppercase tracking-wider small d-inline d-sm-none" style={{ fontSize: '11px' }}>
            {language === 'bn' ? 'নোটিশ' : 'NOTICES'}
          </span>
        </div>

        {/* Center: Infinite Continuous Scrolling Marquee Track */}
        <div
          className="ticker-marquee-wrapper flex-grow-1 overflow-hidden position-relative h-100 d-flex align-items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div
            className={`ticker-marquee-content ${isPaused ? 'paused' : ''}`}
            style={{ animationDuration: `${scrollDuration}s` }}
          >
            {marqueeItems.map((notice, idx) => {
              const title = language === 'bn' 
                ? (notice.title_bn || notice.title_en) 
                : (notice.title_en || notice.title_bn);

              return (
                <div
                  key={`${notice.id}-${idx}`}
                  className="ticker-item d-inline-flex align-items-center"
                  onClick={() => handleOpenNotice(notice)}
                  title="ক্লিক করে সম্পূর্ণ নোটিশটি পড়ুন (Click to read details)"
                >
                  {/* Pinned Icon */}
                  {notice.is_pinned && (
                    <Pin size={12} className="text-warning me-1 flex-shrink-0" fill="#f59e0b" />
                  )}

                  {/* Priority Tag */}
                  {notice.priority === 'urgent' && (
                    <span className="badge bg-danger text-white py-0.5 px-1.5 me-1.5 font-monospace" style={{ fontSize: '10px' }}>
                      ⚡ {language === 'bn' ? 'জরুরি' : 'URGENT'}
                    </span>
                  )}
                  {notice.priority === 'high' && (
                    <span className="badge bg-warning text-dark py-0.5 px-1.5 me-1.5 font-monospace" style={{ fontSize: '10px' }}>
                      {language === 'bn' ? 'গুরুত্বপূর্ণ' : 'HIGH'}
                    </span>
                  )}

                  {/* Category Tag */}
                  <span className="badge bg-secondary bg-opacity-75 text-white py-0.5 px-1.5 me-1.5 text-uppercase" style={{ fontSize: '9.5px' }}>
                    {notice.category}
                  </span>

                  {/* Notice Title */}
                  <span className="ticker-text fw-medium text-light me-1" style={{ fontSize: '12.5px' }}>
                    {title}
                  </span>

                  {/* Attachment indicator */}
                  {notice.attachment_name && (
                    <Paperclip size={11} className="text-info me-1 flex-shrink-0" />
                  )}

                  {/* Date */}
                  <span className="text-white-50 font-monospace me-3" style={{ fontSize: '11px' }}>
                    ({new Date(notice.publish_date || notice.created_at).toLocaleDateString('en-GB')})
                  </span>

                  {/* Institutional Separator Bullet */}
                  <span className="ticker-separator text-warning mx-2 opacity-75">✦</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Quick Action Controls */}
        <div className="ticker-controls d-flex align-items-center px-2 gap-1 flex-shrink-0 bg-dark h-100 border-start border-secondary">
          {/* Pause / Resume Button */}
          <button
            type="button"
            className="btn btn-sm btn-link text-white-50 p-1 text-decoration-none hover-light"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'স্ক্রোল চালু করুন (Resume)' : 'স্ক্রোল থামান (Pause)'}
            aria-label="Pause/Resume scrolling"
          >
            {isPaused ? <Play size={13} className="text-warning" /> : <Pause size={13} />}
          </button>

          {/* View All Notices Link */}
          <Link
            to="/notices"
            className="btn btn-sm btn-outline-warning py-0.5 px-2 d-none d-md-inline-flex align-items-center text-decoration-none fw-semibold"
            style={{ fontSize: '11px' }}
            title="সকল নোটিশ দেখুন"
          >
            <BellRing size={11} className="me-1" />
            {language === 'bn' ? 'সব নোটিশ' : 'All'}
          </Link>
        </div>
      </div>

      {/* Notice Detail Modal */}
      <NoticeDetailModal
        show={!!selectedNotice}
        notice={selectedNotice}
        onHide={() => setSelectedNotice(null)}
      />
    </>
  );
};