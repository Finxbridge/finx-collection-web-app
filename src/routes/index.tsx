/**
 * Application Routes
 * Centralized routing configuration
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@layouts'
import { HomePage, LoginPage, DashboardPage, NotFoundPage } from '@pages'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES } from '@config/constants'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        {/* Add more protected routes here */}
      </Route>

      {/* 404 Not Found */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
