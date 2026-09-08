import React from 'react';
import { Card } from 'react-bootstrap';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../locales/i18n';

export const Unauthorized: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="d-flex align-items-center justify-content-center p-4" style={{ minHeight: '60vh' }}>
      <Card className="border-0 shadow-sm rounded-4 text-center p-5" style={{ maxWidth: '500px' }}>
        <div className="bg-danger-subtle text-danger p-3 rounded-circle d-inline-block mx-auto mb-3">
          <ShieldAlert size={48} />
        </div>
        <h3 className="fs-5 fw-bold text-dark mb-2">{t('common.unauthorized_title')}</h3>
        <p className="text-muted fs-7 mb-4">{t('common.unauthorized_desc')}</p>
        <Link to="/dashboard" className="btn btn-primary rounded-3 fw-semibold text-decoration-none">
          <ArrowLeft size={16} className="me-2 inline" />
          ড্যাশবোর্ডে ফিরে যান (Return to Dashboard)
        </Link>
      </Card>
    </div>
  );
};