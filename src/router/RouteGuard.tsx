import React from 'react';
import { PrivateRoute, AdminRoute } from '../layout/components';
import { PermissionGuard } from '../utils/permissionGuard';

interface RouteGuardProps {
  children: React.ReactNode;
  guard?: 'private' | 'public';
  permission?: string;
  role?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ 
  children, 
  guard = 'private',
  permission,
  role
}) => {
  // Public routes don't need any guards
  if (guard === 'public') {
    return <>{children}</>;
  }

  // Apply private route guard first
  let guardedContent = <PrivateRoute>{children}</PrivateRoute>;

  // Apply permission guard if permission is specified
  if (permission) {
    guardedContent = <PermissionGuard permission={permission}>{guardedContent}</PermissionGuard>;
  }

  // Apply role guard if role is specified
  if (role) {
    guardedContent = <AdminRoute>{guardedContent}</AdminRoute>;
  }

  return guardedContent;
};