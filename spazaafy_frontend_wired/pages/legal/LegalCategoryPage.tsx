import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { legalApi } from '../../api/legalApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';

// Map URL slugs to Backend ENUMs
const CATEGORY_MAP: Record<string, string> = {
    'contracts': 'CONTRACT',
    'policies': 'POLICY',
    'ip': 'IP',
    'compliance': 'COMPLIANCE',
    'disputes': 'DISPUTE',
    'other': 'OTHER'
};

const LegalCategoryPage: React.FC<{ isOverview?: boolean }> = ({ isOverview = false }) => {
    const { category } = useParams();
    const token = sessionStorage.getItem('access') || '';
    
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Action Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<string>(''); // REJECTED, AMENDMENT_REQ, APPROVED, FILED, UNDER_REVIEW
    const [note, setNote] = useState('');
    const [processingAction, setProcessingAction] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await legalApi.getAllRequests(token);
            setRequests(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = useMemo(() => {
        if (isOverview) return requests; // Show all
        const backendCategory = CATEGORY_MAP[category || ''];
        if (!backendCategory) return [];
        return requests.filter(r => r.category === backendCategory);
    }, [requests, category, isOverview]);

    const openActionModal = (request: any, type: string) => {
        setSelectedRequest(request);
        setActionType(type);
        setNote('');
        
        // Immediate actions don't need a modal if no note is strictly required, 
        // but for legal, adding a note is always good practice.
        // We will force modal for Amendment & Rejection.
        if (type === 'UNDER_REVIEW' || type === 'APPROVED' || type === 'FILED') {
             // Optional: You could execute immediately here, but let's keep it uniform
        }
        setModalOpen(true);
    };

    const submitAction = async () => {
        if (!selectedRequest) return;
        
        // Validation for negative actions
        if ((actionType === 'AMENDMENT_REQ' || actionType === 'REJECTED') && !note.trim()) {
            alert("A reason/note is required for this action.");
            return;
        }

        setProcessingAction(true);
        try {
            await legalApi.updateStatus(selectedRequest.id, actionType, note, token);
            setModalOpen(false);
            fetchRequests(); // Refresh list
        } catch (e) {
            alert("Failed to update status");
        } finally {
            setProcessingAction(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            'SUBMITTED': 'bg-blue-100 text-blue-800',
            'UNDER_REVIEW': 'bg-yellow-100 text-yellow-800',
            'AMENDMENT_REQ': 'bg-orange-100 text-orange-800',
            'APPROVED': 'bg-green-100 text-green-800',
            'REJECTED': 'bg-red-100 text-red-800',
            'FILED': 'bg-purple-100 text-purple-800',
        }[status] || 'bg-gray-100 text-gray-800';
        
        return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles}`}>{status.replace('_', ' ')}</span>;
    };

    if (loading) return <div className="text-center p-8">Loading Legal Records...</div>;

    const pageTitle = isOverview ? "Legal Overview" : (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Requests");

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                <div className="text-sm text-gray-500">
                    Total Records: {filteredRequests.length}
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <Card className="p-8 text-center text-gray-500">
                    No documents found in this category.
                </Card>
            ) : (
                <div className="grid gap-6">
                    {filteredRequests.map((req) => (
                        <Card key={req.id} className="p-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(req.status)}
                                        <span className="text-xs font-mono text-gray-400">{req.reference_code || req.id.slice(0, 8)}</span>
                                        {req.urgency === 'CRITICAL' && <span className="text-xs font-bold text-red-600 border border-red-200 px-2 py-0.5 rounded bg-red-50">CRITICAL</span>}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{req.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        <span className="font-medium">From:</span> {req.submitter_name} ({req.department}) &bull; {new Date(req.created_at).toLocaleDateString()}
                                    </p>
                                    <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-700 mb-4 border border-gray-100">
                                        {req.description}
                                    </div>

                                    {req.file_url && (
                                        <a href={req.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                                            📄 View Attached Document
                                        </a>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 min-w-[180px] border-l pl-4 border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Actions</p>
                                    
                                    {req.status === 'SUBMITTED' && (
                                        <Button size="sm" onClick={() => openActionModal(req, 'UNDER_REVIEW')}>Take Review</Button>
                                    )}

                                    {(req.status === 'UNDER_REVIEW' || req.status === 'AMENDMENT_REQ') && (
                                        <>
                                            <Button size="sm" variant="outline" onClick={() => openActionModal(req, 'AMENDMENT_REQ')}>Request Amendment</Button>
                                            <Button size="sm" variant="primary" onClick={() => openActionModal(req, 'APPROVED')}>Approve</Button>
                                            <Button size="sm" variant="secondary" onClick={() => openActionModal(req, 'FILED')}>Mark Filed</Button>
                                            <Button size="sm" variant="danger" onClick={() => openActionModal(req, 'REJECTED')}>Reject</Button>
                                        </>
                                    )}
                                    
                                    {['APPROVED', 'FILED', 'REJECTED'].includes(req.status) && (
                                        <span className="text-sm text-gray-500 italic text-center py-2">Action completed</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* ACTION MODAL */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Status">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Changing status of <strong>{selectedRequest?.title}</strong> to: 
                        <span className="font-bold ml-1">{actionType.replace('_', ' ')}</span>
                    </p>

                    {(actionType === 'AMENDMENT_REQ' || actionType === 'REJECTED') && (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm mb-2">
                            ⚠️ You must provide a reason. An email will be sent to the submitter.
                        </div>
                    )}

                    <Input 
                        id="note" 
                        label="Legal Note / Reason" 
                        value={note} 
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Enter comments, instructions, or filing details here..."
                        required={(actionType === 'AMENDMENT_REQ' || actionType === 'REJECTED')}
                    />

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                        <Button 
                            variant={actionType === 'REJECTED' ? 'danger' : 'primary'} 
                            onClick={submitAction}
                            isLoading={processingAction}
                        >
                            Confirm Update
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default LegalCategoryPage;