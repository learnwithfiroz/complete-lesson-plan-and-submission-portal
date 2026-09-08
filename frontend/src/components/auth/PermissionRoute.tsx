import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface PermissionRouteProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({ children, roles, permissions }) => {
  const { hasRole, hasPermission } = useAuthStore();

  if (roles && !hasRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (permissions && !hasPermission(permissions)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};