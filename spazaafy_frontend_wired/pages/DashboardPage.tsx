
import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Header from '../components/Header';
import ConsumerView from './ConsumerView';
import ShopOwnerView from './ShopOwnerView';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderContent = () => {
    switch (user?.role) {
      case UserRole.CONSUMER:
        return <ConsumerView />;
      case UserRole.SHOP_OWNER:
        return <ShopOwnerView />;
      default:
        return <div className="text-center p-8">Invalid user role.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
