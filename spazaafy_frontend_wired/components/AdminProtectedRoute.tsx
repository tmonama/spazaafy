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
  // Default to ADMIN only
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
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // 2. Check Roles
  // We need to handle the fact that backend roles (ADMIN) might map to multiple frontend contexts (HR, LEGAL, TECH)
  const userRole = user.role;
  console.log("AdminProtectedRoute user.role:", user?.role, "allowedRoles:", allowedRoles);

  // If the route allows the user's role, render children
  if (allowedRoles.includes(userRole)) {
      return <>{children}</>;
  }

  // 3. If Role is NOT allowed, Redirect based on their actual role
  // This prevents an HR Admin (role=ADMIN) from getting stuck if they accidentally hit a Consumer route,
  // BUT critically, if they are an EMPLOYEE trying to hit HR, they get sent to Employee Dashboard.

  if (userRole === UserRole.EMPLOYEE) {
      return <Navigate to="/employee/dashboard" replace />;
  }
  
  if (userRole === UserRole.CONSUMER || userRole === UserRole.SHOP_OWNER) {
      return <Navigate to="/dashboard" replace />;
  }

  // If they are an ADMIN but trying to access a route they aren't explicitly allowed in (rare config),
  // send them to the main admin dashboard as a fallback.
  if (userRole === UserRole.ADMIN) {
      return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to={loginPath} replace />;
};

export default AdminProtectedRoute;