import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employeeApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { MessageSquare, AlertCircle } from 'lucide-react';

const EmployeeComplaintsPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [complaints, setComplaints] = useState<any[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    
    const [type, setType] = useState('GRIEVANCE');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        employeeApi.getMyComplaints(token).then(setComplaints).catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await employeeApi.fileComplaint({ type, description }, token);
            setModalOpen(false);
            setDescription('');
            // Refresh
            const data = await employeeApi.getMyComplaints(token);
            setComplaints(data);
        } catch (e) {
            alert("Failed to submit.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Complaints & Grievances</h1>
                <Button onClick={() => setModalOpen(true)}>File New Complaint</Button>
            </div>

            <div className="space-y-4">
                {complaints.map(c => (
                    <Card key={c.id} className="p-4 border-l-4 border-orange-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 font-bold mb-2">
                                    {c.type}
                                </span>
                                <p className="text-gray-800">{c.description}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                    Submitted: {new Date(c.created_at).toLocaleDateString()}
                                </p>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    c.status === 'RESOLVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {c.status}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}

                {complaints.length === 0 && (
                    <div className="text-center p-12 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900">No History</h3>
                        <p className="text-gray-500">You have not filed any complaints or grievances.</p>
                    </div>
                )}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="File HR Complaint">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Type</label>
                        <select className="w-full border rounded p-2" value={type} onChange={e => setType(e.target.value)}>
                            <option value="GRIEVANCE">Grievance</option>
                            <option value="MISCONDUCT">Misconduct Report</option>
                            <option value="HARASSMENT">Harassment</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Details</label>
                        <textarea 
                            className="w-full border rounded p-2" 
                            rows={5} 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            placeholder="Please describe the issue..."
                            required 
                        />
                    </div>
                    <div className="flex items-start gap-2 bg-yellow-50 p-3 rounded text-xs text-yellow-800">
                        <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                        <p>This report will be sent directly to the HR Department. Serious allegations may involve Legal review.</p>
                    </div>
                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? "Submitting..." : "Submit Report"}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default EmployeeComplaintsPage;