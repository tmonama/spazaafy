import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Header from '../components/Header';
import ConsumerView from './ConsumerView';
import ShopOwnerView from './ShopOwnerView';
import AdminLayout from './admin/AdminLayout';
import { AlertsProvider } from '../components/AlertsContext'; // ✅ 1. Import the provider

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user?.role) {
      case UserRole.ADMIN:
        return <AdminLayout />;
      case UserRole.CONSUMER:
        return <ConsumerView />;
      case UserRole.SHOP_OWNER:
        return <ShopOwnerView />;
      default:
        return <div className="text-center p-8">Invalid user role.</div>;
    }
  };

  if (user?.role !== UserRole.ADMIN) {
    return (
      // ✅ 2. Wrap non-admin views with the AlertsProvider
      <AlertsProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
          <Header />
          <main>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </AlertsProvider>
    );
  }

  // AdminLayout already provides its own AlertsProvider, so we render it directly.
  return renderContent();
};

export default DashboardPage;