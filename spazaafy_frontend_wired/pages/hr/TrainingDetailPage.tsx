import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
    Calendar, Users, Copy, CheckCircle, ArrowLeft, 
    Link as LinkIcon, X, Save, Edit3, UserCheck 
} from 'lucide-react';

const TrainingDetailPage: React.FC = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // --- Modal States ---
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);

    // --- Form States ---
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        date_time: '',
        is_compulsory: false
    });

    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
    const [submitting, setSubmitting] = useState(false);

    // Fetch Session Data
    const fetchSession = () => {
        if (!sessionId) return;
        setLoading(true);
        hrApi.getTrainingById(sessionId, token)
            .then((data) => {
                setSession(data);
                // Pre-fill edit form
                setEditForm({
                    title: data.title,
                    description: data.description,
                    date_time: data.date_time.slice(0, 16), // Format for datetime-local
                    is_compulsory: data.is_compulsory
                });
                
                // Pre-fill attendance if already marked
                if(data.attendees && data.attendees.length > 0) {
                   setSelectedAttendees(new Set(data.attendees));
                }
            })
            .catch((err) => console.error("Failed to load session", err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchSession();
    }, [sessionId]);

    // Handle Edit Submit
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;
        setSubmitting(true);
        try {
            await hrApi.updateTrainingSession(session.id, editForm, token);
            setIsEditOpen(false);
            fetchSession(); // Refresh data
        } catch (error) {
            console.error(error);
            alert('Failed to update session');
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Open Attendance Modal
    const handleOpenAttendance = async () => {
        setIsAttendanceOpen(true);
        // Load employees if not loaded
        if (allEmployees.length === 0) {
            try {
                const employees = await hrApi.getEmployees(token);
                setAllEmployees(employees);
            } catch (error) {
                console.error("Failed to load employees", error);
            }
        }
    };

    // Toggle Employee Attendance
    const toggleAttendance = (empId: string) => {
        const newSet = new Set(selectedAttendees);
        if (newSet.has(empId)) {
            newSet.delete(empId);
        } else {
            newSet.add(empId);
        }
        setSelectedAttendees(newSet);
    };

    // Submit Attendance
    const handleSubmitAttendance = async () => {
        if (!session) return;
        setSubmitting(true);
        try {
            await hrApi.markAttendance(session.id, Array.from(selectedAttendees), token);
            setIsAttendanceOpen(false);
            fetchSession(); // Refresh to update status
            alert("Attendance recorded successfully. Profiles updated.");
        } catch (error) {
            console.error(error);
            alert("Failed to record attendance");
        } finally {
            setSubmitting(false);
        }
    };

    // Utils
    const copyToClipboard = () => {
        if (!session) return;
        const link = `${window.location.origin}/training/signup?session=${session.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to check if employee signed up (visual aid)
    const hasSignedUp = (employee: any) => {
        if (!session?.signups) return false;
        const fullName = `${employee.first_name} ${employee.last_name}`.toLowerCase();
        return session.signups.some((s: any) => s.name.toLowerCase() === fullName);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!session) return <div className="p-8 text-center text-red-500">Training session not found.</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto relative">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/hr/training')} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                    <p className="text-sm text-gray-500">Training & Development</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6 relative">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center text-gray-600">
                                <Calendar size={18} className="mr-2" />
                                <span className="font-medium">
                                    {new Date(session.date_time).toLocaleString(undefined, {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {session.status}
                            </span>
                        </div>

                        <div className="prose max-w-none text-gray-700">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="whitespace-pre-wrap">{session.description}</p>
                        </div>

                        {session.is_compulsory && (
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
                                ⚠️ This training is Compulsory
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <Users size={20} className="mr-2" />
                            Signups ({session.signups?.length || 0})
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Department</th>
                                        <th className="px-4 py-3">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {session.signups && session.signups.length > 0 ? (
                                        session.signups.map((signup: any) => (
                                            <tr key={signup.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{signup.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{signup.department}</td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(signup.submitted_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                                                No employees have signed up yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Actions */}
                <div className="space-y-6">
                    {/* Share Card */}
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                        <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide mb-2 flex items-center">
                            <LinkIcon size={16} className="mr-2" /> Share Link
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Share this public link so employees can register.
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                            <code className="flex-1 bg-white border border-purple-200 p-2 rounded text-xs text-gray-600 truncate">
                                {window.location.origin}/training/signup?session={session.id}
                            </code>
                            <Button 
                                size="sm" 
                                onClick={copyToClipboard} 
                                className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                            </Button>
                        </div>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Management Actions</h3>
                        <div className="space-y-3">
                            <Button 
                                variant="outline" 
                                className="w-full justify-start"
                                onClick={() => setIsEditOpen(true)}
                            >
                                <Edit3 size={16} className="mr-2" />
                                Edit Session Details
                            </Button>
                            
                            <Button 
                                variant="primary" 
                                className="w-full justify-start bg-green-600 hover:bg-green-700 border-green-600"
                                onClick={handleOpenAttendance}
                            >
                                <UserCheck size={16} className="mr-2" />
                                Mark Attendance
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- MODAL: Edit Session --- */}
            {isEditOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Edit Session</h3>
                            <button onClick={() => setIsEditOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
                                    value={editForm.title}
                                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    required
                                    className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
                                    value={editForm.date_time}
                                    onChange={e => setEditForm({...editForm, date_time: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    required
                                    rows={4}
                                    className="w-full p-2 border rounded focus:ring-purple-500 focus:border-purple-500"
                                    value={editForm.description}
                                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                                />
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    id="isCompulsory"
                                    className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                                    checked={editForm.is_compulsory}
                                    onChange={e => setEditForm({...editForm, is_compulsory: e.target.checked})}
                                />
                                <label htmlFor="isCompulsory" className="ml-2 block text-sm text-gray-900">
                                    Mark as Compulsory Training
                                </label>
                            </div>
                        </form>
                        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditSubmit} disabled={submitting}>
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: Mark Attendance --- */}
            {isAttendanceOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-lg">Mark Attendance</h3>
                                <p className="text-xs text-gray-500">Select employees who attended this session</p>
                            </div>
                            <button onClick={() => setIsAttendanceOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-0 overflow-y-auto flex-grow bg-gray-50">
                            {allEmployees.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">Loading employees...</div>
                            ) : (
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Attended</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {allEmployees.map((emp) => {
                                            const signedUp = hasSignedUp(emp);
                                            return (
                                                <tr 
                                                    key={emp.id} 
                                                    className={`hover:bg-gray-50 cursor-pointer ${signedUp ? 'bg-purple-50 hover:bg-purple-100' : ''}`}
                                                    onClick={() => toggleAttendance(emp.id)}
                                                >
                                                    <td className="px-6 py-3 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            {/* Simple Avatar Placeholder */}
                                                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                                                                {emp.first_name[0]}{emp.last_name[0]}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {emp.first_name} {emp.last_name}
                                                                </div>
                                                                {signedUp && (
                                                                    <span className="text-[10px] text-purple-600 font-bold px-1.5 py-0.5 rounded bg-purple-100 border border-purple-200">
                                                                        Registered
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                                        {emp.department}
                                                    </td>
                                                    <td className="px-6 py-3 whitespace-nowrap text-right">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedAttendees.has(emp.id)}
                                                            readOnly
                                                            className="h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        <div className="px-6 py-4 bg-gray-50 border-t flex-shrink-0 flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                                <b>{selectedAttendees.size}</b> employees selected
                            </span>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setIsAttendanceOpen(false)}>Cancel</Button>
                                <Button 
                                    onClick={handleSubmitAttendance} 
                                    disabled={submitting}
                                    className="bg-green-600 hover:bg-green-700 border-green-600"
                                >
                                    {submitting ? 'Submitting...' : 'Confirm Attendance'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainingDetailPage;