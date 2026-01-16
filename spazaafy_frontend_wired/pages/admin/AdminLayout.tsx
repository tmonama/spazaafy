import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import Header from '../../components/Header';
import { SidebarProvider, useSidebar } from '../../components/SidebarContext';
import { AlertsProvider } from '../../components/AlertsContext';

// ✅ 1. Define the props interface
interface AdminLayoutProps {
    children?: React.ReactNode;
}

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

// ✅ 2. Accept children in the Content component
const AdminLayoutContent: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <AdminSidebar />
            <div className="lg:pl-64 transition-all duration-300 ease-in-out">
                <Header />
                <main className="p-4 sm:p-6 lg:p-8">
                    {/* ✅ 3. Render children if they exist (Legal Dashboard), otherwise Outlet (Standard Admin) */}
                    {children ? children : <Outlet />}
                </main>
            </div>
            <Overlay />
        </div>
    );
};

// ✅ 4. Pass children through the providers
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => (
    <SidebarProvider>
        <AlertsProvider>
            <AdminLayoutContent>
                {children}
            </AdminLayoutContent>
        </AlertsProvider>
    </SidebarProvider>
);

export default AdminLayout;