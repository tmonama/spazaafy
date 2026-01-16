import React from 'react';
import { AlertsProvider } from './components/AlertsContext';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute'; // Ensure this is imported
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
import LegalDashboard from './pages/legal/LegalDashboard';
import LegalIntakePage from './pages/LegalIntakePage';
import LegalLayout from './pages/legal/LegalLayout';
import LegalCategoryPage from './pages/legal/LegalCategoryPage';


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
                
                {/* Dynamic Categories */}
                <Route path="contracts" element={<LegalCategoryPage />} />
                <Route path="policies" element={<LegalCategoryPage />} />
                <Route path="ip" element={<LegalCategoryPage />} />
                <Route path="compliance" element={<LegalCategoryPage />} />
                <Route path="disputes" element={<LegalCategoryPage />} />
                <Route path="other" element={<LegalCategoryPage />} />
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