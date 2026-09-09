import React, { useEffect, useState } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { useAuthStore } from '../../store/authStore';
import { noticeApi } from '../../api/notices';
import type { Notice } from '../../types/notice';
import { NoticeReadersModal } from './NoticeReadersModal';
import {
  Pin,
  Calendar,
  User,
  Download,
  AlertTriangle,
  Info,
  Clock,
  FileText,
  Users
} from 'lucide-react';

interface NoticeDetailModalProps {
  show: boolean;
  notice: Notice | null;
  onHide: () => void;
  onOpenReaders?: (noticeId: number) => void;
}

export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({ show, notice, onHide, onOpenReaders }) => {
  const { language, t } = useTranslation();
  const { user, hasRole } = useAuthStore();
  const [showReadersModal, setShowReadersModal] = useState(false);

  const canViewReaders = hasRole(['super_admin', 'principal', 'academic_coordinator']) || notice?.created_by === user?.id;

  useEffect(() => {
    if (show && notice?.id) {
      noticeApi.markNoticeAsRead(notice.id).catch(() => {});
    }
  }, [show, notice?.id]);

  if (!notice) return null;

  const title = language === 'bn' ? (notice.title_bn || notice.title_en) : (notice.title_en || notice.title_bn);
  const content = language === 'bn' ? (notice.content_bn || notice.content_en) : (notice.content_en || notice.content_bn);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge bg="danger" className="d-inline-flex align-items-center gap-1"><AlertTriangle size={12} /> {t('notices.priority_urgent', 'URGENT')}</Badge>;
      case 'high':
        return <Badge bg="warning" text="dark" className="d-inline-flex align-items-center gap-1"><AlertTriangle size={12} /> {t('notices.priority_high', 'HIGH')}</Badge>;
      case 'normal':
        return <Badge bg="primary" className="d-inline-flex align-items-center gap-1"><Info size={12} /> {t('notices.priority_normal', 'NORMAL')}</Badge>;
      default:
        return <Badge bg="secondary" className="d-inline-flex align-items-center gap-1">{t('notices.priority_low', 'LOW')}</Badge>;
    }
  };

  const getCategoryBadge = (cat: string) => {
    const colors: Record<string, string> = {
      academic: 'info',
      curriculum: 'success',
      urgent: 'danger',
      exam: 'warning',
      administrative: 'dark',
      general: 'secondary',
    };
    return <Badge bg={colors[cat] || 'secondary'} className="text-uppercase">{cat}</Badge>;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {notice.is_pinned && (
            <Badge bg="warning" text="dark" className="d-inline-flex align-items-center gap-1 shadow-xs">
              <Pin size={12} /> {t('notices.pinned', 'PINNED')}
            </Badge>
          )}
          {getPriorityBadge(notice.priority)}
          {getCategoryBadge(notice.category)}
          <Badge bg="light" text="dark" className="border d-inline-flex align-items-center gap-1">
            <Users size={12} /> {t('notices.audience', 'Audience')}: {(notice.target_audience || 'all').toUpperCase()}
          </Badge>
        </div>
      </Modal.Header>

      <Modal.Body className="p-4">
        <h4 className="fw-bold text-dark mb-3 leading-tight">{title}</h4>

        {/* Alternate language toggle preview if available */}
        {notice.title_bn && notice.title_en && (
          <div className="p-2 mb-3 bg-light rounded border-start border-3 border-primary small text-muted">
            <span className="fw-semibold">{language === 'bn' ? 'English:' : 'বাংলা:'} </span>
            {language === 'bn' ? notice.title_en : notice.title_bn}
          </div>
        )}

        <div className="notice-body-content text-secondary my-4 p-3 bg-light rounded" style={{ whiteSpace: 'pre-line', fontSize: '15px', lineHeight: '1.7' }}>
          {content}
        </div>

        {/* Attachment Card */}
        {notice.attachment_name && (
          <div className="card border-primary border-dashed p-3 mb-4 bg-primary-subtle">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2">
                <FileText size={24} className="text-primary" />
                <div>
                  <div className="fw-semibold text-dark">{notice.attachment_name}</div>
                  <small className="text-muted">Official Document / Resource Attachment</small>
                </div>
              </div>
              <a
                href={`/api/v1/notices/${notice.id}/attachment`}
                target="_blank"
                rel="noreferrer"
                download
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm"
              >
                <Download size={14} /> {t('notices.download_attachment', 'Download Attachment')}
              </a>
            </div>
          </div>
        )}

        {/* Metadata Footer */}
        <div className="d-flex flex-wrap align-items-center justify-content-between text-muted small border-top pt-3 mt-3 gap-2">
          <div className="d-flex align-items-center gap-3">
            <span className="d-flex align-items-center gap-1">
              <User size={14} className="text-secondary" />
              <strong>{notice.creator?.name || 'BSISC Administration'}</strong>
              {notice.creator?.designation ? ` (${notice.creator.designation})` : ''}
            </span>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="d-flex align-items-center gap-1">
              <Calendar size={14} className="text-secondary" />
              {notice.publish_date ? new Date(notice.publish_date).toLocaleDateString('en-GB') : new Date(notice.created_at).toLocaleDateString('en-GB')}
            </span>
            {notice.expiry_date && (
              <span className="d-flex align-items-center gap-1 text-danger">
                <Clock size={14} /> Exp: {new Date(notice.expiry_date).toLocaleDateString('en-GB')}
              </span>
            )}
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top d-flex justify-content-between">
        <div>
          {canViewReaders && (
            <Button
              variant="outline-primary"
              size="sm"
              className="d-inline-flex align-items-center gap-1.5 rounded-3 fw-semibold fs-7"
              onClick={() => {
                if (onOpenReaders) {
                  onOpenReaders(notice.id);
                } else {
                  setShowReadersModal(true);
                }
              }}
            >
              <Users size={16} />
              <span>পাঠক বিবরণী (Readers & Receipts)</span>
            </Button>
          )}
        </div>
        <Button variant="secondary" onClick={onHide} className="rounded-3 px-3">
          {t('common.close', 'Close')}
        </Button>
      </Modal.Footer>

      {/* Standalone Readers Modal if not opened from parent */}
      <NoticeReadersModal
        show={showReadersModal}
        noticeId={notice?.id || null}
        onHide={() => setShowReadersModal(false)}
      />
    </Modal>
  );
};