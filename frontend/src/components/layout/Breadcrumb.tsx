import React from 'react';
import { Breadcrumb as BsBreadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from '../../locales/i18n';

export const Breadcrumb: React.FC<{ items?: { label: string; path?: string }[] }> = ({ items }) => {
  const { t } = useTranslation();

  if (items && items.length > 0) {
    return (
      <BsBreadcrumb className="bg-transparent p-0 mb-3 fs-7">
        <BsBreadcrumb.Item linkAs={Link} linkProps={{ to: '/dashboard' }}>
          <Home size={14} className="me-1 inline" />
          {t('nav.dashboard')}
        </BsBreadcrumb.Item>
        {items.map((it, idx) => (
          it.path && idx !== items.length - 1 ? (
            <BsBreadcrumb.Item key={idx} linkAs={Link} linkProps={{ to: it.path }}>
              {it.label}
            </BsBreadcrumb.Item>
          ) : (
            <BsBreadcrumb.Item key={idx} active>
              {it.label}
            </BsBreadcrumb.Item>
          )
        ))}
      </BsBreadcrumb>
    );
  }

  return null;
};