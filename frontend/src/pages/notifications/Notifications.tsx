import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Eye } from 'lucide-react';
import { notificationsApi, type NotificationItem } from '../../api/notifications';

export const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const markSingle = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">System Notifications & Action Alerts</h4>
          <span className="text-muted small">Stay updated on lesson plan submissions, reviews, and coordinator feedback</span>
        </div>
        <Button variant="outline-primary" size="sm" onClick={markAllRead}>
          <CheckCheck size={16} className="me-1" /> Mark All as Read
        </Button>
      </div>

      <Card className="border shadow-sm">
        <Card.Body className="p-0">
          <Table responsive hover className="align-middle mb-0">
            <tbody>
              {notifications.length === 0 ? (
                <tr>
                  <td className="text-center py-5 text-muted">
                    <Bell size={32} className="text-muted opacity-50 mb-2" />
                    <div>No new notifications found.</div>
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className={n.read_at ? '' : 'table-light'}>
                    <td style={{ width: '40px' }} className="ps-3">
                      <div className={`p-2 rounded-circle ${n.read_at ? 'bg-light text-muted' : 'bg-primary text-white'}`}>
                        <Bell size={16} />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-dark">
                          Plan {n.data.lesson_plan_code} {n.data.action.toUpperCase()}
                        </strong>
                        {!n.read_at && <Badge bg="primary">New</Badge>}
                      </div>
                      <div className="small text-muted">{n.data.lesson_plan_title}</div>
                      {n.data.comment && (
                        <div className="small text-dark mt-1 p-1 bg-light rounded border">
                          "{n.data.comment}" - <em>{n.data.actor_name}</em>
                        </div>
                      )}
                    </td>
                    <td style={{ width: '160px' }} className="text-muted small">
                      {new Date(n.created_at).toLocaleString()}
                    </td>
                    <td style={{ width: '120px' }} className="text-end pe-3">
                      <Link
                        to={`/lesson-plans/${n.data.lesson_plan_id}`}
                        className="btn btn-outline-primary btn-sm p-1 px-2 me-1"
                        onClick={() => markSingle(n.id)}
                      >
                        <Eye size={14} className="me-1" /> View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};