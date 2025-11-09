import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Header from '../components/Header';
import ConsumerView from './ConsumerView';
import ShopOwnerView from './ShopOwnerView';
import { AlertsProvider } from '../components/AlertsContext';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user?.role) {
      // Admin case is not needed here as it's handled by the router
      case UserRole.CONSUMER:
        return <ConsumerView />;
      case UserRole.SHOP_OWNER:
        return <ShopOwnerView />;
      default:
        return <div className="text-center p-8">Loading user data...</div>;
    }
  };

  return (
    // ✅ FIX: The page now wraps itself in the provider.
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
};

export default DashboardPage;