import React from 'react';
import { Outlet } from 'react-router-dom';
import EmployeeSidebar from '../../components/EmployeeSidebar'; // Ensure you created this in previous steps
import Header from '../../components/Header';
import { SidebarProvider } from '../../components/SidebarContext';
import { AlertsProvider } from '../../components/AlertsContext';

const EmployeeLayoutContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <EmployeeSidebar />
            <div className="lg:pl-64 transition-all duration-300 ease-in-out">
                <Header />
                <main className="p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

const EmployeeLayout: React.FC = () => (
    <SidebarProvider>
        <AlertsProvider>
            <EmployeeLayoutContent />
        </AlertsProvider>
    </SidebarProvider>
);

export default EmployeeLayout;