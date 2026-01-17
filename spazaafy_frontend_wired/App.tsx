import React from 'react';
import { AlertsProvider } from './components/AlertsContext';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; 
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Header from './components/Header';

import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SupportPage from './pages/SupportPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AccountPage from './pages/AccountPage';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DocumentVerificationPage from './pages/admin/DocumentVerificationPage';
import SpazaShopsPage from './pages/admin/SpazaShopsPage';
import AdminShopDetailPage from './pages/admin/AdminShopDetailPage';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminTicketDetailPage from './pages/admin/AdminTicketDetailPage';
import AdminSiteVisitsPage from './pages/admin/AdminSiteVisitsPage';
import AdminSiteVisitDetailPage from './pages/admin/AdminSiteVisitDetailPage';
import PublicSiteVisitForm from './pages/PublicSiteVisitForm'; 
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import EmailVerificationPage from './pages/EmailVerificationPage';
import DownloadAppPage from "./pages/DownloadAppPage";
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutUsPage from "./pages/AboutUsPage";
import DeleteAccountPage from './pages/DeleteAccountPage';
import RequestAssistancePage from './pages/RequestAssistancePage';
import AdminAssistancePage from './pages/admin/AdminAssistancePage';
import AdminAssistanceDetailPage from './pages/admin/AdminAssistanceDetailPage';
import LegalRegisterPage from './pages/legal/LegalRegisterPage';
import LegalLoginPage from './pages/legal/LegalLoginPage';
// import LegalDashboard from './pages/legal/LegalDashboard'; // ❌ Unused, remove this
import LegalIntakePage from './pages/LegalIntakePage';
import LegalLayout from './pages/legal/LegalLayout';
import LegalCategoryPage from './pages/legal/LegalCategoryPage';

import HRRegisterPage from './pages/hr/auth/HRRegisterPage';
import HRLoginPage from './pages/hr/auth/HRLoginPage';
import HRLayout from './pages/hr/HRLayout';
import HiringPage from './pages/hr/HiringPage';
import EmployeesPage from './pages/hr/EmployeesPage';
import TrainingPage from './pages/hr/TrainingPage';
import OnboardingPage from './pages/hr/OnboardingPage';

// Public Forms
import JobRequestForm from './pages/JobRequestForm';
import JobApplicationForm from './pages/JobApplicationForm';
import TrainingSignupForm from './pages/TrainingSignupForm';
import TrainingDetailPage from './pages/hr/TrainingDetailPage';
import HiringDetailPage from './pages/hr/HiringDetailPage';


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* ✅ Global provider so Header always sees alerts */}
        <AlertsProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />
            <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
            <Route path="/site-visits/:visitId/form" element={<PublicSiteVisitForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/download" element={<DownloadAppPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/delete-account" element={<DeleteAccountPage />} />
            <Route path="/legal/submit" element={<LegalIntakePage />} />

            {/* HR PUBLIC ROUTES */}
            <Route path="/jobs/request" element={<JobRequestForm />} />
            <Route path="/jobs/:id/apply" element={<JobApplicationForm />} />
            <Route path="/training/signup" element={<TrainingSignupForm />} />

            {/* HR AUTH */}
            <Route path="/hr/register" element={<HRRegisterPage />} />
            <Route path="/hr/login" element={<HRLoginPage />} />

            {/* HR PORTAL (Protected) */}
            <Route path="/hr" element={<AdminProtectedRoute><HRLayout /></AdminProtectedRoute>}>
                <Route path="hiring" element={<HiringPage />} />
                <Route path="hiring/:id" element={<HiringDetailPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="onboarding" element={<OnboardingPage />} />
                {/* ✅ Training Routes */}
                <Route path="training" element={<TrainingPage />} />
                <Route path="training/:sessionId" element={<TrainingDetailPage />} /> 
            </Route>

            {/* ✅ Legal Auth Routes */}
            <Route path="/legal/register" element={<LegalRegisterPage />} />
            <Route path="/legal/login" element={<LegalLoginPage />} />

            {/* LEGAL ADMIN PORTAL */}
            <Route
                path="/legal"
                element={
                  <AdminProtectedRoute>
                    <LegalLayout />
                  </AdminProtectedRoute>
                }
              >
                {/* Dashboard Overview */}
                <Route path="dashboard" element={<LegalCategoryPage isOverview={true} />} />
                
                {/* ✅ FIXED: Added categoryProp to these routes */}
                <Route path="contracts" element={<LegalCategoryPage categoryProp="contracts" />} />
                <Route path="policies" element={<LegalCategoryPage categoryProp="policies" />} />
                <Route path="ip" element={<LegalCategoryPage categoryProp="ip" />} />
                <Route path="compliance" element={<LegalCategoryPage categoryProp="compliance" />} />
                <Route path="disputes" element={<LegalCategoryPage categoryProp="disputes" />} />
                <Route path="other" element={<LegalCategoryPage categoryProp="other" />} />
            </Route>


            {/* User Routes (Protected) */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
            <Route path="/support/:ticketId" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
            
            {/* ✅ NEW ROUTE: Request Assistance */}
            <Route path="/request-assistance" element={<ProtectedRoute><RequestAssistancePage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="documents" element={<DocumentVerificationPage />} />
              <Route path="shops" element={<SpazaShopsPage />} />
              <Route path="shops/:shopId" element={<AdminShopDetailPage />} />
              <Route path="tickets" element={<AdminTicketsPage />} />
              <Route path="tickets/:ticketId" element={<AdminTicketDetailPage />} />
              <Route path="site-visits" element={<AdminSiteVisitsPage />} />
              <Route path="site-visits/:visitId" element={<AdminSiteVisitDetailPage />} />
              <Route path="assistance" element={<AdminAssistancePage />} />
              <Route path="assistance/:requestId" element={<AdminAssistanceDetailPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AlertsProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;