import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // While the AuthContext is checking for a user session, show a loading indicator.
    return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-gray-900">
            <div className="text-primary text-xl font-semibold">Loading...</div>
        </div>
    );
  }

  if (!user) {
    // If loading is finished and there is still no user, redirect to login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If loading is finished and there is a user, render the requested page.
  return <>{children}</>;
};

export default ProtectedRoute;