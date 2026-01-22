import React from 'react';
import { Outlet } from 'react-router-dom';
import InternalHeader from '../../components/InternalHeader'; // ✅ Use the New Header
import EmployeeSidebar from '../../components/EmployeeSidebar'; // ✅ Use Employee Sidebar
import { SidebarProvider } from '../../components/SidebarContext';

const EmployeeLayout: React.FC = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-dark-bg">
        {/* Sidebar */}
        <EmployeeSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          
          {/* ✅ The Internal Header */}
          <InternalHeader />

          {/* Page Content */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeLayout;