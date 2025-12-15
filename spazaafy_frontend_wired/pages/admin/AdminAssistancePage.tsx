// src/pages/admin/AdminAssistancePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import mockApi from '../../api/mockApi';
import { AssistanceRequest, AssistanceStatus } from '../../types';
import Card from '../../components/Card';
import Button from '../../components/Button';

// Helper to format enum values
const formatStatus = (status: string) => status.replace(/_/g, ' ');

const AdminAssistancePage: React.FC = () => {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AssistanceStatus | 'ALL'>('ALL');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await mockApi.assistance.listAll();
      // Sort by newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load assistance requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: AssistanceStatus) => {
    if (!window.confirm(`Are you sure you want to change status to ${formatStatus(newStatus)}?`)) return;
    try {
      await mockApi.assistance.updateStatus(id, newStatus);
      await fetchRequests(); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Failed to update status.");
    }
  };

  const filteredRequests = useMemo(() => {
    if (filter === 'ALL') return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  const getStatusColor = (status: AssistanceStatus) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'REFERRED': return 'bg-blue-100 text-blue-800';
        case 'COMMISSION_PAID': return 'bg-green-100 text-green-800 font-bold';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading requests...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assistance Requests</h1>
        <Button onClick={fetchRequests} variant="secondary" size="sm">Refresh</Button>
      </div>

      <Card>
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2 self-center">Filter:</span>
            {(['ALL', 'PENDING', 'REFERRED', 'COMMISSION_PAID'] as const).map(status => (
                <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        filter === status 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                >
                    {formatStatus(status)}
                </button>
            ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shop / Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRequests.map((req) => (
                        <tr key={req.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-sm font-mono font-bold text-primary dark:text-primary-light">
                                    {req.referenceCode}
                                </span>
                                <div className="text-xs text-gray-500">
                                    {new Date(req.createdAt).toLocaleDateString()}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{req.shopName}</div>
                                <div className="text-sm text-gray-500">{req.ownerName}</div>
                                <div className="text-xs text-gray-400">{req.ownerEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                {formatStatus(req.assistanceType)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                    {formatStatus(req.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <select 
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs p-1"
                                    value=""
                                    onChange={(e) => handleStatusChange(req.id, e.target.value as AssistanceStatus)}
                                >
                                    <option value="" disabled>Change Status...</option>
                                    <option value="REFERRED">Mark Referred</option>
                                    <option value="COMPLETED">Mark Completed</option>
                                    <option value="COMMISSION_PAID">Commission Paid</option>
                                    <option value="CANCELLED">Cancel</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                    {filteredRequests.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                No requests found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminAssistancePage;