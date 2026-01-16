import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { legalApi } from '../../api/legalApi';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { CheckCircle, XCircle, AlertTriangle, FileText, Clock } from 'lucide-react';

const CATEGORY_MAP: Record<string, string> = {
    'contracts': 'CONTRACT',
    'policies': 'POLICY',
    'ip': 'IP',
    'compliance': 'COMPLIANCE',
    'disputes': 'DISPUTE',
    'other': 'OTHER'
};

// Define available tabs for filtering
const FILTER_TABS = [
    { label: 'Pending', value: 'SUBMITTED' },
    { label: 'In Review', value: 'UNDER_REVIEW' },
    { label: 'Amend Req.', value: 'AMENDMENT_REQ' },
    { label: 'Approved/Filed', value: 'APPROVED_FILED' }, // Custom composite filter
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All', value: 'ALL' }
];

const LegalCategoryPage: React.FC<{ isOverview?: boolean }> = ({ isOverview = false }) => {
    const { category } = useParams();
    const token = sessionStorage.getItem('access') || '';
    
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // ✅ 1. Add Filter State (Default to 'SUBMITTED' aka Pending, or 'ALL')
    const [activeFilter, setActiveFilter] = useState('SUBMITTED');
    
    // Action Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<string>(''); 
    const [note, setNote] = useState('');
    const [processingAction, setProcessingAction] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await legalApi.getAllRequests(token);
            // Sort: Critical first, then newest
            data.sort((a: any, b: any) => {
                if (a.urgency === 'CRITICAL' && b.urgency !== 'CRITICAL') return -1;
                if (b.urgency === 'CRITICAL' && a.urgency !== 'CRITICAL') return 1;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
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
        let list = requests;

        // 1. Filter by Category (if not dashboard overview)
        if (!isOverview) {
            const backendCategory = CATEGORY_MAP[category || ''];
            if (backendCategory) {
                list = list.filter(r => r.category === backendCategory);
            } else {
                return [];
            }
        }

        // 2. Filter by Tab Status
        if (activeFilter === 'ALL') return list;
        
        if (activeFilter === 'APPROVED_FILED') {
            return list.filter(r => r.status === 'APPROVED' || r.status === 'FILED');
        }

        return list.filter(r => r.status === activeFilter);

    }, [requests, category, isOverview, activeFilter]);

    // ... (Keep existing modal handlers: openActionModal, submitAction) ...
    const openActionModal = (request: any, type: string) => {
        setSelectedRequest(request);
        setActionType(type);
        setNote('');
        setModalOpen(true);
    };

    const submitAction = async () => {
        if (!selectedRequest) return;
        if ((actionType === 'AMENDMENT_REQ' || actionType === 'REJECTED') && !note.trim()) {
            alert("A reason is strictly required for this action.");
            return;
        }
        setProcessingAction(true);
        try {
            await legalApi.updateStatus(selectedRequest.id, actionType, note, token);
            setModalOpen(false);
            fetchRequests(); 
        } catch (e) {
            alert("Failed to update status");
        } finally {
            setProcessingAction(false);
        }
    };

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'SUBMITTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'AMENDMENT_REQ': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'FILED': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center p-12 text-gray-500">Loading Legal Records...</div>;

    const pageTitle = isOverview ? "Legal Overview" : (category ? category.charAt(0).toUpperCase() + category.slice(1) : "Requests");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
            </div>

            {/* ✅ 2. Filter Tabs (Styled like Admin Portal) */}
            <Card className="p-1">
                <div className="flex flex-wrap gap-2 p-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 self-center mr-2">Filter by status:</span>
                    {FILTER_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveFilter(tab.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                                activeFilter === tab.value
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </Card>

            {filteredRequests.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No documents found with status: <strong>{activeFilter.replace('_', ' ')}</strong></p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredRequests.map((req) => (
                        // Matches DocumentReviewItem style
                        <div key={req.id} className={`p-6 rounded-lg bg-white dark:bg-gray-800 shadow-sm border-l-4 ${
                            req.urgency === 'CRITICAL' ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                        }`}>
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusStyle(req.status)}`}>
                                            {req.status_label}
                                        </span>
                                        <span className="text-xs font-mono text-gray-400">{req.id.slice(0, 8)}</span>
                                        {req.urgency === 'CRITICAL' && (
                                            <span className="flex items-center px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                                                <AlertTriangle size={12} className="mr-1" /> CRITICAL
                                            </span>
                                        )}
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                            {req.category_label}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{req.title}</h3>
                                    
                                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex flex-wrap gap-x-4">
                                        <span className="flex items-center"><FileText size={14} className="mr-1"/> {req.submitter_name} ({req.department})</span>
                                        <span className="flex items-center"><Clock size={14} className="mr-1"/> {new Date(req.created_at).toLocaleDateString()}</span>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md border border-gray-100 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300 mb-4">
                                        <strong>Context:</strong> {req.description}
                                    </div>

                                    {/* Download/View Link */}
                                    {req.file_url ? (
                                        <a href={req.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600">
                                            📄 View Attached Document
                                        </a>
                                    ) : (
                                        <span className="text-red-500 text-sm italic">No file attached</span>
                                    )}
                                </div>

                                {/* ACTION WORKFLOW */}
                                <div className="flex flex-col gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 pt-4 lg:pt-0 lg:pl-6 justify-center">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 lg:hidden">Actions</p>

                                    {req.status === 'SUBMITTED' && (
                                        <Button onClick={() => openActionModal(req, 'UNDER_REVIEW')}>
                                            Start Review
                                        </Button>
                                    )}

                                    {(req.status === 'UNDER_REVIEW' || req.status === 'AMENDMENT_REQ') && (
                                        <>
                                            <Button variant="neutral" size="sm" onClick={() => openActionModal(req, 'AMENDMENT_REQ')}>
                                                Request Amendment
                                            </Button>
                                            <Button variant="primary" size="sm" onClick={() => openActionModal(req, 'APPROVED')}>
                                                Approve &amp; Sign
                                            </Button>
                                            <Button variant="secondary" size="sm" onClick={() => openActionModal(req, 'FILED')}>
                                                Mark as Filed
                                            </Button>
                                            <Button variant="danger" size="sm" onClick={() => openActionModal(req, 'REJECTED')}>
                                                Reject
                                            </Button>
                                        </>
                                    )}
                                    
                                    {['APPROVED', 'FILED'].includes(req.status) && (
                                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                                            <CheckCircle className="mx-auto text-green-600 mb-1" size={24} />
                                            <p className="text-sm font-bold text-green-800 dark:text-green-300">{req.status_label}</p>
                                        </div>
                                    )}
                                    {req.status === 'REJECTED' && (
                                        <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                                            <XCircle className="mx-auto text-red-600 mb-1" size={24} />
                                            <p className="text-sm font-bold text-red-800 dark:text-red-300">Rejected</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ACTION MODAL */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Status">
                <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">
                        Changing status of <strong>{selectedRequest?.title}</strong> to: <br/>
                        <span className="font-bold text-lg">{actionType.replace('_', ' ')}</span>
                    </p>

                    {(actionType === 'AMENDMENT_REQ' || actionType === 'REJECTED') && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded text-sm border border-yellow-200 dark:border-yellow-700">
                            ⚠️ <strong>Requirement:</strong> You must provide a reason/instruction. This will be emailed to the submitter.
                        </div>
                    )}

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Legal Note / Reason / Instruction
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter detailed comments here..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="neutral" onClick={() => setModalOpen(false)}>Cancel</Button>
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