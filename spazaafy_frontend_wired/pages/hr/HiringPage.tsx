import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const HiringPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [requests, setRequests] = useState<any[]>([]);
    const [applications, setApplications] = useState<any[]>([]);
    const [selectedReq, setSelectedReq] = useState<any>(null);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    
    // Modals
    const [openModal, setOpenModal] = useState<'OPEN' | 'VIEW_APPS' | 'INTERVIEW' | null>(null);
    const [daysOpen, setDaysOpen] = useState(7);
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewNotes, setInterviewNotes] = useState('');

    const fetchData = async () => {
        const [reqs, apps] = await Promise.all([
            hrApi.getHiringRequests(token),
            hrApi.getApplications(token)
        ]);
        setRequests(reqs);
        setApplications(apps);
    };

    useEffect(() => { fetchData(); }, []);

    const handleOpenApplications = async () => {
        await hrApi.openApplications(selectedReq.id, daysOpen, token);
        setOpenModal(null);
        fetchData();
        alert("Job Posted! Link generated.");
    };

    const handleScheduleInterview = async () => {
        await hrApi.scheduleInterview(selectedApp.id, interviewDate, interviewNotes, token);
        setOpenModal(null);
        fetchData();
        alert("Interview scheduled & email sent.");
    };

    const handleSelectCandidate = async (app: any) => {
        if (!window.confirm(`Are you sure you want to hire ${app.first_name}? This will create an employee profile.`)) return;
        await hrApi.selectCandidate(app.id, token);
        setOpenModal(null);
        fetchData();
        alert("Candidate Hired! Profile created in Employees tab.");
    };

    // Filter apps for selected request
    const currentApplications = selectedReq 
        ? applications.filter(a => a.hiring_request === selectedReq.id) 
        : [];

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
                                <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">{req.status}</span>
                                
                                {req.status === 'OPEN' && (
                                    <p className="text-xs text-green-600 mt-2 font-mono bg-green-50 p-1 rounded inline-block">
                                        Public Link: spazaafy.co.za/jobs/{req.id}/apply
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                {req.status === 'PENDING' && (
                                    <Button size="sm" onClick={() => { setSelectedReq(req); setOpenModal('OPEN'); }}>
                                        Open Applications
                                    </Button>
                                )}
                                
                                <Button size="sm" variant="outline" onClick={() => { setSelectedReq(req); setOpenModal('VIEW_APPS'); }}>
                                    View Applications ({req.application_count})
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* OPEN MODAL */}
            <Modal isOpen={openModal === 'OPEN'} onClose={() => setOpenModal(null)} title="Launch Hiring">
                <p className="mb-4">How many days should this position be open?</p>
                <Input type="number" id="days" label="Days" value={daysOpen} onChange={e => setDaysOpen(Number(e.target.value))} />
                <Button onClick={handleOpenApplications} className="mt-4 w-full">Launch</Button>
            </Modal>

            {/* VIEW APPS MODAL */}
            <Modal isOpen={openModal === 'VIEW_APPS'} onClose={() => setOpenModal(null)} title={`Applicants for ${selectedReq?.role_title}`}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {currentApplications.length === 0 && <p>No applications yet.</p>}
                    {currentApplications.map(app => (
                        <div key={app.id} className="border p-3 rounded bg-gray-50">
                            <div className="flex justify-between">
                                <div>
                                    <p className="font-bold">{app.first_name} {app.last_name}</p>
                                    <p className="text-xs text-gray-500">{app.email} • {app.phone}</p>
                                    <a href={app.cv_url} target="_blank" className="text-blue-600 text-xs underline">View CV</a>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Button size="sm" variant="outline" onClick={() => { setSelectedApp(app); setOpenModal('INTERVIEW'); }}>Interview</Button>
                                    <Button size="sm" onClick={() => handleSelectCandidate(app)}>Hire</Button>
                                </div>
                            </div>
                            {app.interview_date && <p className="text-xs text-orange-600 mt-1">Interview: {new Date(app.interview_date).toLocaleString()}</p>}
                        </div>
                    ))}
                </div>
            </Modal>

            {/* INTERVIEW MODAL */}
            <Modal isOpen={openModal === 'INTERVIEW'} onClose={() => setOpenModal('VIEW_APPS')} title="Schedule Interview">
                <Input type="datetime-local" id="date" label="Date & Time" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} required />
                <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">Notes / Instructions</label>
                    <textarea className="w-full border rounded p-2" rows={3} value={interviewNotes} onChange={e => setInterviewNotes(e.target.value)} />
                </div>
                <Button onClick={handleScheduleInterview} className="mt-4 w-full">Send Invite</Button>
            </Modal>
        </div>
    );
};
export default HiringPage;