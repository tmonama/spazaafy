import React, { useEffect, useState, useMemo } from 'react';
import { legalApi } from '../../api/legalApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { 
    CheckCircle, XCircle, FileText, Clock, 
    Calendar, AlertOctagon, PauseCircle, RefreshCw, AlertTriangle 
} from 'lucide-react';

const CATEGORY_MAP: Record<string, string> = {
    'contracts': 'CONTRACT',
    'policies': 'POLICY',
    'ip': 'IP',
    'compliance': 'COMPLIANCE',
    'disputes': 'DISPUTE',
    'other': 'OTHER'
};

const STATUS_TABS = [
    { label: 'Pending', value: 'SUBMITTED' },
    { label: 'In Review', value: 'UNDER_REVIEW' },
    { label: 'Amend Req.', value: 'AMENDMENT_REQ' },
    { label: 'Amend. Submitted', value: 'AMENDMENT_SUBMITTED' }, 
    { label: 'Approved/Filed', value: 'APPROVED_FILED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'All', value: 'ALL' }
];

const URGENCY_FILTERS = [
    { label: 'All Urgencies', value: 'ALL' },
    { label: 'Critical (24h)', value: 'CRITICAL' },
    { label: 'Urgent (48h)', value: 'URGENT' },
    { label: 'Priority (5d)', value: 'PRIORITY' },
    { label: 'Routine (14d)', value: 'ROUTINE' }
];

const URGENCY_SLA_DAYS: Record<string, number> = {
    'CRITICAL': 1,
    'URGENT': 2,
    'PRIORITY': 5,
    'ROUTINE': 14
};

interface LegalCategoryPageProps {
    isOverview?: boolean;
    categoryProp?: string;
}

const LegalCategoryPage: React.FC<LegalCategoryPageProps> = ({ isOverview = false, categoryProp }) => {
    const activeCategoryKey = categoryProp || '';
    const token = sessionStorage.getItem('access') || '';
    
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [activeStatusFilter, setActiveStatusFilter] = useState('SUBMITTED');
    const [activeUrgencyFilter, setActiveUrgencyFilter] = useState('ALL');
    
    // Modal State
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [actionType, setActionType] = useState<string>(''); 
    const [note, setNote] = useState('');
    const [amendmentDays, setAmendmentDays] = useState(5);
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

    // --- Helper: Calculate Deadline & Time Left ---
    const getDeadlineData = (req: any) => {
        const created_at = req.created_at;
        const urgency = req.urgency;
        
        // 1. Check for Paused State
        if (req.status === 'AMENDMENT_REQ' && req.amendment_deadline) {
            const amendDate = new Date(req.amendment_deadline);
            const now = new Date();
            const diffMs = amendDate.getTime() - now.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffMs < 0) {
                return {
                    label: `PAUSED (User Late by ${Math.abs(diffDays)}d)`,
                    colorClass: 'text-red-600 bg-red-50 border-red-200',
                    isPaused: true
                };
            }
            return {
                label: `PAUSED (User has ${diffDays}d left)`,
                colorClass: 'text-orange-600 bg-orange-50 border-orange-200',
                isPaused: true
            };
        }

        // 2. Standard SLA Calculation
        const daysAllowed = URGENCY_SLA_DAYS[urgency] || 14;
        const createdDate = new Date(created_at);
        const deadlineDate = new Date(createdDate);
        deadlineDate.setDate(createdDate.getDate() + daysAllowed);
        
        const now = new Date();
        const diffMs = deadlineDate.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        let label = '';
        let colorClass = '';
        let isOverdue = false;

        if (diffMs < 0) {
            isOverdue = true;
            label = `Overdue by ${Math.abs(diffDays)}d ${Math.abs(diffHours)}h`;
            colorClass = 'text-red-600 bg-red-50 border-red-200';
        } else if (diffDays === 0) {
            label = `${diffHours} hours left`;
            colorClass = 'text-orange-600 bg-orange-50 border-orange-200';
        } else {
            label = `${diffDays} days left`;
            colorClass = 'text-gray-600 bg-gray-100 border-gray-200';
        }

        return { deadlineDate, diffMs, label, colorClass, isOverdue, isPaused: false };
    };

    const filteredAndSortedRequests = useMemo(() => {
        let list = [...requests];

        if (!isOverview) {
            const mapKey = activeCategoryKey?.toLowerCase();
            const targetCategory = CATEGORY_MAP[mapKey];
            if (!targetCategory) return [];
            list = list.filter(r => r.category?.toUpperCase() === targetCategory.toUpperCase());
        }

        if (activeStatusFilter !== 'ALL') {
            if (activeStatusFilter === 'APPROVED_FILED') {
                list = list.filter(r => r.status === 'APPROVED' || r.status === 'FILED');
            } else {
                list = list.filter(r => r.status === activeStatusFilter);
            }
        }

        if (activeUrgencyFilter !== 'ALL') {
            list = list.filter(r => r.urgency === activeUrgencyFilter);
        }

        list.sort((a, b) => {
            const isAComplete = ['APPROVED', 'FILED', 'REJECTED'].includes(a.status);
            const isBComplete = ['APPROVED', 'FILED', 'REJECTED'].includes(b.status);
            if (isAComplete && !isBComplete) return 1;
            if (!isAComplete && isBComplete) return -1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); 
        });

        return list;

    }, [requests, activeCategoryKey, isOverview, activeStatusFilter, activeUrgencyFilter]);

    const openActionModal = (request: any, type: string) => {
        setSelectedRequest(request);
        setActionType(type);
        setNote('');
        setAmendmentDays(5);
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
            await legalApi.updateStatus(selectedRequest.id, actionType, note, token, amendmentDays);
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
            case 'AMENDMENT_SUBMITTED': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'APPROVED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'FILED': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="text-center p-12 text-gray-500">Loading Legal Records...</div>;

    const pageTitle = isOverview 
        ? "Legal Overview" 
        : (activeCategoryKey ? activeCategoryKey.charAt(0).toUpperCase() + activeCategoryKey.slice(1) : "Requests");

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
            </div>

            <Card className="p-4 space-y-4">
                <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                    <span className="text-sm font-bold text-gray-500 self-center mr-2 uppercase tracking-wide text-xs">Status:</span>
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setActiveStatusFilter(tab.value)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                activeStatusFilter === tab.value
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-gray-500 self-center mr-2 uppercase tracking-wide text-xs">Urgency:</span>
                    {URGENCY_FILTERS.map((urg) => (
                        <button
                            key={urg.value}
                            onClick={() => setActiveUrgencyFilter(urg.value)}
                            className={`flex items-center px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                activeUrgencyFilter === urg.value
                                    ? 'bg-gray-800 text-white border-gray-800'
                                    : 'bg-white text-gray-500 border-gray-300 hover:border-gray-400'
                            }`}
                        >
                            {urg.value === 'CRITICAL' && <AlertOctagon size={12} className="mr-1" />}
                            {urg.label}
                        </button>
                    ))}
                </div>
            </Card>

            {filteredAndSortedRequests.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    <p className="text-gray-500 text-lg">No documents found matching filters.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredAndSortedRequests.map((req) => {
                        const deadlineData = getDeadlineData(req);
                        const isComplete = ['APPROVED', 'FILED', 'REJECTED'].includes(req.status);
                        
                        // We check both the single revision file OR the list of attachments
                        const hasAttachments = req.attachments && req.attachments.length > 0;
                        const hasRevision = !!req.file_url; 

                        return (
                            <div key={req.id} className={`p-6 rounded-lg bg-white shadow-sm border-l-4 ${
                                req.urgency === 'CRITICAL' ? 'border-red-600' : 
                                req.urgency === 'URGENT' ? 'border-orange-500' : 
                                'border-gray-200'
                            }`}>
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusStyle(req.status)}`}>
                                                {req.status_label}
                                            </span>
                                            <span className="text-xs font-mono text-gray-400">#{req.id.slice(0, 8)}</span>
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                                                {req.category_label}
                                            </span>
                                            {!isComplete && (
                                                <span className={`flex items-center px-2 py-1 rounded text-xs font-bold border ${deadlineData.colorClass}`}>
                                                    {deadlineData.isPaused ? <PauseCircle size={12} className="mr-1"/> : <Clock size={12} className="mr-1" />} 
                                                    {deadlineData.label}
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-1">{req.title}</h3>
                                        
                                        <div className="text-sm text-gray-600 mb-4 flex flex-wrap gap-x-6 gap-y-1">
                                            <span className="flex items-center"><FileText size={14} className="mr-1 text-gray-400"/> {req.submitter_name} ({req.department})</span>
                                            <span className="flex items-center"><Calendar size={14} className="mr-1 text-gray-400"/> Submitted: {new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>

                                        <div className="bg-gray-50 p-4 rounded-md border border-gray-100 text-sm text-gray-700 mb-4">
                                            <strong>Context:</strong> {req.description}
                                        </div>

                                        {/* ✅ FILES SECTION */}
                                        <div className="space-y-2">
                                            {/* 1. Revision / Amendment (Top Priority) */}
                                            {hasRevision && (
                                                <div className="mb-2">
                                                    <a href={req.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 border border-cyan-200 shadow-sm text-sm font-bold rounded-md text-cyan-800 bg-cyan-50 hover:bg-cyan-100">
                                                        <RefreshCw size={16} className="mr-2" /> View Amended Document
                                                    </a>
                                                </div>
                                            )}

                                            {/* 2. Original Attachments List */}
                                            {hasAttachments ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {req.attachments.map((att: any, idx: number) => (
                                                        <a 
                                                            key={att.id || idx}
                                                            href={att.file}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                                            title="View Original Document"
                                                        >
                                                            <FileText size={14} className="mr-2 text-gray-400"/> 
                                                            Original Doc {idx + 1}
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                // Only show error if NO revision AND NO attachments
                                                !hasRevision && (
                                                    <span className="text-red-500 text-sm italic flex items-center">
                                                        <AlertTriangle size={14} className="mr-1" /> No files attached
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px] border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6 justify-center">
                                        
                                        {/* Actions */}
                                        {req.status === 'SUBMITTED' && (
                                            <Button onClick={() => openActionModal(req, 'UNDER_REVIEW')}>
                                                Start Review
                                            </Button>
                                        )}

                                        {(req.status === 'UNDER_REVIEW' || req.status === 'AMENDMENT_REQ' || req.status === 'AMENDMENT_SUBMITTED') && (
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
                                        
                                        {isComplete && (
                                            <div className="text-center p-3 bg-gray-50 rounded border border-gray-200">
                                                {req.status === 'APPROVED' || req.status === 'FILED' ? 
                                                    <CheckCircle className="mx-auto text-green-600 mb-1" size={24} /> : 
                                                    <XCircle className="mx-auto text-red-600 mb-1" size={24} />
                                                }
                                                <p className="text-sm font-bold text-gray-700">{req.status_label}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Update Status">
                <div className="space-y-4">
                    <p className="text-gray-700">
                        Changing status of <strong>{selectedRequest?.title}</strong> to: <br/>
                        <span className="font-bold text-lg">{actionType.replace('_', ' ')}</span>
                    </p>

                    {actionType === 'AMENDMENT_REQ' && (
                        <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm border border-blue-200">
                            <label className="block font-bold mb-2">Days allowed for Amendment:</label>
                            <div className="flex gap-2 mb-2">
                                {[3, 5, 7, 14].map(d => (
                                    <button 
                                        key={d} 
                                        onClick={() => setAmendmentDays(d)}
                                        className={`px-3 py-1 rounded border transition-colors ${amendmentDays === d ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                                    >
                                        {d} Days
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs">
                                The SLA timer will <strong>PAUSE</strong>. A new timer for the user (Deadline: {amendmentDays} days) will start.
                            </p>
                        </div>
                    )}

                    {(actionType === 'AMENDMENT_REQ' || actionType === 'REJECTED') && (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm border border-yellow-200">
                            ⚠️ <strong>Requirement:</strong> You must provide a reason/instruction. This will be emailed to the submitter.
                        </div>
                    )}

                    <div className="mt-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Legal Note / Reason / Instruction
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={4}
                            className="w-full rounded-md border border-gray-300 p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent"
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