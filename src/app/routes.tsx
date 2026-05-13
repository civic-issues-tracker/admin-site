import { Navigate, createBrowserRouter } from 'react-router-dom'
import LoginPage from '../features/auth/pages/LoginPage'
import SignupPage from '../features/auth/pages/SignupPage' 
import ProtectedRoute from '../features/auth/ProtectedAuth'     
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage'
import DashboardLayout from './DashboardLayout' 
import AdminOverviewPage from '../features/dashboard-admin/pages/AdminOverviewPage' 
import AdminOrganizationsPage from '../features/dashboard-admin/pages/AdminOrganizationsPage'
import AdminCategoriesPage from '../features/dashboard-admin/pages/AdminCategoriesPage'
import { mockReports } from '../../src/mock/mockReports';
import AdminIssuesPage from '../features/dashboard-admin/pages/AdminIssuesPage'
import AdminAnalyticsPage from '../features/dashboard-admin/pages/AdminAnalyticsPage'
import AdminUsersPage from '../features/dashboard-admin/pages/AdminUsersPage'
import AdminAiMonitoringPage from '../features/dashboard-admin/pages/AdminAiMonitoringPage'
import AdminSettingsPage from '../features/dashboard-admin/pages/AdminSettingsPage'
import OrganizationAdminDashboardLayout from '../features/dashboard-organization-admin/OrganizationAdminDashboardLayout'
import OrganizationAdminDashboardPage from '../features/dashboard-organization-admin/pages/OrganizationAdminDashboardPage'
import OrganizationAdminIssuesPage from '../features/dashboard-organization-admin/pages/OrganizationAdminIssuesPage'
import OrganizationAdminAnalyticsPage from '../features/dashboard-organization-admin/pages/OrganizationAdminAnalyticsPage'
import OrganizationAdminNotificationsPage from '../features/dashboard-organization-admin/pages/OrganizationAdminNotificationsPage'
import OrganizationAdminSettingsPage from '../features/dashboard-organization-admin/pages/OrganizationAdminSettingsPage'
import OrganizationAdminAlertsPage from '../features/dashboard-organization-admin/pages/OrganizationAdminAlertsPage'

const router = createBrowserRouter([
  // --- PUBLIC AUTH SECTION ---
  {
    path: '/',
    children: [
      { index: true, element: <Navigate to="/login" replace /> }, 
      { path: 'login', element: <LoginPage /> },   
      { path: 'signup', element: <SignupPage /> }, 
      { path: 'reset-password', element: <ResetPasswordPage /> }                                                    
    ]
  },

  // --- SYSTEM ADMIN DASHBOARD ---
  {
    path: '/',
    element: (
      <ProtectedRoute allowedRoles={['system_admin']}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      { 
        path: 'admin-dashboard', 
        element: <AdminOverviewPage /> 
      },
      { 
        path: 'admin/issues', 
        element: <AdminIssuesPage /> 
      },
      { 
        path: 'admin/analytics', 
        element: <AdminAnalyticsPage /> 
      },
      { 
        path: 'admin/users', 
        element: <AdminUsersPage /> 
      },
      { 
        path: 'admin/AiMonitoring', 
        element: <AdminAiMonitoringPage /> 
      },
      { 
        path: 'admin/organizations', 
        element: <AdminOrganizationsPage /> 
      },
      { 
        path: 'admin/categories', 
        element: <AdminCategoriesPage /> 
      },
      { 
        path: 'admin/settings', 
        element: <AdminSettingsPage /> 
      },
    ]
  },

  // --- ORGANIZATION ADMIN DASHBOARD ---
  {
    path: '/organization-admin',
    element: (
      <ProtectedRoute allowedRoles={['organization_admin']}>
        <OrganizationAdminDashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <OrganizationAdminDashboardPage />,
      },
      {
        path: 'map',
        element: <OrganizationAdminIssuesPage />,
      },
      {
        path: 'resolved',
        element: <OrganizationAdminAnalyticsPage />,
      },
      {
        path: 'messages',
        element: <OrganizationAdminNotificationsPage />,
      },
      {
        path: 'settings',
        element: <OrganizationAdminSettingsPage />,
      },
      {
        path: 'notifications',
        element: <OrganizationAdminAlertsPage />,
      },
    ],
  },

  // --- 404 CATCH-ALL ---
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
]);

export default router;