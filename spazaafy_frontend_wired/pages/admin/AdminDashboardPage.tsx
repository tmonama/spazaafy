import React, { useMemo } from 'react';
import StatCard from '../../components/StatCard';
import { MOCK_DB } from '../../data/mockData';
import { UserRole, DocumentStatus } from '../../types';

const AdminDashboardPage: React.FC = () => {

    const stats = useMemo(() => {
        const users = MOCK_DB.users.findAll();
        const documents = MOCK_DB.documents.findAll();

        return {
            totalUsers: users.length,
            totalConsumers: users.filter(u => u.role === UserRole.CONSUMER).length,
            totalShops: users.filter(u => u.role === UserRole.SHOP_OWNER).length,
            pendingDocs: documents.filter(d => d.status === DocumentStatus.PENDING).length,
        };
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.totalUsers} />
                <StatCard title="Total Consumers" value={stats.totalConsumers} />
                <StatCard title="Total Spaza Shops" value={stats.totalShops} />
                <StatCard title="Pending Documents" value={stats.pendingDocs} />
            </div>
        </div>
    );
};

export default AdminDashboardPage;
