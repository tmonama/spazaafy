import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  // Make these optional with defaults so your existing Admin routes don't break
  allowedRoles?: UserRole[]; 
  loginPath?: string;
}

const AdminProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles = [UserRole.ADMIN], // Default to Admin only
  loginPath = "/admin-login"       // Default to Admin login
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-900">
            <div className="text-primary text-xl font-semibold">Loading...</div>
        </div>
    );
  }

  // Check if user exists AND if their role is in the allowed list
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;