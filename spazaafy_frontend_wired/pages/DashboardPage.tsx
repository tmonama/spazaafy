import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Header from '../components/Header';
import ConsumerView from './ConsumerView';
import ShopOwnerView from './ShopOwnerView';
import AdminLayout from './admin/AdminLayout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        // The AdminLayout now handles its own providers and structure
        return <AdminLayout />;
      case UserRole.CONSUMER:
        return <ConsumerView />;
      case UserRole.SHOP_OWNER:
        return <ShopOwnerView />;
      default:
        return <div className="text-center p-8">Invalid user role.</div>;
    }
  };

  // Only render the wrapper and Header for non-admin users
  if (user?.role !== UserRole.ADMIN) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
        <Header />
        <main>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {renderContent()}
          </div>
        </main>
      </div>
    );
  }

  // For admins, just render the content directly, as AdminLayout handles the structure.
  return renderContent();
};

export default DashboardPage;