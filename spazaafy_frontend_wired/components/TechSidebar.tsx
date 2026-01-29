import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  List, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  UserCircle,
  Activity // ✅ Added Activity Icon for Status
} from 'lucide-react';
import { useSidebar } from '../components/SidebarContext';
import { useAuth } from '../hooks/useAuth';

const TechSidebar: React.FC = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { logout } = useAuth();

  // ✅ 1. Define the styling constants and helper function here
  const baseLinkClasses = 'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 mb-1';
  const activeLinkClasses = 'bg-blue-600 text-white shadow-md';
  const inactiveLinkClasses = 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white';

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  const handleLinkClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <aside
      className={`
        w-64 bg-white dark:bg-gray-900 shadow-xl border-r border-gray-200 dark:border-gray-800
        h-screen fixed top-0 left-0 z-30
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-lg">
                <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Tech Portal</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">IT & System Admin</p>
            </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto space-y-1">
        
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
            Analytics
        </div>
        <NavLink to="/tech/dashboard" className={getNavLinkClass} onClick={handleLinkClick}>
          <LayoutDashboard className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6 px-2">
            Operations
        </div>
        <NavLink to="/tech/tickets" className={getNavLinkClass} onClick={handleLinkClick}>
          <List className="w-5 h-5 mr-3" />
          Ticket Management
        </NavLink>

        {/* ✅ Status Link */}
        <NavLink to="/tech/status" className={getNavLinkClass} onClick={handleLinkClick}>
            <Activity className="w-5 h-5 mr-3" />
            System Status
        </NavLink>
        
        <NavLink to="/tech/settings" className={getNavLinkClass} onClick={handleLinkClick}>
            <Settings className="w-5 h-5 mr-3" />
            System Settings
        </NavLink>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
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
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-3" />
          Back to Admin
        </NavLink>

        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default TechSidebar;