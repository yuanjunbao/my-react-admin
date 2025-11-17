import { createBrowserRouter, createRoutesFromElements, Route } from 'react-router-dom';
import { MainLayout } from '../layout';
import { RouteGuard } from './RouteGuard';
import { publicRoutes, privateRoutes } from './routes.tsx';

// Create router configuration
export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public routes */}
      {publicRoutes.map(route => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteGuard guard={route.guard}>{route.element}</RouteGuard>}
        />
      ))}
      
      {/* Private routes with main layout */}
      <Route path="/" element={<MainLayout />}>
        {privateRoutes.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<RouteGuard permission={route.permission} role={route.role}>{route.element}</RouteGuard>}
          />
        ))}
      </Route>
      
      {/* Not found route */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Route>
  )
);