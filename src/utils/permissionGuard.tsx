import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/auth'

// Permission guard component
interface PermissionGuardProps {
  children: ReactNode
  permission: string
  fallback?: ReactNode
}

export const PermissionGuard = ({ children, permission, fallback }: PermissionGuardProps) => {
  const { hasPermission } = useAuthStore()
  
  if (hasPermission(permission)) {
    return <>{children}</>
  }
  
  return fallback || <Navigate to="/dashboard" replace />
}