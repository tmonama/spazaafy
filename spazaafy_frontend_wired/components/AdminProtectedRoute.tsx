import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  allowedDepartments?: string[]; // ✅ New Prop
  loginPath?: string;
}

const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [UserRole.ADMIN], 
  allowedDepartments = [], // Default to empty
  loginPath = "/admin-login" 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (user) {
    console.log("DEBUG PROTECTION:", { 
        email: user.email, 
        role: user.role, 
        department: user.department, // <--- Check if this is undefined
        allowedDepts: allowedDepartments 
    });
  }

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-900">
            <div className="text-primary text-xl font-semibold">Loading...</div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // ✅ 1. CHECK DEPARTMENT ACCESS
  // If the route has specific departments, and the user matches, ALLOW them regardless of role
  if (allowedDepartments.length > 0 && user.department) {
      if (allowedDepartments.includes(user.department)) {
          return <>{children}</>;
      }
  }

  // ✅ 2. CHECK ROLE ACCESS
  // If they matched the role (e.g. ADMIN), ALLOW them
  if (allowedRoles.includes(user.role)) {
      return <>{children}</>;
  }

  // -----------------------------------------------------------
  // 3. FALLBACK REDIRECTION (If access denied)
  // -----------------------------------------------------------

  // If they have a department, send them to their department home
  if (user.department === 'HR') return <Navigate to="/hr/hiring" replace />;
  if (user.department === 'LEGAL') return <Navigate to="/legal/dashboard" replace />;
  if (user.department === 'TECH') return <Navigate to="/tech/dashboard" replace />;
  
  // Standard Role Redirections
  if (user.role === UserRole.EMPLOYEE) {
      return <Navigate to="/employee/dashboard" replace />;
  }
  
  if (user.role === UserRole.CONSUMER || user.role === UserRole.SHOP_OWNER) {
      return <Navigate to="/dashboard" replace />;
  }

  // Default Admin fallback
  return <Navigate to="/admin/dashboard" replace />;
  
};

export default AdminProtectedRoute;