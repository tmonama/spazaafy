import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { MessageSquare, AlertCircle, CheckCircle, User, Clock } from 'lucide-react';


const COMPLAINT_TYPES = [
    { label: 'Grievance', value: 'GRIEVANCE' },
    { label: 'Misconduct', value: 'MISCONDUCT' },
    { label: 'Harassment', value: 'HARASSMENT' },
    { label: 'Other', value: 'OTHER' }
];

const ComplaintsPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newComplaint, setNewComplaint] = useState({
        complainant_id: '',
        respondent_id: '', // Optional
        type: 'GRIEVANCE',
        description: ''
    });

    // We need employees list for the dropdowns in the modal
    const [employees, setEmployees] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [complaintData, employeeData] = await Promise.all([
                hrApi.getComplaints(token),
                hrApi.getEmployees(token)
            ]);
            setComplaints(complaintData);
            setEmployees(employeeData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Assuming creating a complaint is a standard POST to the ViewSet
            // You might need to add createComplaint to your hrApi.ts if not generic
            await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/hr/admin/complaints/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    complainant: newComplaint.complainant_id,
                    respondent: newComplaint.respondent_id || null,
                    type: newComplaint.type,
                    description: newComplaint.description
                })
            });
            setIsModalOpen(false);
            fetchData();
        } catch (e) {
            alert("Failed to log complaint");
        }
    };

    const handleResolve = async (id: string) => {
        if (!window.confirm("Mark this complaint as Resolved?")) return;
        try {
            // Standard PATCH to update status
            await fetch(`${import.meta.env.VITE_API_BASE || '/api'}/hr/admin/complaints/${id}/`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status: 'RESOLVED' })
            });
            fetchData();
        } catch (e) {
            alert("Failed to update status");
        }
    };

    const filtered = complaints.filter(c => filterStatus === 'ALL' || c.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800';
            case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100';
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Complaints...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">HR Complaints & Grievances</h1>
                <div className="flex gap-3">
                    <select 
                        className="border rounded p-2 bg-white"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                    <Button onClick={() => setIsModalOpen(true)}>Log Complaint</Button>
                </div>
            </div>

            <div className="space-y-4">
                {filtered.map(c => (
                    <Card key={c.id} className="p-6 border-l-4 border-orange-400">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(c.status)}`}>
                                        {c.status}
                                    </span>
                                    <span className="text-xs text-gray-500 font-mono uppercase bg-gray-100 px-2 py-1 rounded">
                                        {c.type}
                                    </span>
                                    <span className="flex items-center text-xs text-gray-400">
                                        <Clock size={12} className="mr-1" /> {new Date(c.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                <p className="text-gray-800 mb-3">{c.description}</p>
                                
                                <div className="flex gap-6 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-gray-500 text-xs uppercase">Complainant:</span>
                                        {/* Assuming serializer returns nested object or ID. Adjust if needed */}
                                        <span className="flex items-center"><User size={14} className="mr-1"/> {c.complainant_name || c.complainant}</span>
                                    </div>
                                    {c.respondent && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-500 text-xs uppercase">Respondent:</span>
                                            <span className="flex items-center text-red-600"><AlertCircle size={14} className="mr-1"/> {c.respondent_name || c.respondent}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start">
                                {c.status !== 'RESOLVED' && (
                                    <Button size="sm" variant="outline" onClick={() => handleResolve(c.id)}>
                                        Mark Resolved
                                    </Button>
                                )}
                                {c.status === 'RESOLVED' && (
                                    <div className="flex items-center text-green-600 font-bold text-sm">
                                        <CheckCircle size={18} className="mr-2" /> Case Closed
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
                
                {filtered.length === 0 && (
                    <div className="text-center p-12 text-gray-400 border-2 border-dashed rounded-lg">
                        No complaints found.
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log New Complaint">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Complainant (Employee)</label>
                        <select 
                            className="w-full border rounded p-2" 
                            value={newComplaint.complainant_id}
                            onChange={e => setNewComplaint({...newComplaint, complainant_id: e.target.value})}
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Type</label>
                        <select 
                            className="w-full border rounded p-2" 
                            value={newComplaint.type}
                            onChange={e => setNewComplaint({...newComplaint, type: e.target.value})}
                        >
                            {COMPLAINT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Respondent (Optional)</label>
                        <select 
                            className="w-full border rounded p-2" 
                            value={newComplaint.respondent_id}
                            onChange={e => setNewComplaint({...newComplaint, respondent_id: e.target.value})}
                        >
                            <option value="">None (General Grievance)</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.first_name} {e.last_name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Description</label>
                        <textarea 
                            className="w-full border rounded p-2" 
                            rows={4} 
                            value={newComplaint.description} 
                            onChange={e => setNewComplaint({...newComplaint, description: e.target.value})} 
                            required 
                            placeholder="Details of the incident..."
                        />
                    </div>

                    <Button type="submit" className="w-full">Log Complaint</Button>
                </form>
            </Modal>
        </div>
    );
};

export default ComplaintsPage;