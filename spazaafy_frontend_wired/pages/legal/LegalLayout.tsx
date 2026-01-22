import React from 'react';
import { Outlet } from 'react-router-dom';
import LegalSidebar from '../../components/LegalSidebar';
import InternalHeader from '../../components/InternalHeader';
import { SidebarProvider, useSidebar } from '../../components/SidebarContext';
import { AlertsProvider } from '../../components/AlertsContext';

const Overlay: React.FC = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    if (!isSidebarOpen) return null;
    return (
        <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            aria-hidden="true"
        />
    );
};

const LegalLayoutContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <LegalSidebar />
            <div className="lg:pl-64 transition-all duration-300 ease-in-out">
                <InternalHeader />
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
            <Overlay />
        </div>
    );
};

const LegalLayout: React.FC = () => (
    <SidebarProvider>
        <AlertsProvider>
            <LegalLayoutContent />
        </AlertsProvider>
    </SidebarProvider>
);

export default LegalLayout;