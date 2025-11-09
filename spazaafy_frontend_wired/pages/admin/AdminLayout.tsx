import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import Header from '../../components/Header';
import { SidebarProvider, useSidebar } from '../../components/SidebarContext';

// A new Overlay component
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
            <div className="flex">
                <AdminSidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
            {/* ✅ FIX: Add the overlay */}
            <Overlay />
        </div>
    );
};

// ✅ FIX: Wrap the entire layout in the provider
const AdminLayout: React.FC = () => (
    <SidebarProvider>
        <AdminLayoutContent />
    </SidebarProvider>
);


export default AdminLayout;