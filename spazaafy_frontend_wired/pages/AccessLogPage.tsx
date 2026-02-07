import React, { useEffect, useState } from 'react';
import mockApi from '../api/mockApi';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { ShieldAlert, UserCheck, History } from 'lucide-react';

const AccessLogPage: React.FC = () => {
    const { token } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Revoke Modal
    const [revokeModalOpen, setRevokeModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [reason, setReason] = useState('');

    const fetchLogs = async () => {
        if (!token) return;
        try {
            const data = await mockApi.accessControl.getAccessLogs(token);
            setLogs(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [token]);

    const handleRevoke = async () => {
        if (!selectedUser || !reason) return;
        if (!window.confirm("This will immediately suspend the user's account. Continue?")) return;
        
        try {
            await mockApi.accessControl.revokeAccess(selectedUser.email, reason, token!);
            alert("User suspended. Request sent to Tech for review.");
            setRevokeModalOpen(false);
            fetchLogs();
        } catch (e) {
            alert("Failed to revoke access.");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <History className="mr-2" /> Access Logs
            </h1>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-xs uppercase font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role Granted</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {log.name} <br/>
                                        <span className="text-gray-500 font-normal">{log.email}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                            {log.role_granted}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(log.granted_at).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {log.is_suspended ? (
                                            <span className="text-red-600 font-bold flex items-center"><ShieldAlert size={14} className="mr-1"/> Suspended</span>
                                        ) : (
                                            <span className="text-green-600 font-bold flex items-center"><UserCheck size={14} className="mr-1"/> Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {!log.is_suspended && (
                                            <Button variant="danger" size="sm" onClick={() => { setSelectedUser(log); setRevokeModalOpen(true); }}>
                                                Revoke Access
                                            </Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={revokeModalOpen} onClose={() => setRevokeModalOpen(false)} title="Revoke Admin Access">
                <div className="space-y-4">
                    <p className="text-red-600 bg-red-50 p-3 rounded border border-red-200 text-sm">
                        Warning: This will immediately <strong>SUSPEND</strong> {selectedUser?.email}. 
                        They will be unable to log in until the Tech Department reviews this request.
                    </p>
                    <div>
                        <label className="block text-sm font-bold mb-1">Reason for Revocation</label>
                        <textarea 
                            className="w-full border rounded p-2" 
                            rows={3} 
                            placeholder="e.g. Suspicious activity, resigned from role..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="neutral" onClick={() => setRevokeModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleRevoke}>Confirm Revocation</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AccessLogPage;