import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import mockApi from '../../api/mockApi';
import { DocumentStatus, UserRole, User } from '../../types';
import Button from '../../components/Button';

const AdminDashboardPage: React.FC = () => {
    const [stats, setStats] = useState({
        totalShops: 0,
        pendingDocs: 0,
        totalConsumers: 0,
        provinceCounts: {} as Record<string, number>,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [shops, documents, users, provinces] = await Promise.all([
                    mockApi.shops.getAll(),
                    mockApi.documents.list(),
                    mockApi.users.getAll(),
                    mockApi.core.getProvinces(),
                ]);

                const provinceIdToNameMap = new Map(provinces.map(p => [p.id, p.name]));
                const initialCounts = provinces.reduce((acc, province) => {
                    acc[province.name] = 0;
                    return acc;
                }, {} as Record<string, number>);

                const provinceCounts = shops.reduce((acc, shop) => {
                    const provinceId = (shop as any).province?.id;
                    if (provinceId) {
                        const provinceName = provinceIdToNameMap.get(provinceId);
                        if (provinceName && acc.hasOwnProperty(provinceName)) {
                            acc[provinceName]++;
                        }
                    }
                    return acc;
                }, initialCounts);

                setStats({
                    totalShops: shops.length,
                    totalConsumers: users.filter((u: User) => u.role === UserRole.CONSUMER).length,
                    pendingDocs: documents.filter(d => d.status === DocumentStatus.PENDING).length,
                    provinceCounts: provinceCounts,
                });

            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
                setError("Could not load dashboard data.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <p>Loading dashboard statistics...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center p-8">{error}</p>;
    }

    const handleExport = async () => {
        try {
            await mockApi.reports.exportDashboardCsv();
        } catch (error) {
            console.error("Failed to export dashboard:", error);
            alert("Could not export dashboard data.");
        }
    };

    return (
        <div>
            {/* ✅ FIX: Header stacks on small screens, space added for stacking */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <Button onClick={handleExport} className="w-full sm:w-auto">Export to CSV</Button>
            </div>
            
            {/* The grid is already responsive, no changes needed here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Spaza Shops" value={stats.totalShops} />
                <StatCard title="Pending Documents" value={stats.pendingDocs} />
                <StatCard title="Total Consumers" value={stats.totalConsumers} />
                
                {Object.entries(stats.provinceCounts)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([provinceName, count]) => (
                        <StatCard key={provinceName} title={provinceName} value={count} />
                ))}
            </div>
        </div>
    );
};

export default AdminDashboardPage;