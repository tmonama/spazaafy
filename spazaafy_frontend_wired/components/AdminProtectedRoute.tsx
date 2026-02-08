import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[]; 
  allowedDepartments?: string[]; 
  loginPath?: string;
}

const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [UserRole.ADMIN], 
  allowedDepartments,
  loginPath = "/admin-login" 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // ✅ 1. CHECK DEPARTMENT (Priority)
  if (allowedDepartments && user.department) {
      if (allowedDepartments.includes(user.department)) {
          return <>{children}</>;
      }
  }

  // ✅ 2. CHECK ROLE (Updated to handle Specific Admins)
  // If the route allows 'ADMIN', we also allow specific admins IF they match the context
  // But generally, the 'allowedRoles' prop in App.tsx should now be specific.
  
  if (allowedRoles.includes(user.role)) {
      return <>{children}</>;
  }

  // ✅ 3. GLOBAL ADMIN OVERRIDE
  // Global Admins can access everything
  if (user.role === UserRole.ADMIN) {
      return <>{children}</>;
  }

  // --- REDIRECT LOGIC (Fallback) ---
  
  // If I am a Tech Admin trying to access HR, send me back to Tech
  if (user.role === UserRole.TECH_ADMIN) return <Navigate to="/tech/dashboard" replace />;
  if (user.role === UserRole.HR_ADMIN) return <Navigate to="/hr/hiring" replace />;
  if (user.role === UserRole.LEGAL_ADMIN) return <Navigate to="/legal/dashboard" replace />;
  
  if (user.role === UserRole.EMPLOYEE) return <Navigate to="/employee/dashboard" replace />;
  
  return <Navigate to="/dashboard" replace />; // Consumer fallback
};

export default AdminProtectedRoute;