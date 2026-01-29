import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, List, LogOut, ArrowLeft, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from './SidebarContext';

const TechSidebar: React.FC = () => {
  const { logout } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <aside
      className={`
        w-64 bg-gray-900 h-screen flex flex-col text-white fixed left-0 top-0 z-30
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="p-6 border-b border-gray-800 pt-20 lg:pt-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Tech Portal
        </h1>
        <p className="text-xs text-gray-500 mt-1">IT &amp; System Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavLink to="/tech/dashboard" className={linkClass} onClick={handleLinkClick}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Analytics Dashboard
        </NavLink>
        <NavLink to="/tech/tickets" className={linkClass} onClick={handleLinkClick}>
          <List className="w-5 h-5 mr-3" />
          Ticket Management
        </NavLink>
        <NavLink to="/tech/status" className={getNavLinkClass} onClick={handleLinkClick}>
            <Activity className="w-5 h-5 mr-3" />
            System Status
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-800 space-y-2">
        <NavLink
          to="/admin/dashboard"
          onClick={handleLinkClick}
          className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin
        </NavLink>

        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default TechSidebar;
