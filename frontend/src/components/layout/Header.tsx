import React, { useState, useEffect } from 'react';
import { Navbar, Container, Dropdown, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../locales/i18n';
import { notificationsApi } from '../../api/notifications';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuthStore();
  const { language, setLanguage, t } = useTranslation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnread();
    const interval = setInterval(loadUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnread = async () => {
    try {
      const res = await notificationsApi.getNotifications();
      setUnreadCount(res.unread_count || 0);
    } catch {
      // silent
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const primaryRole = user?.roles?.[0]?.display_name_en || user?.role_names?.[0] || 'User';

  return (
    <Navbar bg="white" className="border-bottom sticky-top py-2 px-3 shadow-xs">
      <Container fluid className="px-0">
        <div className="d-flex align-items-center">
          {onToggleSidebar && (
            <Button
              variant="link"
              className="text-dark p-1 me-1 me-sm-2 d-lg-none"
              onClick={onToggleSidebar}
              aria-label="Toggle Navigation Menu"
            >
              <Menu size={22} />
            </Button>
          )}
          <img
            src="/logo.png"
            alt="BSISC Logo"
            style={{ width: 32, height: 32, objectFit: 'contain' }}
            className="me-2 d-inline"
          />
          <span className="fw-bold text-primary fs-6 fs-md-5 leading-tight">
            <span className="d-sm-none">BSISC</span>
            <span className="d-none d-sm-inline">{t('app.title')}</span>
          </span>
          <div className="d-none d-xl-flex gap-1 ms-3">
            <span className="badge bg-light text-dark border small">EIIN: 133988</span>
            <span className="badge bg-light text-dark border small">School: 1242</span>
            <span className="badge bg-light text-dark border small">College: 1760</span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-1.5 gap-sm-2">
          {/* Notifications link */}
          <Link 
            to="/notifications" 
            className="btn btn-sm btn-outline-light text-dark position-relative p-1.5 rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: 34, height: 34 }}
            aria-label="Notifications"
          >
            <Bell size={17} className="text-secondary" />
            {unreadCount > 0 && (
              <Badge
                bg="danger"
                pill
                className="position-absolute top-0 start-100 translate-middle"
                style={{ fontSize: '10px', padding: '0.25em 0.45em' }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Link>

          {/* Bilingual Switcher */}
          <div className="btn-group btn-group-sm" role="group" aria-label="Language switch">
            <Button
              variant={language === 'bn' ? 'primary' : 'outline-secondary'}
              size="sm"
              className="py-1 px-1.5 px-sm-2 fw-semibold"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setLanguage('bn')}
            >
              বাংলা
            </Button>
            <Button
              variant={language === 'en' ? 'primary' : 'outline-secondary'}
              size="sm"
              className="py-1 px-1.5 px-sm-2 fw-semibold"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setLanguage('en')}
            >
              EN
            </Button>
          </div>

          {/* User Profile Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              id="user-dropdown"
              className="d-flex align-items-center text-dark text-decoration-none p-0 border-0"
            >
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold overflow-hidden border shadow-xs"
                style={{ width: 34, height: 34, fontSize: '13px', minWidth: 34 }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user?.name || 'User Avatar'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  user?.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div className="text-start d-none d-md-block ms-2">
                <div className="fw-semibold small leading-tight text-truncate" style={{ maxWidth: 120 }}>{user?.name}</div>
                <div className="text-muted" style={{ fontSize: '11px' }}>
                  {primaryRole}
                </div>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-sm border mt-2">
              <div className="px-3 py-2 border-bottom">
                <div className="fw-bold small">{user?.name}</div>
                <div className="text-muted small">{user?.email}</div>
                <div className="mt-1">
                  <span className="badge bg-secondary text-capitalize">{primaryRole}</span>
                </div>
              </div>
              <Dropdown.Item as={Link} to="/profile">
                <User size={14} className="me-2 text-muted" /> {t('nav.profile')}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout} className="text-danger">
                <LogOut size={14} className="me-2" /> {t('nav.logout')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};