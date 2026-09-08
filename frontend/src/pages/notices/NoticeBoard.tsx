import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Form, Badge, Table, InputGroup } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { useAuthStore } from '../../store/authStore';
import { noticeApi } from '../../api/notices';
import type { Notice } from '../../types/notice';
import { NoticeDetailModal } from '../../components/notices/NoticeDetailModal';
import { NoticeModal } from '../../components/notices/NoticeModal';
import { NoticeReadersModal } from '../../components/notices/NoticeReadersModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Pagination } from '../../components/common/Pagination';
import { toast } from 'react-toastify';
import {
  Megaphone,
  Plus,
  Search,
  Pin,
  Calendar,
  User,
  Paperclip,
  Trash2,
  Edit,
  Grid,
  List,
  Eye,
  AlertTriangle,
  Info,
  Users
} from 'lucide-react';

export const NoticeBoard: React.FC = () => {
  const { language, t } = useTranslation();
  const { hasRole } = useAuthStore();
  const canManage = hasRole(['super_admin', 'principal', 'academic_coordinator']);

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filters
  const [category, setCategory] = useState<string>('all');
  const [priority, setPriority] = useState<string>('all');
  const [audience, setAudience] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalRecords, setTotalRecords] = useState<number>(0);

  // Modals
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [editNotice, setEditNotice] = useState<Notice | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [deleteNoticeId, setDeleteNoticeId] = useState<number | null>(null);
  const [readersNoticeId, setReadersNoticeId] = useState<number | null>(null);

  useEffect(() => {
    loadNotices();
  }, [category, priority, audience, search, currentPage]);

  const loadNotices = async () => {
    try {
      setLoading(true);
      const res = await noticeApi.getNotices({
        category: category !== 'all' ? category : undefined,
        priority: priority !== 'all' ? priority : undefined,
        target_audience: audience !== 'all' ? audience : undefined,
        search: search.trim() || undefined,
        page: currentPage,
        per_page: 9,
      });
      setNotices(res.data);
      setTotalPages(res.meta.last_page);
      setTotalRecords(res.meta.total);
    } catch (err) {
      console.error('Failed to load notices', err);
      toast.error('Failed to load notices');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await noticeApi.togglePin(id);
      toast.success(res.message);
      loadNotices();
    } catch {
      toast.error('Failed to toggle pin');
    }
  };

  const handleDelete = async () => {
    if (!deleteNoticeId) return;
    try {
      await noticeApi.deleteNotice(deleteNoticeId);
      toast.success(t('notices.deleted_success', 'Notice deleted successfully'));
      setDeleteNoticeId(null);
      loadNotices();
    } catch {
      toast.error('Failed to delete notice');
    }
  };

  const categories: { key: string; labelEn: string; labelBn: string }[] = [
    { key: 'all', labelEn: 'All Categories', labelBn: 'সকল ক্যাটাগরি' },
    { key: 'urgent', labelEn: 'Urgent', labelBn: 'জরুরি' },
    { key: 'academic', labelEn: 'Academic', labelBn: 'একাডেমিক' },
    { key: 'curriculum', labelEn: 'Curriculum', labelBn: 'পাঠ্যক্রম' },
    { key: 'exam', labelEn: 'Examinations', labelBn: 'পরীক্ষা' },
    { key: 'administrative', labelEn: 'Administrative', labelBn: 'প্রশাসনিক' },
    { key: 'general', labelEn: 'General', labelBn: 'সাধারণ' },
  ];

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'urgent':
        return <Badge bg="danger" className="d-inline-flex align-items-center gap-1"><AlertTriangle size={11} /> URGENT</Badge>;
      case 'high':
        return <Badge bg="warning" text="dark" className="d-inline-flex align-items-center gap-1"><AlertTriangle size={11} /> HIGH</Badge>;
      case 'normal':
        return <Badge bg="primary" className="d-inline-flex align-items-center gap-1"><Info size={11} /> NORMAL</Badge>;
      default:
        return <Badge bg="secondary">LOW</Badge>;
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="fw-bold mb-0 text-primary">
              <Megaphone size={24} className="me-2 text-danger" />
              {t('notices.board_title', 'BSISC Live Notice & Announcement Board')}
            </h4>
            <Badge bg="primary" pill>{totalRecords}</Badge>
          </div>
          <span className="text-muted small">
            Official institutional circulars, curriculum directives & academic schedules | Baridhara Scholars' Int. School & College (EIIN: 133988)
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <div className="btn-group btn-group-sm" role="group">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={16} />
            </Button>
          </div>

          {canManage && (
            <Button
              variant="primary"
              size="sm"
              className="d-flex align-items-center gap-1 shadow-sm"
              onClick={() => setShowCreateModal(true)}
            >
              <Plus size={16} /> {t('notices.publish_new', 'Publish Notice')}
            </Button>
          )}
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="d-flex align-items-center gap-2 overflow-x-auto pb-2 mb-3">
        {categories.map((cat) => (
          <Button
            key={cat.key}
            variant={category === cat.key ? 'primary' : 'outline-secondary'}
            size="sm"
            className="rounded-pill px-3 text-nowrap"
            onClick={() => {
              setCategory(cat.key);
              setCurrentPage(1);
            }}
          >
            {language === 'bn' ? cat.labelBn : cat.labelEn}
          </Button>
        ))}
      </div>

      {/* Filter Row */}
      <Card className="border shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-2">
            <Col md={6}>
              <InputGroup size="sm">
                <InputGroup.Text className="bg-white">
                  <Search size={14} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder={t('notices.search_placeholder', 'Search notices by title, keyword, circular #...')}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {search && (
                  <Button variant="outline-secondary" onClick={() => setSearch('')}>
                    ✕
                  </Button>
                )}
              </InputGroup>
            </Col>

            <Col md={3}>
              <Form.Select
                size="sm"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Priorities (সব অগ্রাধিকার)</option>
                <option value="urgent">🔴 Urgent Only</option>
                <option value="high">🟠 High Priority</option>
                <option value="normal">🔵 Normal Priority</option>
                <option value="low">⚪ Low Priority</option>
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Select
                size="sm"
                value={audience}
                onChange={(e) => {
                  setAudience(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Audiences (সকলের জন্য)</option>
                <option value="teachers">Teachers (শিক্ষকবৃন্দ)</option>
                <option value="coordinators">Coordinators (সমন্বয়ক)</option>
                <option value="principal">Leadership (অধ্যক্ষ ও পরিচালনা)</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Notices Content */}
      {loading ? (
        <div className="p-5 text-center text-muted">
          <div className="spinner-border text-primary mb-2" role="status" />
          <div>{t('common.loading', 'Loading notices...')}</div>
        </div>
      ) : notices.length === 0 ? (
        <Card className="border shadow-sm text-center py-5">
          <Card.Body>
            <Megaphone size={48} className="text-muted mb-3 opacity-50" />
            <h5 className="fw-bold">{t('notices.no_notices', 'No Notices Found')}</h5>
            <p className="text-muted small">There are no published circulars or notices matching your active criteria.</p>
            {canManage && (
              <Button variant="outline-primary" size="sm" onClick={() => setShowCreateModal(true)}>
                <Plus size={14} className="me-1" /> {t('notices.publish_first', 'Publish New Notice')}
              </Button>
            )}
          </Card.Body>
        </Card>
      ) : viewMode === 'grid' ? (
        <Row className="g-3 mb-4">
          {notices.map((n) => {
            const title = language === 'bn' ? (n.title_bn || n.title_en) : (n.title_en || n.title_bn);
            const content = language === 'bn' ? (n.content_bn || n.content_en) : (n.content_en || n.content_bn);

            return (
              <Col md={6} lg={4} key={n.id}>
                <Card
                  className={`h-100 shadow-sm border ${n.is_pinned ? 'border-warning border-2' : ''} notice-card transition-all`}
                  style={{ cursor: 'pointer', borderRadius: '8px' }}
                  onClick={() => setSelectedNotice(n)}
                >
                  <Card.Body className="d-flex flex-column p-3">
                    {/* Card Badges Top */}
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex gap-1 flex-wrap">
                        {getPriorityBadge(n.priority)}
                        <Badge bg="light" text="dark" className="border text-uppercase small">
                          {n.category}
                        </Badge>
                      </div>

                      <div className="d-flex align-items-center gap-1">
                        {canManage && (
                          <button
                            className={`btn btn-sm btn-link p-0 ${n.is_pinned ? 'text-warning' : 'text-muted'}`}
                            onClick={(e) => handleTogglePin(n.id, e)}
                            title={n.is_pinned ? 'Unpin' : 'Pin to top'}
                          >
                            <Pin size={16} fill={n.is_pinned ? '#f59e0b' : 'none'} />
                          </button>
                        )}
                        {n.is_pinned && !canManage && (
                          <Pin size={14} className="text-warning" fill="#f59e0b" />
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h6 className="fw-bold text-dark mb-2 leading-tight flex-grow-0" style={{ fontSize: '15px' }}>
                      {title}
                    </h6>

                    {/* Short Description */}
                    <p className="text-muted small mb-3 flex-grow-1" style={{ fontSize: '13px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {content}
                    </p>

                    {/* Attachment preview chip */}
                    {n.attachment_name && (
                      <div className="d-flex align-items-center gap-1 small text-primary mb-2 bg-light p-1 rounded">
                        <Paperclip size={13} />
                        <span className="text-truncate">{n.attachment_name}</span>
                      </div>
                    )}

                    {/* Card Footer Metadata */}
                    <div className="border-top pt-2 mt-auto d-flex justify-content-between align-items-center text-muted small">
                      <div className="d-flex align-items-center gap-1 text-truncate me-2" style={{ maxWidth: '60%' }}>
                        <User size={13} />
                        <span className="text-truncate">{n.creator?.name || 'BSISC Admin'}</span>
                      </div>
                      <div className="d-flex align-items-center gap-1 flex-shrink-0">
                        <Calendar size={13} />
                        <span>{new Date(n.publish_date || n.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                    </div>

                    {/* Management actions */}
                    {canManage && (
                      <div className="border-top pt-2 mt-2 d-flex justify-content-end gap-1">
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="py-0 px-2 small text-dark d-flex align-items-center gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReadersNoticeId(n.id);
                          }}
                          title="পাঠক প্রাপ্তিস্বীকার বিবরণী দেখুন"
                        >
                          <Users size={12} className="text-primary" /> পাঠক
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="py-0 px-2 small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditNotice(n);
                          }}
                        >
                          <Edit size={12} className="me-1" /> Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="py-0 px-2 small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteNoticeId(n.id);
                          }}
                        >
                          <Trash2 size={12} className="me-1" /> Delete
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        /* Table View */
        <Card className="border shadow-sm mb-4">
          <Card.Body className="p-0">
            <Table responsive hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>Title & Subject</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Audience</th>
                  <th>Author</th>
                  <th>Date</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n) => {
                  const title = language === 'bn' ? (n.title_bn || n.title_en) : (n.title_en || n.title_bn);

                  return (
                    <tr key={n.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedNotice(n)}>
                      <td className="text-center">
                        {n.is_pinned && <Pin size={14} className="text-warning" fill="#f59e0b" />}
                      </td>
                      <td>
                        <div className="fw-semibold text-dark">{title}</div>
                        {n.attachment_name && (
                          <small className="text-primary d-flex align-items-center gap-1">
                            <Paperclip size={11} /> {n.attachment_name}
                          </small>
                        )}
                      </td>
                      <td><Badge bg="light" text="dark" className="border text-uppercase">{n.category}</Badge></td>
                      <td>{getPriorityBadge(n.priority)}</td>
                      <td><Badge bg="secondary">{n.target_audience.toUpperCase()}</Badge></td>
                      <td><small>{n.creator?.name || 'Admin'}</small></td>
                      <td><small>{new Date(n.publish_date || n.created_at).toLocaleDateString('en-GB')}</small></td>
                      <td className="text-end" onClick={(e) => e.stopPropagation()}>
                        <div className="d-flex justify-content-end gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="py-0 px-2"
                            onClick={() => setSelectedNotice(n)}
                          >
                            <Eye size={12} />
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="py-0 px-2 text-dark"
                                onClick={() => setReadersNoticeId(n.id)}
                                title="পাঠক প্রাপ্তিস্বীকার বিবরণী দেখুন"
                              >
                                <Users size={12} className="text-primary" />
                              </Button>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="py-0 px-2"
                                onClick={() => setEditNotice(n)}
                              >
                                <Edit size={12} />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="py-0 px-2"
                                onClick={() => setDeleteNoticeId(n.id)}
                              >
                                <Trash2 size={12} />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          lastPage={totalPages}
          total={totalRecords}
          perPage={9}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Detail Modal */}
      <NoticeDetailModal
        show={!!selectedNotice}
        notice={selectedNotice}
        onHide={() => setSelectedNotice(null)}
        onOpenReaders={(id) => {
          setSelectedNotice(null);
          setReadersNoticeId(id);
        }}
      />

      {/* Readers Modal */}
      <NoticeReadersModal
        show={!!readersNoticeId}
        noticeId={readersNoticeId}
        onHide={() => setReadersNoticeId(null)}
      />

      {/* Create / Edit Modal */}
      {(showCreateModal || !!editNotice) && (
        <NoticeModal
          show={showCreateModal || !!editNotice}
          notice={editNotice}
          onHide={() => {
            setShowCreateModal(false);
            setEditNotice(null);
          }}
          onSuccess={loadNotices}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        show={!!deleteNoticeId}
        title={t('notices.confirm_delete_title', 'Delete Notice')}
        message={t('notices.confirm_delete_msg', 'Are you sure you want to delete this notice? This action cannot be undone.')}
        variant="danger"
        confirmText={t('common.delete', 'Delete')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteNoticeId(null)}
      />
    </div>
  );
};