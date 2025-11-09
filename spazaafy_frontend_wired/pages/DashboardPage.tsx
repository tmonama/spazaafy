import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
// Header is no longer imported here
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
        return <div className="text-center p-8">Loading...</div>;
    }
  };

  return (
    // The Header and main layout tags are now handled by UserLayout in App.tsx
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {renderContent()}
    </div>
  );
};

export default DashboardPage;