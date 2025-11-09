import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Header from '../components/Header';
import ConsumerView from './ConsumerView';
import ShopOwnerView from './ShopOwnerView';

// NOTE: AdminLayout is no longer imported or handled here.

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user?.role) {
      // The Admin case is removed because the router now directs admins to their own layout.
      case UserRole.CONSUMER:
        return <ConsumerView />;
      case UserRole.SHOP_OWNER:
        return <ShopOwnerView />;
      default:
        // This is important for the initial render before user data is available.
        return <div className="text-center p-8">Loading...</div>;
    }
  };

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
};

export default DashboardPage;