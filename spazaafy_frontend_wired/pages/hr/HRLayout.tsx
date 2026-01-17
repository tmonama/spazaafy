import React from 'react';
import { Outlet } from 'react-router-dom';
import HRSidebar from '../../components/HRSidebar';
import Header from '../../components/Header';
import { SidebarProvider, useSidebar } from '../../components/SidebarContext';
import { AlertsProvider } from '../../components/AlertsContext';

const Overlay: React.FC = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    if (!isSidebarOpen) return null;
    return <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden" aria-hidden="true" />;
};

const HRLayoutContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <HRSidebar />
            <div className="lg:pl-64 transition-all duration-300 ease-in-out">
                <Header />
                <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
            </div>
            <Overlay />
        </div>
    );
};

const HRLayout: React.FC = () => (
    <SidebarProvider>
        <AlertsProvider>
            <HRLayoutContent />
        </AlertsProvider>
    </SidebarProvider>
);

export default HRLayout;