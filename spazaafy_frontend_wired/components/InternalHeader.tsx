import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, UserCircle, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from './SidebarContext';
import { UserRole } from '../types';

const InternalHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { toggleSidebar } = useSidebar();

  // ✅ Only allow Account access inside Employee Portal
  const isEmployeePortal = location.pathname.startsWith('/employee');

  const handleLogout = () => {
    logout();

    // Role-aware redirect
    switch (user?.role) {
      case UserRole.HR:
        navigate('/hr/login');
        break;
      case UserRole.LEGAL:
        navigate('/legal/login');
        break;
      case UserRole.ADMIN:
        navigate('/admin/login');
        break;
      default:
        navigate('/login');
    }
  };

  const handleAccountClick = () => {
    navigate('/employee/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 z-40 flex items-center justify-between px-4 lg:px-6">
      
      {/* LEFT */}
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5 text-gray-700 dark:text-gray-200" />
        </button>

        {/* Portal Label */}
        <span className="font-bold text-gray-900 dark:text-white tracking-tight">
          Spazaafy Internal
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        {/* Employee Account (ONLY in employee portal) */}
        {isEmployeePortal && (
          <button
            onClick={handleAccountClick}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="My Account"
          >
            <UserCircle className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </button>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </header>
  );
};

export default InternalHeader;
