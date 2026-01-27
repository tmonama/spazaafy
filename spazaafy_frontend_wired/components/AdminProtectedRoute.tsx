import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; 
  loginPath?: string;
}

const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  // Default to ADMIN only and /admin-login if props aren't passed
  allowedRoles = [UserRole.ADMIN], 
  loginPath = "/admin-login" 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-900">
            <div className="text-primary text-xl font-semibold">Loading...</div>
        </div>
    );
  }

  // 1. Not Logged In -> Redirect to specific loginPath
  if (!user) {
    // state={{ from: location }} allows the Login page to redirect them back after successful login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Logged In, but wrong Role -> Redirect to a safe default
  // (e.g. A Consumer trying to access Admin Portal gets sent to their Dashboard)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If they are internal (HR/Tech) but trying to access Global Admin, send them back to their portal
    if (user.role === UserRole.HR) return <Navigate to="/hr/hiring" replace />;
    if (user.role === UserRole.LEGAL) return <Navigate to="/legal/dashboard" replace />;
    if (user.role === UserRole.EMPLOYEE) return <Navigate to="/employee/dashboard" replace />;
    
    // Default fallback for consumers or unknown roles
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;