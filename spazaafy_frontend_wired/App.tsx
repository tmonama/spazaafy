import React from 'react';
import { AlertsProvider } from './components/AlertsContext';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import Header from './components/Header';

// --- General Pages ---
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DownloadAppPage from "./pages/DownloadAppPage";
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AboutUsPage from "./pages/AboutUsPage";
import DeleteAccountPage from './pages/DeleteAccountPage';
import NotFoundPage from './pages/NotFoundPage';

// --- User/Shop Owner Protected ---
import DashboardPage from './pages/DashboardPage';
import SupportPage from './pages/SupportPage';
import SettingsPage from './pages/SettingsPage';
import AccountPage from './pages/AccountPage';
import TicketDetailPage from './pages/TicketDetailPage';
import RequestAssistancePage from './pages/RequestAssistancePage';
import EmailVerificationPage from './pages/EmailVerificationPage';

// --- Admin Portal ---
import AdminLoginPage from './pages/AdminLoginPage';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DocumentVerificationPage from './pages/admin/DocumentVerificationPage';
import SpazaShopsPage from './pages/admin/SpazaShopsPage';
import AdminShopDetailPage from './pages/admin/AdminShopDetailPage';
import AdminTicketsPage from './pages/admin/AdminTicketsPage';
import AdminTicketDetailPage from './pages/admin/AdminTicketDetailPage';
import AdminSiteVisitsPage from './pages/admin/AdminSiteVisitsPage';
import AdminSiteVisitDetailPage from './pages/admin/AdminSiteVisitDetailPage';
import AdminAssistancePage from './pages/admin/AdminAssistancePage';
import AdminAssistanceDetailPage from './pages/admin/AdminAssistanceDetailPage';
import PublicSiteVisitForm from './pages/PublicSiteVisitForm';
import AdminCRMPage from './pages/admin/AdminCRMPage';
import AdminCampaignDetail from './pages/admin/AdminCampaignDetail';
import AdminTemplateAnalytics from './pages/admin/AdminTemplateAnalytics';

// --- Legal Portal ---
import LegalRegisterPage from './pages/legal/LegalRegisterPage';
import LegalLoginPage from './pages/legal/LegalLoginPage';
import LegalIntakePage from './pages/LegalIntakePage';
import LegalLayout from './pages/legal/LegalLayout';
import LegalCategoryPage from './pages/legal/LegalCategoryPage';
import LegalAmendmentPage from './pages/legal/LegalAmendmentPage';

// --- HR Portal ---
import HRRegisterPage from './pages/hr/auth/HRRegisterPage';
import HRLoginPage from './pages/hr/auth/HRLoginPage';
import HRLayout from './pages/hr/HRLayout';
import HiringPage from './pages/hr/HiringPage';
import EmployeesPage from './pages/hr/EmployeesPage';
import TrainingPage from './pages/hr/TrainingPage';
import OnboardingPage from './pages/hr/OnboardingPage';
import TerminationsPage from './pages/hr/TerminationsPage'; 
import ComplaintsPage from './pages/hr/ComplaintsPage'; 
import ResignationsPage from './pages/hr/ResignationsPage'; 
import ComplaintDetailPage from './pages/hr/ComplaintDetailPage';
import HiringDetailPage from './pages/hr/HiringDetailPage';
import EmployeeDetailPage from './pages/hr/EmployeeDetailPage';
import TrainingDetailPage from './pages/hr/TrainingDetailPage';
import AnnouncementsPage from './pages/hr/AnnouncementsPage';
// HR Public Forms
import JobRequestForm from './pages/JobRequestForm';
import JobApplicationForm from './pages/JobApplicationForm';
import TrainingSignupForm from './pages/TrainingSignupForm';

// --- Employee Portal ---
import EmployeeRegisterPage from './pages/employee/EmployeeRegisterPage';
import EmployeeLoginPage from './pages/employee/EmployeeLoginPage';
import EmployeeLayout from './pages/employee/EmployeeLayout'; 
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage';
import EmployeeEmailPage from './pages/employee/EmployeeEmailPage';
import EmployeeResignationPage from './pages/employee/EmployeeResignationPage'; 
import EmployeeComplaintsPage from './pages/employee/EmployeeComplaintsPage';
import EmployeeTimeCardPage from './pages/employee/EmployeeTimeCardPage';

// --- Tech Portal ---
import TechLoginPage from './pages/tech/TechLoginPage';
import TechRegisterPage from './pages/tech/TechRegisterPage';
import TechLayout from './pages/tech/TechLayout';
import TechDashboard from './pages/tech/TechDashboard';
import TechTickets from './pages/tech/TechTickets';
import TechTicketDetail from './pages/tech/TechTicketDetail';
import InternalTechTicketDetail from './pages/support/InternalTechTicketDetail';
import PublicStatusPage from './pages/PublicStatusPage';
import TechStatusPage from './pages/tech/TechStatusPage';
import AccessLogPage from './pages/AccessLogPage';
import TechAccessControlPage from './pages/tech/TechAccessControlPage';

import { UserRole } from './types';

// ✅ NEW: Main Layout for Consumers/Shop Owners
// This ensures the Header appears on their pages but NOT on Admin pages
const MainLayout: React.FC = () => {
  return (
    <>
      <Header />
      {/* Add padding-top to account for fixed header if necessary, or manage in components */}
      <Outlet />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AlertsProvider>
          <Routes>
            {/* ================= PUBLIC ROUTES ================= */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/download" element={<DownloadAppPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/status" element={<PublicStatusPage />} />
            
            {/* General Auth */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<EmailVerificationPage />} />
            <Route path="/delete-account" element={<DeleteAccountPage />} />

            {/* General Admin Auth (Fallback) */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route path="/admin/register" element={<AdminRegisterPage />} />

            {/* Public Forms */}
            <Route path="/site-visits/:visitId/form" element={<PublicSiteVisitForm />} />
            <Route path="/legal/submit" element={<LegalIntakePage />} />
            <Route path="/jobs/request" element={<JobRequestForm />} />
            <Route path="/jobs/:id/apply" element={<JobApplicationForm />} />
            <Route path="/training/signup" element={<TrainingSignupForm />} />
            <Route path="/legal/amend/:token" element={<LegalAmendmentPage />} />

            {/* ================= PORTAL SPECIFIC AUTH ================= */}
            
            {/* ✅ Tech Portal Auth */}
            <Route path="/tech/login" element={<TechLoginPage />} />
            <Route path="/tech/register" element={<TechRegisterPage />} />

            {/* ✅ HR Portal Auth */}
            <Route path="/hr/login" element={<HRLoginPage />} />
            <Route path="/hr/register" element={<HRRegisterPage />} />

            {/* ✅ Legal Portal Auth */}
            <Route path="/legal/login" element={<LegalLoginPage />} />
            <Route path="/legal/register" element={<LegalRegisterPage />} />

            {/* ✅ Employee Portal Auth */}
            <Route path="/employee/login" element={<EmployeeLoginPage />} />
            <Route path="/employee/register" element={<EmployeeRegisterPage />} />


            {/* ================= PROTECTED PORTALS ================= */}

            {/* --- TECH PORTAL --- */}
            <Route 
              path="/tech" 
              element={
                <AdminProtectedRoute 
                  allowedRoles={[UserRole.ADMIN]} // Tech users are Admins
                  allowedDepartments={['TECH']}
                  loginPath="/tech/login"
                >
                  <TechLayout />
                </AdminProtectedRoute>
              }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<TechDashboard />} />
                <Route path="tickets" element={<TechTickets />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="account" element={<AccountPage />} />
                <Route path="tickets/:ticketId" element={<TechTicketDetail />} />
                <Route path="status" element={<TechStatusPage />} />
                <Route path="access-logs" element={<AccessLogPage />} />
                <Route path="access-control" element={<TechAccessControlPage />} />
            </Route>

            {/* --- HR PORTAL --- */}
            <Route 
              path="/hr" 
              element={
                <AdminProtectedRoute 
                  allowedRoles={[UserRole.ADMIN]} 
                  allowedDepartments={['HR']}
                  loginPath="/hr/login"
                >
                  <HRLayout />
                </AdminProtectedRoute>
              }
            >
                <Route index element={<Navigate to="hiring" replace />} />
                <Route path="hiring" element={<HiringPage />} />
                <Route path="hiring/:id" element={<HiringDetailPage />} />
                <Route path="employees" element={<EmployeesPage />} />
                <Route path="employees/:id" element={<EmployeeDetailPage />} />
                <Route path="onboarding" element={<OnboardingPage />} />
                <Route path="training" element={<TrainingPage />} />
                <Route path="training/:sessionId" element={<TrainingDetailPage />} /> 
                <Route path="terminations" element={<TerminationsPage />} />
                <Route path="complaints" element={<ComplaintsPage />} />
                <Route path="complaints/:id" element={<ComplaintDetailPage />} />
                <Route path="resignations" element={<ResignationsPage />} />
                <Route path="announcements" element={<AnnouncementsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="support/tech/:ticketId" element={<ProtectedRoute><InternalTechTicketDetail /></ProtectedRoute>} />
                <Route path="account" element={<AccountPage />} />
                <Route path="access-logs" element={<AccessLogPage />} />
            </Route>

            {/* --- LEGAL PORTAL --- */}
            <Route
              path="/legal"
              element={
                <AdminProtectedRoute 
                  allowedRoles={[UserRole.ADMIN]} 
                  allowedDepartments={['LEGAL']}
                  loginPath="/legal/login"
                >
                  <LegalLayout />
                </AdminProtectedRoute>
              }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<LegalCategoryPage isOverview={true} />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="support/tech/:ticketId" element={<ProtectedRoute><InternalTechTicketDetail /></ProtectedRoute>} />
                <Route path="account" element={<AccountPage />} />
                
                {/* Categories */}
                <Route path="contracts" element={<LegalCategoryPage categoryProp="contracts" />} />
                <Route path="policies" element={<LegalCategoryPage categoryProp="policies" />} />
                <Route path="ip" element={<LegalCategoryPage categoryProp="ip" />} />
                <Route path="compliance" element={<LegalCategoryPage categoryProp="compliance" />} />
                <Route path="disputes" element={<LegalCategoryPage categoryProp="disputes" />} />
                <Route path="terminations" element={<LegalCategoryPage categoryProp="termination" />} />
                <Route path="other" element={<LegalCategoryPage categoryProp="other" />} />
                <Route path="access-logs" element={<AccessLogPage />} />
            </Route>

            {/* --- EMPLOYEE PORTAL --- */}
            <Route 
              path="/employee" 
              element={
                <AdminProtectedRoute 
                  allowedRoles={[UserRole.EMPLOYEE]} 
                  loginPath="/employee/login"
                >
                  <EmployeeLayout />
                </AdminProtectedRoute>
              }
            >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="profile" element={<EmployeeProfilePage />} />
                <Route path="timecard" element={<ProtectedRoute> <EmployeeTimeCardPage /></ProtectedRoute>}/>
                <Route path="email" element={<EmployeeEmailPage />} />
                <Route path="complaints" element={<EmployeeComplaintsPage />} />
                <Route path="resign" element={<EmployeeResignationPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="support/tech/:ticketId" element={<ProtectedRoute><InternalTechTicketDetail /></ProtectedRoute>} />
                <Route path="account" element={<AccountPage />} />
            </Route>

            {/* --- GENERAL ADMIN PORTAL --- */}
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute
                  allowedRoles={[UserRole.ADMIN]} 
                  allowedDepartments={['SUPPORT', 'FIELD']}
                  loginPath="/admin-login"
                >
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
              <Route path="settings" element={<SettingsPage />} />
              <Route path="support" element={<SupportPage />} />
              <Route path="support/tech/:ticketId" element={<ProtectedRoute><InternalTechTicketDetail /></ProtectedRoute>} />
              <Route path="account" element={<AccountPage />} />
              <Route path="crm" element={<AdminCRMPage />} />
              <Route path="crm/:id" element={<AdminCampaignDetail />} />
              <Route path="crm/template/:templateId/analytics" element={<AdminTemplateAnalytics />} />
              <Route path="access-logs" element={<AccessLogPage />} />
            </Route>

            {/* ================= PROTECTED CONSUMER/OWNER ROUTES ================= */}
            {/* ✅ WRAPPED IN MAIN LAYOUT to provide Header */}
            <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />
                <Route path="/support/:ticketId" element={<ProtectedRoute><TicketDetailPage /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/request-assistance" element={<ProtectedRoute><RequestAssistancePage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </AlertsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;