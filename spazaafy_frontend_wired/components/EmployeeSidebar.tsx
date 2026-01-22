import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSidebar } from './SidebarContext';
import { UserRole } from '../types'; // ✅ Import UserRole
import { 
  Home, 
  User, 
  Mail, 
  MessageSquare, 
  LogOut, 
  LifeBuoy, 
  Settings, 
  ArrowLeftCircle,
  Clock
} from 'lucide-react';

const EmployeeSidebar: React.FC = () => {
  const { user } = useAuth();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const navigate = useNavigate();

  const baseLinkClasses = "flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-blue-600 text-white dark:bg-blue-700"; 
  const inactiveLinkClasses = "hover:bg-gray-100 dark:hover:bg-gray-700";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // ✅ FIX: Use UserRole Enum here
  const handleSwitchBack = () => {
    switch (user?.role) {
        case UserRole.HR:
            navigate('/hr/hiring');
            break;
        case UserRole.LEGAL:
            navigate('/legal/dashboard');
            break;
        case UserRole.ADMIN:
            navigate('/admin/dashboard');
            break;
        default:
            navigate('/'); 
    }
  };

  // ✅ FIX: Use UserRole Enum here
  const getBackLabel = () => {
      if (user?.role === UserRole.HR) return 'HR Portal';
      if (user?.role === UserRole.LEGAL) return 'Legal Portal';
      return 'Admin Portal';
  };

  // ✅ FIX: Check against Enum values
  // We explicitly cast the array to include UserRole to avoid type narrowing issues with 'includes'
  const isInternalManager = [UserRole.ADMIN, UserRole.HR, UserRole.LEGAL].includes(user?.role as UserRole);

  return (
    <aside 
      className={`
        w-64 bg-white dark:bg-gray-800 shadow-md 
        h-screen fixed top-0 left-0 z-30
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}
    >
      <div className="p-4 pt-20 lg:pt-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Employee Portal</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">
            {user?.firstName} {user?.lastName}
        </p>
      </div>

      <nav className="mt-6 px-3 space-y-1 flex-1 overflow-y-auto">
        <NavLink to="/employee/dashboard" className={getNavLinkClass} onClick={handleLinkClick}>
            <Home className="mr-3 h-5 w-5" /> Dashboard
        </NavLink>
        <NavLink to="/employee/profile" className={getNavLinkClass} onClick={handleLinkClick}>
            <User className="mr-3 h-5 w-5" /> My Profile
        </NavLink>
        <NavLink to="/employee/timecard" className={getNavLinkClass}>
          <Clock className="h-5 w-5 mr-3" />
          Time Card
        </NavLink>
        <NavLink to="/employee/email" className={getNavLinkClass} onClick={handleLinkClick}>
            <Mail className="mr-3 h-5 w-5" /> Email
        </NavLink>
        <NavLink to="/employee/complaints" className={getNavLinkClass} onClick={handleLinkClick}>
            <MessageSquare className="mr-3 h-5 w-5" /> Complaints
        </NavLink>
        <NavLink to="/employee/resign" className={getNavLinkClass} onClick={handleLinkClick}>
            <LogOut className="mr-3 h-5 w-5" /> Resignation
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <NavLink to="/employee/support" className={getNavLinkClass} onClick={handleLinkClick}>
            <LifeBuoy className="h-5 w-5 mr-3" /> Tech Support
        </NavLink>
        <NavLink to="/employee/settings" className={getNavLinkClass} onClick={handleLinkClick}>
            <Settings className="h-5 w-5 mr-3" /> Settings
        </NavLink>

        {isInternalManager && (
            <button 
                onClick={handleSwitchBack}
                className="flex items-center w-full px-4 py-2 mt-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition shadow-sm"
            >
                <ArrowLeftCircle className="mr-3 h-4 w-4" />
                Back to {getBackLabel()}
            </button>
        )}
      </div>
    </aside>
  );
};

export default EmployeeSidebar;