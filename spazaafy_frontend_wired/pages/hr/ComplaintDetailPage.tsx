import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft, User, Calendar, FileText, CheckCircle, ShieldAlert, Upload, Search, X } from 'lucide-react';

const ComplaintDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';

    const [complaint, setComplaint] = useState<any>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Close Modal State
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
    const [closeForm, setCloseForm] = useState({
        verdict: '',
        file: null as File | null,
        relatedEmployees: new Set<string>()
    });
    const [submitting, setSubmitting] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        setLoading(true);
        try {
            const [cData, eData] = await Promise.all([
                hrApi.getComplaintById(id!, token),
                hrApi.getEmployees(token)
            ]);
            setComplaint(cData);
            setEmployees(eData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchData(); }, [id]);

    // Handlers
    const handleMarkInvestigating = async () => {
        if (!window.confirm("Mark as Under Investigation? This will email the complainant.")) return;
        try {
            await hrApi.markComplaintInvestigating(id!, token);
            fetchData();
            alert("Status updated and email sent.");
        } catch (e) {
            alert("Error updating status");
        }
    };

    const handleCloseSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!closeForm.file) {
            alert("Please upload an investigation report.");
            return;
        }

        setSubmitting(true);
        const formData = new FormData();
        formData.append('resolution_verdict', closeForm.verdict);
        formData.append('investigation_report', closeForm.file);
        
        // Convert Set to comma-separated string
        const relatedIds = Array.from(closeForm.relatedEmployees).join(',');
        formData.append('related_employees', relatedIds);

        try {
            await hrApi.closeComplaint(id!, formData, token);
            setIsCloseModalOpen(false);
            fetchData();
            alert("Case Closed. Emails have been sent.");
        } catch (error) {
            console.error(error);
            alert("Failed to close case.");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper for Related Employees Checkbox
    const toggleRelatedEmployee = (empId: string) => {
        const newSet = new Set(closeForm.relatedEmployees);
        if (newSet.has(empId)) newSet.delete(empId);
        else newSet.add(empId);
        setCloseForm({ ...closeForm, relatedEmployees: newSet });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!complaint) return <div className="p-8 text-center text-red-500">Complaint not found.</div>;

    const getStatusBadge = (status: string) => {
        const styles = {
            'OPEN': 'bg-red-100 text-red-800',
            'INVESTIGATING': 'bg-yellow-100 text-yellow-800',
            'CLOSED': 'bg-green-100 text-green-800',
        }[status] || 'bg-gray-100';
        return <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles}`}>{status}</span>;
    };

    return (
        <div className="p-6 max-w-5xl mx-auto relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <button onClick={() => navigate('/hr/complaints')} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Complaint #{complaint.id.slice(0, 8)}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <Calendar size={14} /> Filed on {new Date(complaint.created_at).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                <div>{getStatusBadge(complaint.status)}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Details</h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400">Type</span>
                                <p className="font-medium text-gray-900">{complaint.type}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400">Respondent</span>
                                <p className="font-medium text-red-700">{complaint.respondent_name || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <span className="text-xs uppercase font-bold text-gray-400">Description</span>
                            <p className="mt-2 text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                                {complaint.description}
                            </p>
                        </div>
                    </Card>

                    {/* Resolution Section (Only if Closed) */}
                    {complaint.status === 'CLOSED' && (
                        <Card className="p-6 border-l-4 border-green-500">
                            <h3 className="text-lg font-bold mb-4 text-green-800 flex items-center">
                                <CheckCircle size={20} className="mr-2"/> Resolution
                            </h3>
                            <div className="mb-4">
                                <span className="text-xs uppercase font-bold text-gray-400">Verdict</span>
                                <p className="mt-1 text-gray-800">{complaint.resolution_verdict}</p>
                            </div>
                            <div>
                                <span className="text-xs uppercase font-bold text-gray-400">Investigation Report</span>
                                <div className="mt-2">
                                    {complaint.investigation_report ? (
                                        <a 
                                            href={complaint.investigation_report} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-blue-600 hover:bg-gray-50"
                                        >
                                            <FileText size={16} className="mr-2"/> View Report
                                        </a>
                                    ) : <span className="text-gray-400 text-sm">No file attached</span>}
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Complainant Profile */}
                    <Card className="p-6">
                        <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Complainant</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900">{complaint.complainant_name}</p>
                                <p className="text-xs text-gray-500">Employee</p>
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
                        
                        {complaint.status === 'OPEN' && (
                            <Button 
                                className="w-full mb-3 bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
                                onClick={handleMarkInvestigating}
                            >
                                <Search size={16} className="mr-2"/> Mark as Investigating
                            </Button>
                        )}

                        {complaint.status !== 'CLOSED' && (
                            <Button 
                                className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                                onClick={() => setIsCloseModalOpen(true)}
                            >
                                <ShieldAlert size={16} className="mr-2"/> Close Case
                            </Button>
                        )}

                        {complaint.status === 'CLOSED' && (
                            <p className="text-center text-sm text-gray-500 italic">Case is closed. No further actions available.</p>
                        )}
                    </Card>
                </div>
            </div>

            {/* --- CLOSE CASE MODAL --- */}
            {isCloseModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <h3 className="font-bold text-lg">Close Complaint Case</h3>
                            <button onClick={() => setIsCloseModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCloseSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {/* Verdict */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Resolution / Verdict</label>
                                <textarea 
                                    required
                                    rows={4}
                                    className="w-full border rounded p-2 focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter the final outcome of the investigation..."
                                    value={closeForm.verdict}
                                    onChange={e => setCloseForm({...closeForm, verdict: e.target.value})}
                                />
                            </div>

                            {/* Report Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Investigation Report (PDF)</label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                                    <input 
                                        type="file" 
                                        required
                                        className="hidden" 
                                        id="reportUpload"
                                        accept=".pdf,.doc,.docx"
                                        onChange={e => setCloseForm({...closeForm, file: e.target.files?.[0] || null})}
                                    />
                                    <label htmlFor="reportUpload" className="cursor-pointer flex flex-col items-center">
                                        <Upload size={24} className="text-gray-400 mb-2"/>
                                        <span className="text-sm font-medium text-blue-600">
                                            {closeForm.file ? closeForm.file.name : "Click to upload report"}
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Related Employees */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notify Related Employees (Optional)</label>
                                <p className="text-xs text-gray-500 mb-2">Select employees who should receive the case closure notification.</p>
                                <div className="border rounded-lg max-h-40 overflow-y-auto bg-gray-50 p-2 space-y-1">
                                    {employees.map(emp => (
                                        <div key={emp.id} className="flex items-center hover:bg-white p-1 rounded">
                                            <input 
                                                type="checkbox"
                                                id={`related-${emp.id}`}
                                                className="h-4 w-4 text-purple-600 rounded border-gray-300"
                                                checked={closeForm.relatedEmployees.has(emp.id)}
                                                onChange={() => toggleRelatedEmployee(emp.id)}
                                            />
                                            <label htmlFor={`related-${emp.id}`} className="ml-2 text-sm text-gray-700 w-full cursor-pointer">
                                                {emp.first_name} {emp.last_name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 flex-shrink-0">
                            <Button variant="outline" onClick={() => setIsCloseModalOpen(false)}>Cancel</Button>
                            <Button 
                                onClick={handleCloseSubmit} 
                                disabled={submitting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {submitting ? 'Closing Case...' : 'Submit & Close Case'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintDetailPage;