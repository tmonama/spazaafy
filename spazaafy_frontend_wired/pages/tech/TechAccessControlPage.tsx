import React, { useEffect, useState } from 'react';
import mockApi from '../../api/mockApi';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Shield, Check, X } from 'lucide-react';

const TechAccessControlPage: React.FC = () => {
    const { token } = useAuth();
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const data = await mockApi.accessControl.getRevocationRequests(token!);
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [token]);

    const handleDecision = async (id: string, decision: 'ACCEPT' | 'REJECT') => {
        if (!window.confirm(`Confirm ${decision}?`)) return;
        try {
            await mockApi.accessControl.resolveRevocation(id, decision, token!);
            fetchRequests();
            alert(decision === 'ACCEPT' ? "User downgraded to Employee." : "User restored to Admin.");
        } catch (e) {
            alert("Failed to process.");
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Shield className="mr-2 text-purple-600" /> Access Control (Revocations)
            </h1>

            {requests.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-lg shadow border border-gray-200">
                    <p className="text-gray-500">No pending revocation requests.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {requests.map(req => (
                        <Card key={req.id} className="border-l-4 border-l-red-500">
                            <div className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Target User</p>
                                        <h3 className="text-lg font-bold">{req.target_user_email}</h3>
                                        <p className="text-sm text-gray-600">Previous Role: {req.previous_role}</p>
                                    </div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">PENDING</span>
                                </div>
                                
                                <div className="bg-gray-50 p-3 rounded text-sm">
                                    <p className="font-bold text-gray-700">Reason:</p>
                                    <p>{req.reason}</p>
                                    <p className="text-xs text-gray-400 mt-2">Requested by: {req.requested_by_email}</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button 
                                        className="flex-1 bg-green-600 hover:bg-green-700" 
                                        onClick={() => handleDecision(req.id, 'ACCEPT')}
                                    >
                                        <Check size={16} className="mr-2"/> Accept (Downgrade)
                                    </Button>
                                    <Button 
                                        className="flex-1 bg-gray-500 hover:bg-gray-600" 
                                        onClick={() => handleDecision(req.id, 'REJECT')}
                                    >
                                        <X size={16} className="mr-2"/> Reject (Restore)
                                    </Button>
                                </div>
                                <p className="text-xs text-center text-gray-400">
                                    Accepting makes them an EMPLOYEE. Rejecting restores their ADMIN access.
                                </p>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TechAccessControlPage;