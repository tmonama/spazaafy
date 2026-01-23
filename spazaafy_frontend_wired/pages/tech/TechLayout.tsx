import React from 'react';
import { Outlet } from 'react-router-dom';
import TechSidebar from '../../components/TechSidebar';
import InternalHeader from '../../components/InternalHeader'; // Adjust path if needed
import { SidebarProvider, useSidebar } from '../../components/SidebarContext'; // Adjust path if needed
import { AlertsProvider } from '../../components/AlertsContext'; // Adjust path if needed

// Mobile Overlay Component (Copied from HRLayout)
const Overlay: React.FC = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    if (!isSidebarOpen) return null;
    return (
        <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden backdrop-blur-sm transition-opacity" 
            aria-hidden="true" 
        />
    );
};

const TechLayoutContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* The Sidebar */}
            <TechSidebar />

            {/* Main Content Area - Pushed right on large screens */}
            <div className="lg:pl-64 transition-all duration-300 ease-in-out min-h-screen flex flex-col">
                {/* Header */}
                <InternalHeader />
                
                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            <Overlay />
        </div>
    );
};

// Wrap in providers just like HRLayout
const TechLayout: React.FC = () => (
    <SidebarProvider>
        <AlertsProvider>
            <TechLayoutContent />
        </AlertsProvider>
    </SidebarProvider>
);

export default TechLayout;