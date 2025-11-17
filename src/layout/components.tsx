import React from 'react'
import { Spin } from 'antd'
import { Navigate } from 'react-router-dom'
import useAuthStore from '../store/auth'

// Loading component for lazy loading
export const LoadingComponent = () => (
  <div className="loading-container">
    <Spin size="large" />
  </div>
)

// Private route component with authentication guard
export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Admin route component with role check
export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { hasRole } = useAuthStore()
  return hasRole('admin') ? <>{children}</> : <div>Access Denied</div>
}