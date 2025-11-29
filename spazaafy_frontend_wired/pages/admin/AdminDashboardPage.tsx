import React, { useState, useEffect, useMemo } from 'react';
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
  AreaChart,
  Area,
} from 'recharts';

type SignUpEvent = {
  role: UserRole;
  createdAt: Date;
};

type SignUpPeriod = 'hour' | 'day' | 'month' | 'year';

interface SignUpPoint {
  label: string;
  consumers: number;
  shops: number;
}

const DOC_COLORS = ['#f97316', '#16a34a'];

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalShops: 0,
    totalDocs: 0,
    pendingDocs: 0,
    totalConsumers: 0,
    provinceCounts: {} as Record<string, number>,
  });
  const [signUps, setSignUps] = useState<SignUpEvent[]>([]);
  const [signUpPeriod, setSignUpPeriod] = useState<SignUpPeriod>('day');
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

        const provinceIdToNameMap = new Map(
          provinces.map((p: any) => [p.id, p.name])
        );

        const initialCounts = provinces.reduce(
          (acc: Record<string, number>, province: any) => {
            acc[province.name] = 0;
            return acc;
          },
          {} as Record<string, number>
        );

        const provinceCounts = shops.reduce(
          (acc: Record<string, number>, shop: any) => {
            const provinceId = shop.province?.id;
            if (provinceId) {
              const provinceName = provinceIdToNameMap.get(provinceId);
              if (provinceName && acc.hasOwnProperty(provinceName)) {
                acc[provinceName] += 1;
              }
            }
            return acc;
          },
          initialCounts
        );

        const pendingDocs = documents.filter(
          (d: any) => d.status === DocumentStatus.PENDING
        ).length;

        const totalDocs = documents.length;

        const totalConsumers = (users as User[]).filter(
          (u) => u.role === UserRole.CONSUMER
        ).length;

        // 🔑 Build sign-up events from user timestamps.
        // Adjust the `rawDate` line if your backend uses a different field name.
        const signUpEvents: SignUpEvent[] = (users as User[])
          .map((u) => {
            const anyUser = u as any;
            const rawDate: string | undefined =
              anyUser.createdAt ||
              anyUser.created_at ||
              anyUser.dateJoined ||
              anyUser.date_joined ||
              anyUser.created_at_local;

            if (!rawDate) return null;
            const created = new Date(rawDate);
            if (isNaN(created.getTime())) return null;

            return { role: u.role, createdAt: created };
          })
          .filter((ev): ev is SignUpEvent => ev !== null);

        setStats({
          totalShops: shops.length,
          totalDocs,
          pendingDocs,
          totalConsumers,
          provinceCounts,
        });
        setSignUps(signUpEvents);
        console.log('[Dashboard] raw users:', users);
        console.log('[Dashboard] derived signUpEvents:', signUpEvents);

      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Could not load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const buildSignUpSeries = (
    events: SignUpEvent[],
    period: SignUpPeriod
  ): { data: SignUpPoint[]; total: number; windowLabel: string } => {
    const now = new Date();

    if (events.length === 0) {
      return { data: [], total: 0, windowLabel: '' };
    }

    const buckets: {
      start: Date;
      end: Date;
      label: string;
      consumers: number;
      shops: number;
    }[] = [];

    const addBucket = (start: Date, end: Date, label: string) => {
      buckets.push({ start, end, label, consumers: 0, shops: 0 });
    };

    let windowLabel = '';

    if (period === 'hour') {
      // 24 hours, bucketed by hour
      const endHour = new Date(now);
      endHour.setMinutes(0, 0, 0);
      for (let i = 23; i >= 0; i--) {
        const start = new Date(endHour);
        start.setHours(endHour.getHours() - i, 0, 0, 0);
        const end = new Date(start);
        end.setHours(start.getHours() + 1);
        const label = start.toLocaleTimeString([], { hour: '2-digit' });
        addBucket(start, end, label);
      }
      windowLabel = 'last 24 hours';
    } else if (period === 'day') {
      // 7 days, bucketed by day
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      for (let i = 6; i >= 0; i--) {
        const start = new Date(today);
        start.setDate(today.getDate() - i);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        const label = start.toLocaleDateString([], {
          month: 'short',
          day: 'numeric',
        });
        addBucket(start, end, label);
      }
      windowLabel = 'last 7 days';
    } else if (period === 'month') {
      // 12 months, bucketed by month
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      for (let i = 11; i >= 0; i--) {
        const start = new Date(thisMonth);
        start.setMonth(thisMonth.getMonth() - i);
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        const label = start.toLocaleDateString([], {
          month: 'short',
          year: '2-digit',
        });
        addBucket(start, end, label);
      }
      windowLabel = 'last 12 months';
    } else {
      // year: last 5 years
      const thisYear = new Date(now.getFullYear(), 0, 1);
      for (let i = 4; i >= 0; i--) {
        const start = new Date(thisYear);
        start.setFullYear(thisYear.getFullYear() - i);
        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);
        const label = start.getFullYear().toString();
        addBucket(start, end, label);
      }
      windowLabel = 'last 5 years';
    }

    const windowStart = buckets[0].start;
    const filteredEvents = events.filter((e) => e.createdAt >= windowStart);

    let total = 0;
    filteredEvents.forEach((ev) => {
      const t = ev.createdAt.getTime();
      const bucket = buckets.find(
        (b) => t >= b.start.getTime() && t < b.end.getTime()
      );
      if (!bucket) return;

      if (ev.role === UserRole.CONSUMER) {
        bucket.consumers += 1;
      } else if (ev.role === UserRole.SHOP_OWNER) {
        bucket.shops += 1;
      }
      total += 1;
    });

    const data: SignUpPoint[] = buckets.map((b) => ({
      label: b.label,
      consumers: b.consumers,
      shops: b.shops,
    }));

    return { data, total, windowLabel };
  };

  const {
    data: signUpSeries,
    total: totalSignUps,
    windowLabel,
  } = useMemo(
    () => buildSignUpSeries(signUps, signUpPeriod),
    [signUps, signUpPeriod]
  );

  if (loading) {
    return <p>Loading dashboard statistics...</p>;
  }

  if (error) {
    return <p className="text-red-500 text-center p-8">{error}</p>;
  }

  const completedDocs = Math.max(stats.totalDocs - stats.pendingDocs, 0);

  const documentStatusData =
    stats.totalDocs > 0
      ? [
          { name: 'Pending', value: stats.pendingDocs },
          { name: 'Processed', value: completedDocs },
        ]
      : [];

  const provinceChartData = Object.entries(stats.provinceCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, value]) => ({ name, value }));

  const handleExport = async () => {
    try {
      await mockApi.reports.exportDashboardCsv();
    } catch (err) {
      console.error('Failed to export dashboard:', err);
      alert('Could not export dashboard data.');
    }
  };

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

      {/* Sign-ups over time */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Sign-ups
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {totalSignUps > 0 && windowLabel
                ? `${totalSignUps} new accounts in the ${windowLabel}.`
                : 'No sign-up activity in the selected period yet.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 dark:text-gray-400">View by</span>
            <select
              value={signUpPeriod}
              onChange={(e) =>
                setSignUpPeriod(e.target.value as SignUpPeriod)
              }
              className="rounded-md border border-gray-300 bg-white dark:bg-gray-900 dark:border-gray-700 px-2 py-1 text-xs text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="hour">Hour (last 24h)</option>
              <option value="day">Day (last 7d)</option>
              <option value="month">Month (last 12m)</option>
              <option value="year">Year (last 5y)</option>
            </select>
          </div>
        </div>

        <div className="h-64">
          {signUpSeries.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={signUpSeries}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="consumers"
                  name="Consumers"
                  stroke="#0ea5e9"
                  fill="#0ea5e9"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="shops"
                  name="Shop owners"
                  stroke="#22c55e"
                  fill="#22c55e"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No sign-ups found for this time range yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main analytics row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Shops by province */}
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

      {/* Province cards */}
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
