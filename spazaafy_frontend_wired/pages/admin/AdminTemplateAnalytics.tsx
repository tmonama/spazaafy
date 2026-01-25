import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import { 
    ArrowLeft, CheckCircle, XCircle, Users, 
    PieChart, BarChart2 
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

const AdminTemplateAnalytics: React.FC = () => {
    // We expect route: /admin/crm/template/:templateId/analytics
    const { templateId } = useParams<{ templateId: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!templateId) return;
            try {
                const res = await mockApi.crm.getTemplateAnalytics(templateId);
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [templateId]);

    if (loading) return <div className="p-8">Loading Analytics...</div>;
    if (!data) return <div className="p-8 text-red-500">No data found</div>;

    const { summary, breakdown, logs } = data;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Link to="/admin/crm" className="flex items-center text-gray-500 hover:text-blue-600 mb-4 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to CRM
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BarChart2 className="w-8 h-8 text-blue-600" />
                    Campaign Performance
                </h1>
                <p className="text-gray-500 mt-1">Real-time delivery statistics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Targeted</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summary.total}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Users size={20} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-green-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Successfully Sent</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summary.success}</h3>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg text-green-600">
                            <CheckCircle size={20} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-red-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Failed</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summary.failed}</h3>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg text-red-600">
                            <XCircle size={20} />
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-l-4 border-purple-500">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Success Rate</p>
                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{summary.success_rate}%</h3>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                            <PieChart size={20} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts & Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 h-96 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Recipient Breakdown</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={breakdown}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="target_group" />
                            <YAxis />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Emails Sent" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* List Breakdown */}
                <div className="space-y-4">
                    <Card title="Audience Segments">
                        <div className="space-y-4">
                            {breakdown.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.target_group}</span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                                        {item.count} sent
                                    </span>
                                </div>
                            ))}
                            {breakdown.length === 0 && <p className="text-gray-500 text-sm text-center">No data yet.</p>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Recent Logs Table */}
            <Card title="Recent Activity Log (Last 50)">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-medium text-gray-500">
                            <tr>
                                <th className="px-4 py-3">Recipient</th>
                                <th className="px-4 py-3">Group</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {logs.map((log: any, idx: number) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                    <td className="px-4 py-3 font-medium">{log.recipient_email}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                                            {log.target_group}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                            log.status === 'SENT' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-xs text-gray-400">
                                        {new Date(log.sent_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && (
                        <div className="p-8 text-center text-gray-400">No emails have been sent for this template yet.</div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminTemplateAnalytics;