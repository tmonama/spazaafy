// src/pages/admin/AdminAssistancePage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import { AssistanceRequest, AssistanceStatus } from '../../types';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ReferralModal from '../../components/ReferralModal';

const formatStatus = (status: string) => status.replace(/_/g, ' ');

const AdminAssistancePage: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AssistanceStatus | 'ALL'>('ALL');
  
  // ✅ Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await mockApi.assistance.listAll();
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(data);
      setSelectedIds(new Set()); // Reset selection on refresh
    } catch (error) {
      console.error(error);
      alert("Failed to load requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  // Filtering
  const filteredRequests = useMemo(() => {
    if (filter === 'ALL') return requests;
    return requests.filter(r => r.status === filter);
  }, [requests, filter]);

  // Bulk Selection Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = filteredRequests.map(r => r.id);
      setSelectedIds(new Set(allIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkReferral = async (name: string, email: string) => {
    try {
      await mockApi.assistance.refer(Array.from(selectedIds), name, email);
      alert(`Successfully referred ${selectedIds.size} requests.`);
      fetchRequests(); // Refresh data
    } catch (e) {
      alert("Failed to send referrals.");
    }
  };

  // Helper to select all of a specific type (e.g. select all CIPC)
  const handleSelectByType = (type: string) => {
    const idsOfType = filteredRequests.filter(r => r.assistanceType === type).map(r => r.id);
    setSelectedIds(new Set(idsOfType));
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assistance Requests</h1>
        <div className="flex gap-2">
            {selectedIds.size > 0 && (
                <Button onClick={() => setIsModalOpen(true)}>
                    Refer Selected ({selectedIds.size})
                </Button>
            )}
            <Button onClick={fetchRequests} variant="secondary" size="sm">Refresh</Button>
        </div>
      </div>

      <Card>
        {/* Filters & Bulk Tools */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Status:</span>
                {(['ALL', 'PENDING', 'REFERRED', 'COMMISSION_PAID'] as const).map(status => (
                    <button
                        key={status}
                        onClick={() => { setFilter(status); setSelectedIds(new Set()); }}
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            filter === status ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                    >
                        {formatStatus(status)}
                    </button>
                ))}
            </div>
            
            {/* Quick Select by Type Dropdown */}
            <select 
                className="text-sm border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-800 dark:text-white"
                onChange={(e) => handleSelectByType(e.target.value)}
                defaultValue=""
            >
                <option value="" disabled>Quick Select by Type...</option>
                <option value="CIPC_REGISTRATION">All CIPC Registration</option>
                <option value="SARS_TAX_CLEARANCE">All SARS Tax</option>
                <option value="HEALTH_CERTIFICATE">All Health Certs</option>
            </select>
        </div>

        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        <th className="px-4 py-3 w-10">
                            <input 
                                type="checkbox" 
                                onChange={handleSelectAll} 
                                checked={filteredRequests.length > 0 && selectedIds.size === filteredRequests.length}
                            />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3"></th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRequests.map((req) => (
                        <tr key={req.id} className={selectedIds.has(req.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                            <td className="px-4 py-4">
                                <input 
                                    type="checkbox" 
                                    checked={selectedIds.has(req.id)} 
                                    onChange={() => handleSelectOne(req.id)}
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate(`/admin/assistance/${req.id}`)}>
                                {req.referenceCode}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">{req.shopName}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{formatStatus(req.assistanceType)}</td>
                            <td className="px-6 py-4 text-sm">{formatStatus(req.status)}</td>
                            <td className="px-6 py-4 text-right text-sm">
                                <button onClick={() => navigate(`/admin/assistance/${req.id}`)} className="text-blue-600 hover:underline">View</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      <ReferralModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleBulkReferral}
        count={selectedIds.size}
      />
    </div>
  );
};

export default AdminAssistancePage;