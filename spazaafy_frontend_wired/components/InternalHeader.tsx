import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from './SidebarContext'; // Assuming you have this context
import { Menu, LogOut, User } from 'lucide-react';

const InternalHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login'); // Or home '/'
  };

  const handleProfileClick = () => {
    // Direct to the correct profile page based on role or generic account page
    if (user?.role === 'employee') navigate('/employee/profile');
    else navigate('/account'); 
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6">
      
      {/* LEFT: Sidebar Toggle & Logo */}
      <div className="flex items-center">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none lg:hidden mr-2"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-md flex items-center justify-center">
             <span className="text-white dark:text-gray-900 font-bold text-lg">S</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
            Spazaafy <span className="text-xs font-normal text-gray-500 uppercase ml-1">Internal</span>
          </span>
        </div>
      </div>

      {/* RIGHT: User Info & Actions */}
      <div className="flex items-center space-x-4">
        
        {/* Welcome Message */}
        <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
                Welcome, {user?.firstName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role?.replace('_', ' ')}
            </span>
        </div>

        {/* Profile Icon */}
        <button 
            onClick={handleProfileClick}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            title="My Profile"
        >
            <User className="h-6 w-6" />
        </button>

        {/* Logout Button */}
        <button
            onClick={handleLogout}
            className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors"
        >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default InternalHeader;