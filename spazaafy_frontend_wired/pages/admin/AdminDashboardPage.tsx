import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import mockApi from '../../api/mockApi';
import { DocumentStatus, UserRole, User } from '../../types';
import Button from '../../components/Button';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalShops: 0,
    totalDocs: 0,
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

        const provinceIdToNameMap = new Map(provinces.map((p) => [p.id, p.name]));
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

        const pendingDocs = documents.filter(
          (d) => d.status === DocumentStatus.PENDING
        ).length;

        setStats({
          totalShops: shops.length,
          totalDocs: documents.length,
          pendingDocs,
          totalConsumers: users.filter((u: User) => u.role === UserRole.CONSUMER)
            .length,
          provinceCounts,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Could not load dashboard data.');
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
      console.error('Failed to export dashboard:', error);
      alert('Could not export dashboard data.');
    }
  };

  // --- Derived data for charts ---
  const provinceChartData = Object.entries(stats.provinceCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));

  const completedDocs = Math.max(stats.totalDocs - stats.pendingDocs, 0);

  const documentStatusData =
    stats.totalDocs > 0
      ? [
          { name: 'Pending', value: stats.pendingDocs },
          { name: 'Processed', value: completedDocs },
        ]
      : [];

  const DOC_COLORS = ['#f97316', '#16a34a'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Overview of spaza shops, compliance documents and consumer activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleExport}
            className="w-full sm:w-auto bg-primary text-white hover:bg-primary-dark"
          >
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Spaza Shops" value={stats.totalShops} />
        <StatCard title="Total Consumers" value={stats.totalConsumers} />
        <StatCard title="Total Documents" value={stats.totalDocs} />
        <StatCard title="Pending Documents" value={stats.pendingDocs} />
      </div>

      {/* Main analytics row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Shops by province (bar chart) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Shops by province
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Distribution of onboarded spaza shops.
              </p>
            </div>
          </div>

          <div className="h-64">
            {provinceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={provinceChartData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Spaza shops"
                    radius={[6, 6, 0, 0]}
                    fill="#16a34a"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No province data available yet.
              </p>
            )}
          </div>
        </div>

        {/* Document status donut */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6 flex flex-col">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Document status
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Pending vs processed compliance documents.
          </p>

          {documentStatusData.length > 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentStatusData}
                      dataKey="value"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                    >
                      {documentStatusData.map((_, idx) => (
                        <Cell key={idx} fill={DOC_COLORS[idx]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              No document data available yet.
            </p>
          )}

          <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span>Pending</span>
              </div>
              <span className="font-semibold">{stats.pendingDocs}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
                <span>Processed</span>
              </div>
              <span className="font-semibold">{completedDocs}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Province cards (keeps your old view, but moved to bottom) */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
          Province breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(stats.provinceCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([provinceName, count]) => (
              <StatCard key={provinceName} title={provinceName} value={count} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
