import React from 'react';
import { useAuthStore } from '../../store/authStore';

interface CanProps {
  role?: string | string[];
  permission?: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Can: React.FC<CanProps> = ({ role, permission, children, fallback = null }) => {
  const { hasRole, hasPermission } = useAuthStore();

  if (role && hasRole(role)) {
    return <>{children}</>;
  }

  if (permission && hasPermission(permission)) {
    return <>{children}</>;
  }

  if (!role && !permission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};