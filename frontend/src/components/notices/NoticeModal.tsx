import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import type { Notice, NoticeFormData, NoticeCategory, NoticePriority, NoticeTargetAudience } from '../../types/notice';
import { noticeApi } from '../../api/notices';
import { toast } from 'react-toastify';
import { X, Pin, AlertCircle } from 'lucide-react';

interface NoticeModalProps {
  show: boolean;
  notice?: Notice | null;
  onHide: () => void;
  onSuccess: () => void;
}

export const NoticeModal: React.FC<NoticeModalProps> = ({ show, notice, onHide, onSuccess }) => {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<NoticeFormData>({
    title_bn: '',
    title_en: '',
    content_bn: '',
    content_en: '',
    category: 'general',
    priority: 'normal',
    target_audience: 'all',
    is_pinned: false,
    is_published: true,
    publish_date: '',
    expiry_date: '',
    attachment: null,
    remove_attachment: false,
  });

  useEffect(() => {
    if (notice) {
      setForm({
        title_bn: notice.title_bn || '',
        title_en: notice.title_en || '',
        content_bn: notice.content_bn || '',
        content_en: notice.content_en || '',
        category: notice.category || 'general',
        priority: notice.priority || 'normal',
        target_audience: notice.target_audience || 'all',
        is_pinned: notice.is_pinned || false,
        is_published: notice.is_published ?? true,
        publish_date: notice.publish_date ? notice.publish_date.substring(0, 10) : '',
        expiry_date: notice.expiry_date ? notice.expiry_date.substring(0, 10) : '',
        attachment: null,
        remove_attachment: false,
      });
    } else {
      setForm({
        title_bn: '',
        title_en: '',
        content_bn: '',
        content_en: '',
        category: 'academic',
        priority: 'normal',
        target_audience: 'all',
        is_pinned: false,
        is_published: true,
        publish_date: new Date().toISOString().substring(0, 10),
        expiry_date: '',
        attachment: null,
        remove_attachment: false,
      });
    }
    setError(null);
  }, [notice, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title_en.trim() || !form.title_bn.trim()) {
      setError(t('notices.title_required', 'Both Bangla and English titles are required.'));
      return;
    }
    if (!form.content_en.trim() || !form.content_bn.trim()) {
      setError(t('notices.content_required', 'Both Bangla and English contents are required.'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const data = new FormData();
      data.append('title_bn', form.title_bn);
      data.append('title_en', form.title_en);
      data.append('content_bn', form.content_bn);
      data.append('content_en', form.content_en);
      data.append('category', form.category);
      data.append('priority', form.priority);
      data.append('target_audience', form.target_audience);
      data.append('is_pinned', form.is_pinned ? '1' : '0');
      data.append('is_published', form.is_published ? '1' : '0');
      if (form.publish_date) data.append('publish_date', form.publish_date);
      if (form.expiry_date) data.append('expiry_date', form.expiry_date);

      if (form.attachment) {
        data.append('attachment', form.attachment);
      }
      if (form.remove_attachment) {
        data.append('remove_attachment', '1');
      }

      if (notice) {
        await noticeApi.updateNotice(notice.id, data);
        toast.success(t('notices.updated_success', 'Notice updated successfully'));
      } else {
        await noticeApi.createNotice(data);
        toast.success(t('notices.created_success', 'Notice published successfully'));
      }

      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save notice. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          {notice ? t('notices.edit_notice', 'Edit Official Notice') : t('notices.create_notice', 'Publish Official Notice / Announcement')}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="d-flex align-items-center gap-2">
              <AlertCircle size={18} />
              <div>{error}</div>
            </Alert>
          )}

          {/* Bilingual Title */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  {t('notices.title_bn', 'Title (বাংলা)')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="যেমন: ১ম সাময়িক পরীক্ষার পাঠ পরিকল্পনা জমাদান প্রসঙ্গে"
                  value={form.title_bn}
                  onChange={(e) => setForm({ ...form, title_bn: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  {t('notices.title_en', 'Title (English)')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Term 1 Lesson Plan Submission Guidelines"
                  value={form.title_en}
                  onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Category, Priority, Target Audience */}
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('notices.category', 'Category')}</Form.Label>
                <Form.Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as NoticeCategory })}
                >
                  <option value="academic">Academic (একাডেমিক)</option>
                  <option value="curriculum">Curriculum (পাঠ্যক্রম)</option>
                  <option value="urgent">Urgent / Alert (জরুরি)</option>
                  <option value="exam">Examinations (পরীক্ষা)</option>
                  <option value="administrative">Administrative (প্রশাসনিক)</option>
                  <option value="general">General (সাধারণ)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('notices.priority', 'Priority Level')}</Form.Label>
                <Form.Select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as NoticePriority })}
                >
                  <option value="urgent">🔴 Urgent (সর্বোচ্চ জরুরি)</option>
                  <option value="high">🟠 High (উচ্চ অগ্রাধিকার)</option>
                  <option value="normal">🔵 Normal (সাধারণ)</option>
                  <option value="low">⚪ Low (স্বাভাবিক)</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('notices.audience', 'Target Audience')}</Form.Label>
                <Form.Select
                  value={form.target_audience}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value as NoticeTargetAudience })}
                >
                  <option value="all">All Faculty & Staff (সকলের জন্য)</option>
                  <option value="teachers">Subject Teachers Only (শুধুমাত্র শিক্ষকবৃন্দ)</option>
                  <option value="coordinators">Coordinators & Dept Heads (সমন্বয়কবৃন্দ)</option>
                  <option value="principal">Principal & Leadership (অধ্যক্ষ ও পরিচালনা)</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Bilingual Content */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  {t('notices.content_bn', 'Notice Details (বাংলা)')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="নোটিশের বিস্তারিত বিবরণ বাংলায় লিখুন..."
                  value={form.content_bn}
                  onChange={(e) => setForm({ ...form, content_bn: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">
                  {t('notices.content_en', 'Notice Details (English)')} <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder="Write full notice description in English..."
                  value={form.content_en}
                  onChange={(e) => setForm({ ...form, content_en: e.target.value })}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Dates & Pinning Options */}
          <Row className="g-3 mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('notices.publish_date', 'Publish Date')}</Form.Label>
                <Form.Control
                  type="date"
                  value={form.publish_date}
                  onChange={(e) => setForm({ ...form, publish_date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('notices.expiry_date', 'Expiry Date (Optional)')}</Form.Label>
                <Form.Control
                  type="date"
                  value={form.expiry_date}
                  onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <div className="pt-4">
                <Form.Check
                  type="switch"
                  id="is_pinned_switch"
                  label={
                    <span className="fw-semibold d-inline-flex align-items-center gap-1">
                      <Pin size={14} className="text-warning" /> {t('notices.pin_to_top', 'Pin to Live Ticker & Top')}
                    </span>
                  }
                  checked={form.is_pinned}
                  onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
                />
                <Form.Check
                  type="switch"
                  id="is_published_switch"
                  label={t('notices.publish_now', 'Publish Immediately')}
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="mt-2"
                />
              </div>
            </Col>
          </Row>

          {/* File Attachment */}
          <Form.Group className="mb-2">
            <Form.Label className="fw-semibold small">{t('notices.attachment', 'Attach File (PDF, Word, Images max 10MB)')}</Form.Label>
            {notice?.attachment_name && !form.remove_attachment && (
              <div className="d-flex align-items-center gap-2 mb-2 p-2 bg-light rounded border">
                <span className="small text-muted">{notice.attachment_name}</span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="py-0 px-2"
                  onClick={() => setForm({ ...form, remove_attachment: true })}
                >
                  <X size={12} /> Remove
                </Button>
              </div>
            )}
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={(e: any) => {
                if (e.target.files && e.target.files[0]) {
                  setForm({ ...form, attachment: e.target.files[0], remove_attachment: false });
                }
              }}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-top">
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? t('common.saving', 'Saving...') : notice ? t('common.save', 'Save Changes') : t('notices.publish_btn', 'Publish Notice')}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};