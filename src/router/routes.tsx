import { lazy } from 'react';

// Lazy load components
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const UserManagement = lazy(() => import('../pages/UserManagement'));
const RoleManagement = lazy(() => import('../pages/RoleManagement'));
const ThemeSettings = lazy(() => import('../pages/ThemeSettings'));

// Define route interface
export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
  guard?: 'private' | 'public';
  permission?: string;
  role?: string;
}

// Public routes
export const publicRoutes: RouteConfig[] = [
  { path: '/login', element: <Login />, guard: 'public' },
];

// Private routes
export const privateRoutes: RouteConfig[] = [
  { path: '/', element: <Dashboard /> },
  { path: 'dashboard', element: <Dashboard />, permission: 'dashboard:read' },
  { path: 'users', element: <UserManagement />, permission: 'users:read' },
  { path: 'roles', element: <RoleManagement />, permission: 'roles:read', role: 'admin' },
  { path: 'theme', element: <ThemeSettings />, permission: 'theme:read' },
  // Add more private routes here
];