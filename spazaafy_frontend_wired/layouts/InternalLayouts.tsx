import React from 'react';
import { Outlet } from 'react-router-dom';
import InternalHeader from '../components/InternalHeader';
import Header from '../components/Header'; // Old Header
import AdminSidebar from '../components/AdminSidebar';
import HRSidebar from '../components/HRSidebar';
import LegalSidebar from '../components/LegalSidebar';
import EmployeeSidebar from '../components/EmployeeSidebar';
import { SidebarProvider } from '../components/SidebarContext';

// 1. Shop Layout (Old Header)
export const ShopLayout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

// 2. Internal Page Wrapper
const InternalPageStructure = ({ Sidebar }: { Sidebar: React.ComponentType }) => (
  <SidebarProvider>
    <div className="flex h-screen bg-gray-100 dark:bg-dark-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <InternalHeader /> {/* ✅ New Header */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  </SidebarProvider>
);

export const AdminLayout = () => <InternalPageStructure Sidebar={AdminSidebar} />;
export const HRLayout = () => <InternalPageStructure Sidebar={HRSidebar} />;
export const LegalLayout = () => <InternalPageStructure Sidebar={LegalSidebar} />;
export const EmployeeLayout = () => <InternalPageStructure Sidebar={EmployeeSidebar} />;