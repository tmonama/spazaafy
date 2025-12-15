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
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // To show loading state during bulk update

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await mockApi.assistance.listAll();
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRequests(data);
      setSelectedIds(new Set()); 
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

  // Bulk Selection
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

  const handleSelectByType = (type: string) => {
    const idsOfType = filteredRequests.filter(r => r.assistanceType === type).map(r => r.id);
    setSelectedIds(new Set(idsOfType));
  };

  // ✅ ACTION 1: Refer
  const handleBulkReferral = async (name: string, email: string) => {
    try {
      await mockApi.assistance.refer(Array.from(selectedIds), name, email);
      alert(`Successfully referred ${selectedIds.size} requests.`);
      fetchRequests(); 
    } catch (e) {
      alert("Failed to send referrals.");
    }
  };

  // ✅ ACTION 2: Bulk Status Change
  const handleBulkStatusChange = async (newStatus: string) => {
    if (!newStatus) return; // Ignore default option
    const status = newStatus as AssistanceStatus;
    
    if (!window.confirm(`Are you sure you want to mark ${selectedIds.size} items as ${formatStatus(status)}?`)) return;

    setIsUpdating(true);
    try {
        await mockApi.assistance.bulkUpdateStatus(Array.from(selectedIds), status);
        fetchRequests(); // Refresh table
    } catch (e) {
        console.error(e);
        alert("Failed to update statuses.");
    } finally {
        setIsUpdating(false);
    }
  };

  // ✅ ACTION 3: Single Status Change (Inline)
  const handleSingleStatusChange = async (id: string, newStatus: AssistanceStatus) => {
    if (!window.confirm(`Change status to ${formatStatus(newStatus)}?`)) return;
    try {
      await mockApi.assistance.updateStatus(id, newStatus);
      fetchRequests();
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status: AssistanceStatus) => {
    switch (status) {
        case 'PENDING': return 'bg-yellow-100 text-yellow-800';
        case 'REFERRED': return 'bg-blue-100 text-blue-800';
        case 'COMMISSION_PAID': return 'bg-green-100 text-green-800 font-bold';
        case 'CANCELLED': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assistance Requests</h1>
        <Button onClick={fetchRequests} variant="secondary" size="sm">Refresh</Button>
      </div>

      <Card>
        {/* ✅ BULK ACTION BAR (Visible only when items selected) */}
        {selectedIds.size > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 border-b border-blue-200 dark:border-blue-800 flex flex-wrap items-center justify-between gap-4">
                <span className="text-sm font-bold text-blue-800 dark:text-blue-200">
                    {selectedIds.size} Selected
                </span>
                
                <div className="flex gap-2">
                    {/* Refer Button */}
                    <Button onClick={() => setIsModalOpen(true)} size="sm">
                        Refer Selected
                    </Button>

                    {/* Bulk Status Dropdown */}
                    <select 
                        className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 dark:bg-gray-800 dark:text-white"
                        onChange={(e) => handleBulkStatusChange(e.target.value)}
                        disabled={isUpdating}
                        value=""
                    >
                        <option value="" disabled>Change Status to...</option>
                        <option value="PENDING">Pending</option>
                        <option value="REFERRED">Referred</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="COMMISSION_PAID">Commission Paid</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>
            </div>
        )}

        {/* Filters & Quick Select */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">Filter:</span>
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
            
            <select 
                className="text-sm border border-gray-300 dark:border-gray-600 rounded p-1 dark:bg-gray-800 dark:text-white"
                onChange={(e) => handleSelectByType(e.target.value)}
                value=""
            >
                <option value="" disabled>Quick Select by Type...</option>
                <option value="CIPC_REGISTRATION">All CIPC Registration</option>
                <option value="SARS_TAX_CLEARANCE">All SARS Tax</option>
                <option value="HEALTH_CERTIFICATE">All Health Certs</option>
                <option value="TRADING_LICENSE">All Trading Licenses</option>
            </select>
        </div>

        {/* Table */}
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(req.status)}`}>
                                    {formatStatus(req.status)}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {/* Single Status Change Dropdown */}
                                <select 
                                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs p-1"
                                    value={req.status}
                                    onChange={(e) => handleSingleStatusChange(req.id, e.target.value as AssistanceStatus)}
                                >
                                    <option value="PENDING">Pending</option>
                                    <option value="REFERRED">Referred</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="COMMISSION_PAID">Commission Paid</option>
                                    <option value="CANCELLED">Cancel</option>
                                </select>
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