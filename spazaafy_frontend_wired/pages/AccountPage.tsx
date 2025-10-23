import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Header from '../components/Header';
import ConsumerAccountView from '../components/ConsumerAccountView';
import ShopOwnerAccountView from '../components/ShopOwnerAccountView';
import Card from '../components/Card';

const AccountPage: React.FC = () => {
    const { user } = useAuth();

    const renderAccountView = () => {
        if (!user) {
            return <p>Loading...</p>;
        }

        switch (user.role) {
            case UserRole.CONSUMER:
                return <ConsumerAccountView />;
            case UserRole.SHOP_OWNER:
                return <ShopOwnerAccountView />;
            default:
                return <p>You do not have an account page.</p>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    {renderAccountView()}
                </div>
            </main>
        </div>
    );
};

export default AccountPage;
