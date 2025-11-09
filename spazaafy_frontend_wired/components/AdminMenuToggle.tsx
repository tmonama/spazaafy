// src/components/AdminMenuToggle.tsx

import React from 'react';
import { useSidebar } from './SidebarContext';
import { useAlerts } from '../components/AlertsContext';
import NotificationDot from './NotificationDot';

const AdminMenuIcon: React.FC<{ open: boolean }> = ({ open }) => (
    <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
        {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        )}
    </svg>
);

const AdminMenuToggle: React.FC = () => {
    // This hook is now safely called inside a component that will only be used within the AdminLayout
    const { isSidebarOpen, toggleSidebar } = useSidebar();
    const { alerts } = useAlerts();

    const totalAlerts = alerts.pendingDocuments + alerts.pendingVisits + alerts.unverifiedShops + alerts.openTickets;

    return (
        <div className="flex items-center lg:hidden">
            <div className="relative">
                <button
                    onClick={toggleSidebar}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
                    aria-label="Toggle Admin Menu"
                >
                    <AdminMenuIcon open={isSidebarOpen} />
                </button>
                <NotificationDot count={totalAlerts} showCount={false} />
            </div>
        </div>
    );
};

export default AdminMenuToggle;