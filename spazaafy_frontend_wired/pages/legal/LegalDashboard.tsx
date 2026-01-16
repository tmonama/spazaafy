import React, { useEffect, useState } from 'react';
import { legalApi } from '../../api/legalApi';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';

const LegalDashboard: React.FC = () => {
    // ✅ FIX: Don't destructure 'token' from useAuth. Get it from storage.
    const { user } = useAuth(); 
    const token = sessionStorage.getItem('access') || ''; 
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        if (token) {
            legalApi.getAllRequests(token).then(setRequests).catch(console.error);
        }
    }, [token]);

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800';
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'CRITICAL': return 'bg-purple-100 text-purple-800 font-bold border-purple-500 border';
            default: return 'bg-gray-100';
        }
    };

    const handleAction = async (id: string, status: string) => {
        const note = prompt("Add an internal legal note (optional):");
        if (note !== null) {
            await legalApi.updateStatus(id, status, note, token);
            // Refresh list
            const data = await legalApi.getAllRequests(token);
            setRequests(data);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Legal & Compliance Authority</h1>
                <div className="bg-gray-800 text-white px-4 py-2 rounded text-xs font-mono">
                    SECURE ENVIRONMENT
                </div>
            </div>

            <div className="space-y-4">
                {requests.map(req => (
                    <Card key={req.id} className="p-4 border-l-4 border-l-gray-800">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(req.status)}`}>{req.status_label}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(req.urgency)}`}>{req.urgency_label}</span>
                                    <span className="px-2 py-0.5 rounded text-xs bg-gray-200">{req.category_label}</span>
                                </div>
                                <h3 className="text-xl font-bold">{req.title}</h3>
                                <p className="text-sm text-gray-500">
                                    Submitted by: {req.submitter_name} ({req.department}) on {new Date(req.created_at).toLocaleDateString()}
                                </p>
                                <p className="mt-2 text-gray-700">{req.description}</p>
                                
                                {req.document_file && (
                                    <a href={req.file_url} target="_blank" className="text-blue-600 underline text-sm mt-2 block">
                                        View Document
                                    </a>
                                )}
                            </div>

                            {/* Approval Authority Controls */}
                            <div className="flex flex-col gap-2">
                                {req.status === 'SUBMITTED' && (
                                    <>
                                        <button 
                                            onClick={() => handleAction(req.id, 'UNDER_REVIEW')}
                                            className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                                        >
                                            Take Review
                                        </button>
                                    </>
                                )}
                                
                                {req.status === 'UNDER_REVIEW' && (
                                    <>
                                        <button 
                                            onClick={() => handleAction(req.id, 'AMENDMENT_REQ')}
                                            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600"
                                        >
                                            Request Amendments
                                        </button>
                                        <button 
                                            onClick={() => handleAction(req.id, 'APPROVED')}
                                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                        >
                                            Approve & Execute
                                        </button>
                                        <button 
                                            onClick={() => handleAction(req.id, 'REJECTED')}
                                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default LegalDashboard;