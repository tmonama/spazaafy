import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employeeApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { 
    MessageSquare, AlertCircle, CheckCircle, Clock, 
    Plus, FileText, X, Download, ShieldCheck 
} from 'lucide-react';

const COMPLAINT_TYPES = [
    { label: 'Grievance', value: 'GRIEVANCE' },
    { label: 'Misconduct', value: 'MISCONDUCT' },
    { label: 'Harassment', value: 'HARASSMENT' },
    { label: 'Other', value: 'OTHER' }
];

const EmployeeComplaintsPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Create Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newComplaint, setNewComplaint] = useState({
        type: 'GRIEVANCE',
        description: ''
    });

    // Resolution View Modal State
    const [resolutionModal, setResolutionModal] = useState<any>(null); // Holds the complaint object to view

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const data = await employeeApi.getMyComplaints(token);
            setComplaints(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchComplaints(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await employeeApi.fileComplaint(newComplaint, token);
            setIsCreateOpen(false);
            setNewComplaint({ type: 'GRIEVANCE', description: '' });
            fetchComplaints();
            alert("Complaint submitted successfully.");
        } catch (e) {
            alert("Failed to submit complaint.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OPEN': return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded font-bold border border-red-200">Open</span>;
            case 'INVESTIGATING': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded font-bold border border-yellow-200">Under Investigation</span>;
            case 'CLOSED': return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded font-bold border border-green-200">Resolved / Closed</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Unknown</span>;
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading your cases...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
                    <p className="text-gray-500 text-sm">Track the status of your reported issues.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus size={16} className="mr-2"/> Log New Complaint
                </Button>
            </div>

            <div className="space-y-4">
                {complaints.length === 0 ? (
                    <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <MessageSquare className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-500">You haven't logged any complaints.</p>
                    </div>
                ) : (
                    complaints.map(c => (
                        <Card key={c.id} className="p-6 transition hover:shadow-md border border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        {getStatusBadge(c.status)}
                                        <span className="text-xs font-semibold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded">
                                            {c.type}
                                        </span>
                                        <span className="flex items-center text-xs text-gray-400">
                                            <Clock size={12} className="mr-1" /> {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 text-sm mb-3 line-clamp-2">{c.description}</p>
                                    
                                    {c.status === 'INVESTIGATING' && (
                                        <p className="text-xs text-yellow-700 flex items-center bg-yellow-50 p-2 rounded max-w-fit">
                                            <AlertCircle size={12} className="mr-1"/> HR is currently investigating this matter.
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    {c.status === 'CLOSED' ? (
                                        <Button 
                                            size="sm" 
                                            className="bg-green-600 hover:bg-green-700 border-green-600 text-white shadow-sm"
                                            onClick={() => setResolutionModal(c)}
                                        >
                                            <ShieldCheck size={16} className="mr-2" />
                                            View Resolution
                                        </Button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic px-4">Resolution Pending</span>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* --- CREATE COMPLAINT MODAL --- */}
            <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Log a Complaint">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
                        Your complaint will be sent directly to HR. Please provide as much detail as possible.
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Type of Issue</label>
                        <select 
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-purple-500" 
                            value={newComplaint.type}
                            onChange={e => setNewComplaint({...newComplaint, type: e.target.value})}
                        >
                            {COMPLAINT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Description</label>
                        <textarea 
                            className="w-full border rounded p-2 focus:ring-2 focus:ring-purple-500" 
                            rows={5} 
                            value={newComplaint.description} 
                            onChange={e => setNewComplaint({...newComplaint, description: e.target.value})} 
                            required 
                            placeholder="Please describe the incident, including dates, names, and details..."
                        />
                    </div>
                    <div className="flex justify-center pt-2">
                        <Button type="submit">Submit Complaint</Button>
                    </div>

                </form>
            </Modal>

            {/* --- VIEW RESOLUTION MODAL --- */}
            {resolutionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-green-50 flex-shrink-0">
                            <div className="flex items-center text-green-800">
                                <CheckCircle size={20} className="mr-2"/>
                                <h3 className="font-bold text-lg">Case Resolution</h3>
                            </div>
                            <button onClick={() => setResolutionModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6 overflow-y-auto">
                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">HR Verdict / Outcome</span>
                                <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {resolutionModal.resolution_verdict || "No details provided."}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Official Documents</span>
                                <div className="mt-2">
                                    {resolutionModal.report_url ? (
                                        <a 
                                            href={resolutionModal.report_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-between p-4 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition group"
                                        >
                                            <div className="flex items-center text-blue-700">
                                                <FileText size={20} className="mr-3"/>
                                                <span className="font-medium">Investigation Report</span>
                                            </div>
                                            <Download size={18} className="text-blue-400 group-hover:text-blue-700"/>
                                        </a>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic mt-1">No investigation report attached.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div className="text-center">
                                <p className="text-xs text-gray-400">
                                    Case closed on {new Date(resolutionModal.resolved_at || resolutionModal.updated_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end flex-shrink-0">
                            <Button onClick={() => setResolutionModal(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeComplaintsPage;