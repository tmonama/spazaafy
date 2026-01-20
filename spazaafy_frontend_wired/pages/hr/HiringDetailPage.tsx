import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { 
    ArrowLeft, FileText, CheckSquare, Square, Calendar, 
    XCircle, CheckCircle, Clock, Copy, MapPin, Video, Edit 
} from 'lucide-react';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const HiringDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';

    const [job, setJob] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [copied, setCopied] = useState(false);

    // --- Edit Modal State ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editDesc, setEditDesc] = useState('');
    const [editDeadline, setEditDeadline] = useState('');

    // --- Interview Modal State ---
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
    const [targetAppId, setTargetAppId] = useState<string | null>(null);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewType, setInterviewType] = useState('ONLINE'); // ONLINE | IN_PERSON
    const [interviewLocation, setInterviewLocation] = useState('');
    const [interviewNotes, setInterviewNotes] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const jobData = await hrApi.getHiringRequestById(id!, token);
            setJob(jobData);
            
            // Pre-fill edit state
            setEditDesc(jobData.job_description || '');
            if (jobData.application_deadline) {
                // Format for datetime-local input (YYYY-MM-DDTHH:mm)
                setEditDeadline(jobData.application_deadline.slice(0, 16)); 
            }

            const allApps = await hrApi.getApplications(token);
            setApplications(allApps.filter((a: any) => a.hiring_request === id));
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    // --- Actions ---

    const copyLink = () => {
        const url = `${window.location.origin}/jobs/${id}/apply`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleUpdateJob = async () => {
        try {
            await hrApi.updateHiringRequest(id!, { 
                job_description: editDesc,
                application_deadline: editDeadline 
            }, token);
            setIsEditModalOpen(false);
            fetchData(); // Refresh to show new details
            alert("Job details updated successfully.");
        } catch (e) {
            alert("Failed to update job details.");
        }
    };

    const handleReject = async (appId: string) => {
        if (!window.confirm("Reject this candidate? They will receive a regret email.")) return;
        await hrApi.bulkUpdateApplications([appId], 'REJECTED', token);
        fetchData();
    };

    const handleHire = async (appId: string) => {
        if (!window.confirm("Confirm hiring this candidate? This will create an employee profile.")) return;
        await hrApi.selectCandidate(appId, token);
        fetchData();
        alert("Candidate hired successfully.");
    };

    const openInterviewModal = (appId: string) => {
        setTargetAppId(appId);
        setInterviewDate('');
        setInterviewType('ONLINE');
        setInterviewLocation('');
        setInterviewNotes('');
        setIsInterviewModalOpen(true);
    };

    const submitInterview = async () => {
        if (!targetAppId) return;
        await hrApi.scheduleInterview(targetAppId, interviewDate, interviewType, interviewLocation, interviewNotes, token);
        setIsInterviewModalOpen(false);
        fetchData();
        alert("Interview scheduled & email sent.");
    };

    const handleBulkStatus = async (status: string) => {
        if (selectedIds.size === 0) return;
        if (!window.confirm(`Mark ${selectedIds.size} applicants as ${status}? Emails will be sent appropriately.`)) return;
        try {
            await hrApi.bulkUpdateApplications(Array.from(selectedIds), status, token);
            setSelectedIds(new Set());
            fetchData();
        } catch (e) {
            alert("Failed to update status");
        }
    };

    // --- Selection Logic ---
    const toggleSelectAll = () => {
        if (selectedIds.size === applications.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(applications.map(a => a.id)));
        }
    };

    const toggleSelectOne = (appId: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(appId)) newSet.delete(appId);
        else newSet.add(appId);
        setSelectedIds(newSet);
    };

    if (loading) return <div className="p-8 text-center">Loading Job Details...</div>;
    if (!job) return <div className="p-8 text-center text-red-500">Job not found.</div>;

    return (
        <div className="p-6">
            {/* Page Header */}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/hr/hiring')} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{job.role_title}</h1>
                    <p className="text-sm text-gray-500">
                        {DEPARTMENT_LABELS[job.department] || job.department} • {job.status}
                    </p>
                </div>
            </div>

            {/* Job Details Card */}
            <Card className="p-6 mb-8 bg-white shadow-sm border-l-4 border-blue-500 relative">
                <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                        <h3 className="font-bold text-lg mb-2">Job Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{job.job_description || "No description provided."}</p>
                        
                        <div className="mt-4 flex gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                                <Calendar size={14} className="mr-1"/> 
                                Posted: {new Date(job.created_at).toLocaleDateString()}
                            </span>
                            {job.application_deadline && (
                                <span className="flex items-center text-orange-600 font-bold">
                                    <Clock size={14} className="mr-1"/> 
                                    Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        {/* Edit Button */}
                        <Button size="sm" variant="outline" onClick={() => setIsEditModalOpen(true)}>
                            <Edit size={16} className="mr-1" /> Edit Details
                        </Button>

                        {/* Share Link Box */}
                        {job.status === 'OPEN' && (
                            <div className="bg-gray-50 p-3 rounded border border-gray-200 w-64">
                                <p className="text-xs font-bold text-gray-500 mb-1 uppercase">Share Public Link</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-xs bg-white border p-1 rounded truncate">
                                        {window.location.origin}/jobs/{job.id}/apply
                                    </code>
                                    <button onClick={copyLink} className="text-blue-600 hover:text-blue-800">
                                        {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Card>

            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Applicants ({applications.length})</h2>
            </div>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg flex items-center justify-between animate-fade-in">
                    <span className="font-bold text-blue-800 text-sm">{selectedIds.size} Selected</span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleBulkStatus('SHORTLISTED')}>Shortlist</Button>
                        <Button size="sm" variant="danger" onClick={() => handleBulkStatus('REJECTED')}>Reject</Button>
                        <Button size="sm" variant="secondary" onClick={() => setSelectedIds(new Set())}>Clear</Button>
                    </div>
                </div>
            )}

            {/* Applications Table */}
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="w-12 px-6 py-3 text-left">
                                <button onClick={toggleSelectAll} className="text-gray-500 hover:text-gray-700">
                                    {selectedIds.size === applications.length && applications.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                                </button>
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interview Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CV</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.length === 0 ? (
                            <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No applications yet.</td></tr>
                        ) : (
                            applications.map((app) => (
                                <tr key={app.id} className={selectedIds.has(app.id) ? "bg-blue-50" : "hover:bg-gray-50"}>
                                    <td className="px-6 py-4">
                                        <button onClick={() => toggleSelectOne(app.id)} className="text-gray-500">
                                            {selectedIds.has(app.id) ? <CheckSquare size={20} className="text-blue-600" /> : <Square size={20} />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{app.first_name} {app.last_name}</div>
                                        <div className="text-xs text-gray-500">Applied: {new Date(app.submitted_at).toLocaleDateString()}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{app.email}</div>
                                        <div className="text-xs text-gray-500">{app.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            app.status === 'SELECTED' ? 'bg-green-100 text-green-800' :
                                            app.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                                            app.status === 'INTERVIEWING' ? 'bg-purple-100 text-purple-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {app.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    
                                    {/* Interview Details */}
                                    <td className="px-6 py-4">
                                        {app.status === 'INTERVIEWING' && app.interview_date ? (
                                            <div className="text-xs">
                                                <div className="font-bold text-gray-700">{new Date(app.interview_date).toLocaleString()}</div>
                                                <div className="flex items-center gap-1 mt-1 text-gray-600">
                                                    {app.interview_type === 'ONLINE' ? <Video size={12}/> : <MapPin size={12}/>}
                                                    {app.interview_type === 'ONLINE' ? 'Online' : 'In Person'}
                                                </div>
                                                {app.interview_link && (
                                                    <div className="flex items-center gap-1 mt-1 bg-gray-100 p-1 rounded border border-gray-300 max-w-[150px]">
                                                        <span className="truncate flex-1 font-mono text-[10px]">{app.interview_link}</span>
                                                        <button onClick={() => {
                                                            navigator.clipboard.writeText(app.interview_link);
                                                            alert("Link copied!");
                                                        }} className="text-blue-600">
                                                            <Copy size={12}/>
                                                        </button>
                                                    </div>
                                                )}
                                                {app.interview_type === 'IN_PERSON' && app.interview_location && (
                                                     <div className="mt-1 text-gray-500 italic max-w-[150px] truncate">{app.interview_location}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">-</span>
                                        )}
                                    </td>

                                    {/* CV */}
                                    <td className="px-6 py-4">
                                        <a href={app.cv_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-900 flex items-center">
                                            <FileText size={16} className="mr-1" /> View
                                        </a>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-sm font-medium flex gap-2">
                                        <button 
                                            onClick={() => openInterviewModal(app.id)} 
                                            className="text-purple-600 hover:text-purple-900 p-1" 
                                            title="Schedule Interview"
                                        >
                                            <Calendar size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleHire(app.id)} 
                                            className="text-green-600 hover:text-green-900 p-1" 
                                            title="Hire"
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleReject(app.id)} 
                                            className="text-red-600 hover:text-red-900 p-1" 
                                            title="Reject"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ✅ EDIT JOB MODAL */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Job Details">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Job Description</label>
                        <textarea 
                            className="w-full border rounded-md p-2 h-40 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                        />
                    </div>
                    
                    <Input 
                        type="datetime-local" 
                        id="deadline" 
                        label="Application Deadline" 
                        value={editDeadline} 
                        onChange={e => setEditDeadline(e.target.value)} 
                    />
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdateJob}>Save Changes</Button>
                    </div>
                </div>
            </Modal>

            {/* ✅ INTERVIEW MODAL */}
            <Modal isOpen={isInterviewModalOpen} onClose={() => setIsInterviewModalOpen(false)} title="Schedule Interview">
                <div className="space-y-4">
                    <Input 
                        type="datetime-local" 
                        id="date" 
                        label="Date & Time" 
                        value={interviewDate} 
                        onChange={e => setInterviewDate(e.target.value)} 
                        required 
                    />

                    <div>
                        <label className="block text-sm font-medium mb-1">Interview Type</label>
                        <select 
                            className="w-full border rounded-md p-2 bg-white"
                            value={interviewType}
                            onChange={e => setInterviewType(e.target.value)}
                        >
                            <option value="ONLINE">Online (Google Meet)</option>
                            <option value="IN_PERSON">In Person</option>
                        </select>
                    </div>

                    {interviewType === 'IN_PERSON' ? (
                        <Input 
                            id="location" 
                            label="Physical Location" 
                            placeholder="e.g. Office 304, Spazaafy HQ"
                            value={interviewLocation} 
                            onChange={e => setInterviewLocation(e.target.value)} 
                        />
                    ) : (
                        <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm border border-blue-200">
                            ℹ️ A Google Meet link will be automatically generated and emailed to the candidate.
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes / Instructions</label>
                        <textarea 
                            className="w-full border rounded-md p-2" 
                            rows={3} 
                            value={interviewNotes} 
                            onChange={e => setInterviewNotes(e.target.value)}
                            placeholder="e.g. Please bring your ID and portfolio."
                        />
                    </div>
                    <Button onClick={submitInterview} className="w-full">Send Invite</Button>
                </div>
            </Modal>
        </div>
    );
};

export default HiringDetailPage;