import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { 
    ArrowLeft, Mail, Phone, Briefcase, Upload, FileText, 
    CheckCircle, XCircle, RefreshCcw, AlertTriangle, Calendar, UserMinus
} from 'lucide-react';

const EmployeeDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    
    const [emp, setEmp] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalType, setModalType] = useState<'RESIGN' | null>(null);
    const [resignReason, setResignReason] = useState('');
    const [noticeDays, setNoticeDays] = useState(30); // Default 30 days notice

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await hrApi.getEmployeeById(id!, token);
            setEmp(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await hrApi.uploadEmployeePhoto(id!, file, token);
        fetchData();
    };

    // Handle Standard Status Changes
    const handleStatusChange = async (newStatus: string) => {
        // If Resigning, open the modal instead of immediate API call
        if (newStatus === 'RESIGNED') {
            setModalType('RESIGN');
            return;
        }
        
        // Confirmation for other actions
        if (newStatus === 'SUSPENDED') {
            if(!window.confirm("Are you sure you want to suspend this employee?")) return;
        }
        if (newStatus === 'RETIRED') {
            if(!window.confirm("Mark this employee as Retired?")) return;
        }
        if (newStatus === 'EMPLOYED') {
            if(!window.confirm("Restore this employee to active status?")) return;
        }

        try {
            await hrApi.updateEmployeeStatus(id!, newStatus, token);
            fetchData();
        } catch (e) {
            alert("Failed to update status.");
        }
    };

    // Submit Resignation Logic (Sets status to NOTICE)
    const submitResignation = async () => {
        if (!resignReason.trim()) {
            alert("Please provide a reason.");
            return;
        }

        try {
            // We set status to NOTICE (Notice Period) and pass extra data
            await hrApi.updateEmployeeStatus(id!, 'NOTICE', token, { 
                reason: resignReason, 
                notice_days: noticeDays 
            });
            setModalType(null);
            fetchData();
            alert("Resignation processed. Employee is now in Notice Period.");
        } catch (e) {
            alert("Failed to process resignation.");
        }
    };

    // Handle Termination Flow
    const handleTerminate = async () => {
        const reason = prompt("Please provide a strong legal reason for termination request:");
        if (!reason) return;
        
        try {
            await hrApi.initiateTermination(id!, reason, token);
            fetchData();
            alert("Termination Initiated. Sent to Legal for Review.");
        } catch (e) {
            alert("Failed to initiate termination.");
        }
    };

    const handleFinalizeTermination = async () => {
        if(!window.confirm("Confirm final termination? This is irreversible.")) return;
        try {
            await hrApi.finalizeTermination(id!, token);
            fetchData();
            alert("Employee Terminated.");
        } catch (e) {
            alert("Failed to finalize termination.");
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;
    if (!emp) return <div className="p-8 text-center text-red-500">Employee not found.</div>;

    // Status Badge Color Helper
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'ONBOARDING': 'bg-blue-100 text-blue-800',
            'EMPLOYED': 'bg-green-100 text-green-800',
            'SUSPENDED': 'bg-red-100 text-red-800',
            'NOTICE': 'bg-orange-100 text-orange-800',
            'NOTICE_GIVEN': 'bg-orange-100 text-orange-800', // Legal approved termination notice
            'RESIGNED': 'bg-gray-200 text-gray-600',
            'RETIRED': 'bg-purple-100 text-purple-800',
            'TERMINATED': 'bg-black text-white',
            'PENDING_TERMINATION': 'bg-yellow-100 text-yellow-800 border border-yellow-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-200 transition">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: Profile Card */}
                <Card className="p-8 flex flex-col items-center text-center h-fit border-t-4 border-t-blue-500">
                    <div className="relative w-36 h-36 mb-6 group mx-auto">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                            {emp.photo_url ? (
                                <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-4xl font-bold">{emp.first_name[0]}{emp.last_name[0]}</span>
                            )}
                        </div>
                        {/* Upload Overlay */}
                        <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Upload className="text-white" size={28} />
                            <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                        </label>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{emp.first_name} {emp.last_name}</h2>
                    <p className="text-sm text-gray-500 mb-4 font-medium">{emp.role_title}</p>
                    
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(emp.status)}`}>
                        {emp.status.replace('_', ' ')}
                    </span>
                    
                    {emp.status === 'NOTICE' && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800 text-left w-full">
                            <p className="font-bold mb-1 flex items-center"><Calendar size={12} className="mr-1"/> Resignation Notice</p>
                            <p>Last Day: {emp.notice_period_end_date || 'Calculated automatically'}</p>
                        </div>
                    )}
                </Card>

                {/* RIGHT: Details & Actions */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Contact Info */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-50 p-2 rounded-lg mt-1"><Mail className="text-blue-600" size={20} /></div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                                    <p className="text-sm font-medium text-gray-900 truncate" title={emp.email}>{emp.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-green-50 p-2 rounded-lg mt-1"><Phone className="text-green-600" size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{emp.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 md:col-span-2">
                                <div className="bg-purple-50 p-2 rounded-lg mt-1"><Briefcase className="text-purple-600" size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Department</p>
                                    <p className="text-sm font-medium text-gray-900">{emp.department}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Documents */}
                    <Card className="p-6">
                         <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Documents</h3>
                         <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <FileText className="text-gray-500" size={20} />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Original Job Application / CV</span>
                             </div>
                             {/* Link to CV if available via Application (You would need to wire this if Employee model has CV link directly) */}
                             <button className="text-blue-600 text-xs font-bold hover:underline bg-blue-50 px-3 py-1 rounded">
                                View
                             </button>
                         </div>
                    </Card>

                    {/* Management Actions */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Management Actions</h3>
                        
                        {/* Onboarding Logic */}
                        {emp.status === 'ONBOARDING' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('EMPLOYED')}>
                                    <CheckCircle size={18} className="mr-2" /> Complete Onboarding
                                </Button>
                                <Button variant="danger" onClick={() => handleStatusChange('FAILED_ONBOARDING')}>
                                    <XCircle size={18} className="mr-2" /> Fail Onboarding
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button variant="outline" onClick={() => handleStatusChange('SUSPENDED')}>
                                Suspend
                            </Button>
                            
                            {/* Resign Button triggers Modal */}
                            <Button variant="outline" onClick={() => handleStatusChange('RESIGNED')}>
                                <UserMinus size={16} className="mr-2"/> Resign
                            </Button>
                            
                            <Button variant="outline" onClick={() => handleStatusChange('RETIRED')}>
                                Retire
                            </Button>

                            {/* Restore Button */}
                            {emp.status !== 'EMPLOYED' && emp.status !== 'ONBOARDING' && (
                                <Button variant="secondary" onClick={() => handleStatusChange('EMPLOYED')}>
                                    <RefreshCcw size={16} className="mr-2"/> Restore
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Termination Zone */}
                    <Card className="p-6 border border-red-200 bg-red-50/10">
                        <h3 className="text-lg font-bold mb-4 text-red-700 flex items-center border-b border-red-100 pb-2">
                            <AlertTriangle size={20} className="mr-2"/> Termination Zone
                        </h3>
                        
                        {emp.status === 'EMPLOYED' || emp.status === 'SUSPENDED' ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Initiating termination will send a request to the Legal Department for review. The employee status will change to "Pending Termination".</p>
                                <Button variant="danger" onClick={handleTerminate} className="w-full">
                                    Initiate Termination (Send to Legal)
                                </Button>
                            </div>
                        ) : emp.status === 'PENDING_TERMINATION' ? (
                            <div className="bg-yellow-50 p-4 rounded text-yellow-800 text-center border border-yellow-200">
                                <p className="font-bold">⚠️ Under Legal Review</p>
                                <p className="text-sm mt-1">Please wait for the Legal Authority decision.</p>
                            </div>
                        ) : emp.status === 'NOTICE_GIVEN' ? (
                            <div className="space-y-4">
                                <div className="bg-green-50 p-3 text-green-800 text-center text-sm rounded border border-green-200">
                                    <strong>Legal Approved:</strong> Employee is currently serving notice.
                                </div>
                                <Button variant="danger" onClick={handleFinalizeTermination} className="w-full">
                                    Finalize Termination (Exit)
                                </Button>
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic text-center">
                                Termination actions unavailable in current status ({emp.status.replace('_', ' ')}).
                            </p>
                        )}
                    </Card>
                </div>
            </div>

            {/* RESIGNATION MODAL */}
            <Modal isOpen={modalType === 'RESIGN'} onClose={() => setModalType(null)} title="Process Resignation">
                <div className="space-y-4">
                    <div className="bg-orange-50 p-3 rounded text-sm text-orange-800 border border-orange-200">
                        <p>The employee will enter a <strong>Notice Period</strong>. The status will change to 'NOTICE'.</p>
                    </div>
                    
                    <Input 
                        type="number" 
                        id="days"
                        label="Notice Period (Days)" 
                        value={noticeDays} 
                        onChange={e => setNoticeDays(Number(e.target.value))} 
                    />
                    
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Reason for Resignation</label>
                        <textarea 
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-purple-500 outline-none" 
                            rows={3} 
                            value={resignReason} 
                            onChange={e => setResignReason(e.target.value)}
                            placeholder="e.g. Found new opportunity, relocating..."
                        />
                    </div>

                    <div className="pt-2">
                        <Button onClick={submitResignation} className="w-full">Confirm Resignation</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeeDetailPage;