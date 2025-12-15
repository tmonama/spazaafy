import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from './SidebarContext';
import { useAlerts } from '../components/AlertsContext';
import NotificationDot from './NotificationDot';

const AdminSidebar: React.FC = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    const { alerts } = useAlerts();

    const baseLinkClasses = "flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-lg";
    const activeLinkClasses = "bg-primary text-white dark:bg-primary-dark";
    const inactiveLinkClasses = "hover:bg-gray-200 dark:hover:bg-gray-700";

    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${baseLinkClasses} ${isActive ? activeLinkClasses : inactiveLinkClasses}`;
    
    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

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
            <div className="p-4 pt-20 lg:pt-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Admin Menu</h2>
                <nav className="mt-6 space-y-2">
                    
                    {/* DASHBOARD */}
                    <div className="relative">
                        <NavLink to="/admin/dashboard" className={getNavLinkClass} onClick={handleLinkClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                            Dashboard
                        </NavLink>
                    </div>

                    {/* DOCUMENTS */}
                    <div className="relative">
                        <NavLink to="/admin/documents" className={getNavLinkClass} onClick={handleLinkClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                            Documents
                        </NavLink>
                        <NotificationDot count={alerts.pendingDocuments} />
                    </div>

                    {/* SPAZA SHOPS */}
                    <div className="relative">
                        <NavLink to="/admin/shops" className={getNavLinkClass} onClick={handleLinkClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                            Spaza Shops
                        </NavLink>
                        <NotificationDot count={alerts.unverifiedShops} />
                    </div>

                    {/* SITE VISITS */}
                    <div className="relative">
                         <NavLink to="/admin/site-visits" className={getNavLinkClass} onClick={handleLinkClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
                            Site Visits
                        </NavLink>
                        <NotificationDot count={alerts.pendingVisits} />
                    </div>

                    {/* TICKETS */}
                    <div className="relative">
                        <NavLink to="/admin/tickets" className={getNavLinkClass} onClick={handleLinkClick}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor"><path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" /></svg>
                            Tickets
                        </NavLink>
                        <NotificationDot count={alerts.openTickets} />
                    </div>

                    {/* ✅ ASSISTANCE REQUESTS (NEW) */}
                    <div className="relative">
                        <NavLink to="/admin/assistance" className={getNavLinkClass} onClick={handleLinkClick}>
                            {/* Handshake Icon SVG */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                            </svg>
                            Assistance Requests
                        </NavLink>
                        {/* Optional: Add notification dot here if you track pending requests later */}
                    </div>

                </nav>
            </div>
        </aside>
    );
};

export default AdminSidebar;