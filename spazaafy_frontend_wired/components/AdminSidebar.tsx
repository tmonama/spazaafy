import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { useAlerts } from '../components/AlertsContext';
import NotificationDot from './NotificationDot';
import {
  LayoutDashboard,
  FileText,
  Store,
  CalendarCheck,
  Ticket,
  Handshake,
  UserCircle,
  Settings,
  LifeBuoy,
  Users,
  History
} from 'lucide-react';

const AdminSidebar: React.FC = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const { alerts } = useAlerts();

  // Match HR/Legal/Employee sidebar link styling
  const baseLinkClasses =
    'flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg transition-colors duration-200';
  const activeLinkClasses = 'bg-primary text-white dark:bg-primary-dark';
  const inactiveLinkClasses = 'hover:bg-gray-100 dark:hover:bg-gray-700';

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

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
      {/* Header */}
      <div className="p-4 pt-20 lg:pt-6 border-b border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">Admin Portal</h2>
        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">Internal Administration</p>
      </div>

      {/* Nav (scrollable) */}
      <nav className="mt-6 px-3 space-y-1 flex-1 overflow-y-auto">
        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className={getNavLinkClass} onClick={handleLinkClick} end>
          <LayoutDashboard className="h-5 w-5 mr-3" />
          Dashboard
        </NavLink>

        {/* Documents */}
        <div className="relative">
          <NavLink to="/admin/documents" className={getNavLinkClass} onClick={handleLinkClick}>
            <FileText className="h-5 w-5 mr-3" />
            Documents
          </NavLink>
          <NotificationDot count={alerts.pendingDocuments} />
        </div>

        {/* Spaza Shops */}
        <div className="relative">
          <NavLink to="/admin/shops" className={getNavLinkClass} onClick={handleLinkClick}>
            <Store className="h-5 w-5 mr-3" />
            Spaza Shops
          </NavLink>
          <NotificationDot count={alerts.unverifiedShops} />
        </div>

        {/* Site Visits */}
        <div className="relative">
          <NavLink to="/admin/site-visits" className={getNavLinkClass} onClick={handleLinkClick}>
            <CalendarCheck className="h-5 w-5 mr-3" />
            Site Visits
          </NavLink>
          <NotificationDot count={alerts.pendingVisits} />
        </div>

        {/* Tickets */}
        <div className="relative">
          <NavLink to="/admin/tickets" className={getNavLinkClass} onClick={handleLinkClick}>
            <Ticket className="h-5 w-5 mr-3" />
            Tickets
          </NavLink>
          <NotificationDot count={alerts.openTickets} />
        </div>

        {/* Assistance Requests */}
        <NavLink to="/admin/assistance" className={getNavLinkClass} onClick={handleLinkClick}>
          <Handshake className="h-5 w-5 mr-3" />
          Assistance Requests
        </NavLink>

        <NavLink to="/admin/crm" className={getNavLinkClass} onClick={handleLinkClick}>
            <Users className="h-5 w-5 mr-3" />
            CRM
        </NavLink>
        <NavLink to="/admin/access-logs" className={getNavLinkClass} onClick={handleLinkClick}>
          <History className="h-5 w-5 mr-3" />
          Access Logs
        </NavLink>
      </nav>


      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
        <NavLink to="/admin/support" className={getNavLinkClass} onClick={handleLinkClick}>
          <LifeBuoy className="h-5 w-5 mr-3" />
          Tech Support
        </NavLink>

        <NavLink to="/admin/settings" className={getNavLinkClass} onClick={handleLinkClick}>
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </NavLink>

        {/* Link to Employee Portal */}
        <NavLink
          to="/employee/dashboard"
          className="flex items-center px-4 py-2 mt-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 transition-colors duration-200"
          onClick={handleLinkClick}
        >
          <UserCircle className="mr-3 h-5 w-5" />
          My Employee Portal
        </NavLink>
      </div>
    </aside>
  );
};

export default AdminSidebar;