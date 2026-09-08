import React from 'react';
import { Badge } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import type { LessonPlanStatus } from '../../types/lessonPlan';

export const StatusBadge: React.FC<{ status: LessonPlanStatus | string }> = ({ status }) => {
  const { t } = useTranslation();

  const getVariant = (st: string) => {
    switch (st) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'primary';
      case 'under_review':
        return 'info';
      case 'approved':
        return 'success';
      case 'returned':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'archived':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  return (
    <Badge bg={getVariant(status)} className="px-2 py-1 text-uppercase">
      {t(`status.${status}`, status)}
    </Badge>
  );
};