import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const HiringPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    const [requests, setRequests] = useState<any[]>([]);
    const [selectedReq, setSelectedReq] = useState<any>(null);
    
    // Modals
    const [openModal, setOpenModal] = useState<'OPEN' | null>(null);
    const [daysOpen, setDaysOpen] = useState(7);
    const [jobDesc, setJobDesc] = useState(''); // ✅ State for description

    const fetchData = async () => {
        try {
            const reqs = await hrApi.getHiringRequests(token);
            setRequests(reqs);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenApplications = async () => {
        if (!selectedReq) return;
        // ✅ Pass description to API
        await hrApi.openApplications(selectedReq.id, daysOpen, jobDesc, token);
        setOpenModal(null);
        fetchData();
        alert("Job Posted! Link generated.");
    };

    const openLaunchModal = (req: any) => {
        setSelectedReq(req);
        setJobDesc(req.request_reason || ''); // Pre-fill with internal reason if available
        setOpenModal('OPEN');
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Hiring Requests</h1>
            
            <div className="grid gap-6">
                {requests.map(req => (
                    <Card key={req.id} className="p-6 border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{req.role_title}</h3>
                                <p className="text-sm text-gray-500 mb-2">{DEPARTMENT_LABELS[req.department]}</p>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                    req.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {req.status}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {req.status === 'PENDING' && (
                                    <Button size="sm" onClick={() => openLaunchModal(req)}>
                                        Open Applications
                                    </Button>
                                )}
                                
                                <Button size="sm" variant="outline" onClick={() => navigate(`/hr/hiring/${req.id}`)}>
                                    View Applications ({req.application_count})
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* OPEN MODAL */}
            <Modal isOpen={openModal === 'OPEN'} onClose={() => setOpenModal(null)} title="Launch Hiring">
                <div className="space-y-4">
                    <Input 
                        type="number" 
                        id="days" 
                        label="Duration (Days)" 
                        value={daysOpen} 
                        onChange={e => setDaysOpen(Number(e.target.value))} 
                    />
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Description (Public)</label>
                        <textarea 
                            className="w-full border rounded-md p-2 h-32"
                            placeholder="Enter the job responsibilities and requirements..."
                            value={jobDesc}
                            onChange={e => setJobDesc(e.target.value)}
                        />
                    </div>

                    <Button onClick={handleOpenApplications} className="w-full">Launch</Button>
                </div>
            </Modal>
        </div>
    );
};
export default HiringPage;