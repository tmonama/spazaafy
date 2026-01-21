import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Scale, 
  AlertTriangle, 
  FileCheck, 
  HelpCircle,
  UserMinus,
  UserCircle,
  LifeBuoy, 
  Settings
} from 'lucide-react';

const LegalSidebar: React.FC = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const baseLinkClasses = "flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-green-600 text-white dark:bg-green-700"; // Matching Admin Primary Color
  const inactiveLinkClasses = "hover:bg-gray-100 dark:hover:bg-gray-700";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  const navItems = [
    { path: '/legal/dashboard', label: 'Overview', icon: LayoutDashboard },
    { path: '/legal/contracts', label: 'Contracts', icon: FileText },
    { path: '/legal/policies', label: 'Policies', icon: Shield },
    { path: '/legal/ip', label: 'Intellectual Property', icon: FileCheck },
    { path: '/legal/compliance', label: 'Compliance', icon: Scale },
    { path: '/legal/disputes', label: 'Disputes', icon: AlertTriangle },
    { path: '/legal/other', label: 'Advisory / Other', icon: HelpCircle },
    { path: '/legal/terminations', label: 'Terminations & Resignations', icon: UserMinus },
  ];

  return (
    <aside 
      className={`
        w-64 bg-white dark:bg-gray-800 shadow-md 
        h-screen fixed top-0 left-0 z-30
        transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="p-4 pt-20 lg:pt-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Legal Authority</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Restricted Access</p>
      </div>

      <nav className="mt-6 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink 
            key={item.path}
            to={item.path} 
            className={getNavLinkClass} 
            onClick={handleLinkClick}
            end={item.path === '/legal/dashboard'}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-gray-700">
         <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center">
            <Shield className="text-blue-600 dark:text-blue-400 h-5 w-5 mr-2" />
            <div>
                <p className="text-xs font-bold text-blue-800 dark:text-blue-200">Secure Environment</p>
                <p className="text-[10px] text-blue-600 dark:text-blue-300">Confidential Data</p>
            </div>
         </div>
      </div>
      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <NavLink to="legal/support" className={getNavLinkClass} onClick={handleLinkClick}>
            <LifeBuoy className="h-5 w-5 mr-3" /> Tech Support
        </NavLink>
        <NavLink to="legal/settings" className={getNavLinkClass} onClick={handleLinkClick}>
            <Settings className="h-5 w-5 mr-3" /> Settings
        </NavLink>
        
        <NavLink 
            to="/employee/dashboard" 
            className="flex items-center px-4 py-2 mt-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100..."
        >
            <UserCircle className="mr-3 h-5 w-5" /> My Employee Portal
        </NavLink>
      </div>
    </aside>
  );
};

export default LegalSidebar;