import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { Users, Briefcase, GraduationCap, UserPlus, FileWarning, UserMinus, MessageSquare } from 'lucide-react';

const HRSidebar: React.FC = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  const baseLinkClasses = "flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg transition-colors duration-200";
  const activeLinkClasses = "bg-purple-600 text-white dark:bg-purple-700";
  const inactiveLinkClasses = "hover:bg-gray-100 dark:hover:bg-gray-700";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  return (
    <aside 
      className={`
        w-64 bg-white dark:bg-gray-800 shadow-md h-screen fixed top-0 left-0 z-30
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="p-4 pt-20 lg:pt-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Human Resources</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Spazaafy HR</p>
      </div>

      <nav className="mt-6 px-3 space-y-1">
        <NavLink to="/hr/hiring" className={getNavLinkClass} onClick={handleLinkClick}>
            <Briefcase className="h-5 w-5 mr-3" /> Hiring Requests
        </NavLink>
        <NavLink to="/hr/onboarding" className={getNavLinkClass} onClick={handleLinkClick}>
            <UserPlus className="h-5 w-5 mr-3" /> Onboarding
        </NavLink>
        <NavLink to="/hr/employees" className={getNavLinkClass} onClick={handleLinkClick}>
            <Users className="h-5 w-5 mr-3" /> Employees
        </NavLink>
        <NavLink to="/hr/training" className={getNavLinkClass} onClick={handleLinkClick}>
            <GraduationCap className="h-5 w-5 mr-3" /> Training
        </NavLink>
        <NavLink to="/hr/resignations" className={getNavLinkClass}>
            <FileWarning className="h-5 w-5 mr-3" /> Resignations
        </NavLink>
        <NavLink to="/hr/terminations" className={getNavLinkClass}>
            <UserMinus className="h-5 w-5 mr-3" /> Terminations
        </NavLink>
        <NavLink to="/hr/complaints" className={getNavLinkClass}>
            <MessageSquare className="h-5 w-5 mr-3" /> Complaints
        </NavLink>
      </nav>
    </aside>
  );
};

export default HRSidebar;