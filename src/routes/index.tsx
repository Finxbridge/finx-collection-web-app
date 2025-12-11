/**
 * Application Routes
 * Centralized routing configuration
 */

import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@layouts'
import {
  HomePage,
  LoginPage,
  DashboardPage,
  NotFoundPage,
  ProfilePage,
  ForgotPasswordPage,
  VerifyOtpPage,
  ResetPasswordPage,
  UsersPage,
  UserDetailPage,
  RolesPage,
  PermissionsPage,
  AccountLockoutPage,
  MasterDataPage,
  CaseUploadPage,
  BatchDetailPage,
  UnallocatedCasesPage,
  CaseSearchPage,
  CaseDetailPage,
  StrategyEnginePage,
  ExecutionLogsPage,
  AllocationPage,
  AllocationUploadPage,
  AllocationRulesPage,
  RuleDetailsPage,
  AgentWorkloadPage,
  ReallocationPage,
  AllocationBatchesPage,
} from '@pages'
import { ProtectedRoute } from './ProtectedRoute'
import { ROUTES } from '@config/constants'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.HOME} element={<HomePage />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* Auth flow routes (public) */}
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.VERIFY_OTP} element={<VerifyOtpPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />

      {/* Protected routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />

        {/* Access Management routes */}
        <Route path={ROUTES.USERS} element={<UsersPage />} />
        <Route path={ROUTES.USER_DETAIL} element={<UserDetailPage />} />
        <Route path={ROUTES.ROLES} element={<RolesPage />} />
        <Route path={ROUTES.PERMISSIONS} element={<PermissionsPage />} />
        <Route path={ROUTES.ACCOUNT_LOCKOUT} element={<AccountLockoutPage />} />

        {/* Master Data routes */}
        <Route path={ROUTES.MASTER_DATA} element={<MasterDataPage />} />

        {/* Case Sourcing routes */}
        <Route path={ROUTES.CASE_SOURCING_UPLOAD} element={<CaseUploadPage />} />
        <Route path={ROUTES.CASE_SOURCING_BATCH_DETAIL} element={<BatchDetailPage />} />
        <Route path={ROUTES.CASE_SOURCING_UNALLOCATED} element={<UnallocatedCasesPage />} />
        <Route path={ROUTES.CASE_SOURCING_SEARCH} element={<CaseSearchPage />} />
        <Route path={ROUTES.CASE_SOURCING_CASE_DETAIL} element={<CaseDetailPage />} />

        {/* Strategy Engine routes */}
        <Route path={ROUTES.STRATEGY_ENGINE} element={<StrategyEnginePage />} />
        <Route path={ROUTES.STRATEGY_ENGINE_LOGS} element={<ExecutionLogsPage />} />

        {/* Allocation routes */}
        <Route path={ROUTES.ALLOCATION} element={<AllocationPage />} />
        <Route path={ROUTES.ALLOCATION_UPLOAD} element={<AllocationUploadPage />} />
        <Route path={ROUTES.ALLOCATION_RULES} element={<AllocationRulesPage />} />
        <Route path={ROUTES.ALLOCATION_RULE_DETAIL} element={<RuleDetailsPage />} />
        <Route path={ROUTES.ALLOCATION_WORKLOAD} element={<AgentWorkloadPage />} />
        <Route path={ROUTES.ALLOCATION_REALLOCATION} element={<ReallocationPage />} />
        <Route path={ROUTES.ALLOCATION_BATCHES} element={<AllocationBatchesPage />} />
      </Route>

      {/* 404 Not Found */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRoutes
