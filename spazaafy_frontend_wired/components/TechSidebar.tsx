import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  List, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  UserCircle,
  Activity 
} from 'lucide-react';

// ✅ Imports fixed for "Same Folder" location
import { useSidebar } from './SidebarContext'; 
import { useAuth } from '../hooks/useAuth';

const TechSidebar: React.FC = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { logout } = useAuth();

  // ✅ Defined as 'getNavLinkClass' to match usage below
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 mb-1 ${
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
      {/* Header */}
      <div className="p-6 border-b border-gray-800 pt-20 lg:pt-6">
        <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
                <h1 className="text-lg font-bold text-white tracking-tight">Tech Portal</h1>
                <p className="text-xs text-gray-500">IT & System Admin</p>
            </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">
            Analytics
        </div>
        <NavLink to="/tech/dashboard" className={getNavLinkClass} onClick={handleLinkClick}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Analytics Dashboard
        </NavLink>
        
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 mt-6 px-2">
            Operations
        </div>
        <NavLink to="/tech/tickets" className={getNavLinkClass} onClick={handleLinkClick}>
          <List className="w-5 h-5 mr-3" />
          Ticket Management
        </NavLink>

        <NavLink to="/tech/status" className={getNavLinkClass} onClick={handleLinkClick}>
            <Activity className="w-5 h-5 mr-3" />
            System Status
        </NavLink>

        <div className="pt-4 mt-4 border-t border-gray-800">
            <NavLink to="/tech/settings" className={getNavLinkClass} onClick={handleLinkClick}>
                <Settings className="w-5 h-5 mr-3" />
                Settings
            </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800 space-y-2">
        <NavLink 
            to="/tech/account" 
            className={getNavLinkClass}
            onClick={handleLinkClick}
        >
            <UserCircle className="w-5 h-5 mr-3" />
            My Account
        </NavLink>

        <NavLink
          to="/admin/dashboard"
          onClick={handleLinkClick}
          className="flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
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