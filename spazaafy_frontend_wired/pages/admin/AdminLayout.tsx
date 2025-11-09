import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import Header from '../../components/Header';
import { SidebarProvider, useSidebar } from '../../components/SidebarContext';

const Overlay: React.FC = () => {
    const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
    if (!isSidebarOpen) return null;

    return (
        <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            aria-hidden="true"
        />
    );
};

const AdminLayoutContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <div className="relative flex">
                <AdminSidebar />
                {/* ✅ FIX: Added md:ml-64 to push content over on desktop screens */}
                {/* Added transition for smooth resizing if you ever make the desktop sidebar collapsible */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 md:ml-64 transition-all duration-300">
                    <Outlet />
                </main>
            </div>
            <Overlay />
        </div>
    );
};

const AdminLayout: React.FC = () => (
    <SidebarProvider>
        <AdminLayoutContent />
    </SidebarProvider>
);

export default AdminLayout;