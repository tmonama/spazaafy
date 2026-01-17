import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const TrainingPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [sessions, setSessions] = useState<any[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [newSession, setNewSession] = useState({ title: '', date_time: '', description: '', is_compulsory: false });

    const fetchSessions = async () => {
        const data = await hrApi.getTrainings(token);
        setSessions(data);
    };

    useEffect(() => { fetchSessions(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await hrApi.createTraining(newSession, token);
        setModalOpen(false);
        fetchSessions();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Training & Development</h1>
                <Button onClick={() => setModalOpen(true)}>Create Session</Button>
            </div>

            <div className="grid gap-4">
                {sessions.map(s => (
                    <Card key={s.id} className="p-6">
                        <div className="flex justify-between">
                            <div>
                                <h3 className="text-xl font-bold">{s.title}</h3>
                                <p className="text-sm text-gray-500">{new Date(s.date_time).toLocaleString()}</p>
                                <p className="mt-2 text-gray-700">{s.description}</p>
                                {s.is_compulsory && <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-2 inline-block">Compulsory</span>}
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-bold text-purple-600">{s.signup_count}</p>
                                <p className="text-xs text-gray-500">Signups</p>
                                {/* Button to View/Mark Attendance would go here */}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Training Session">
                <form onSubmit={handleCreate} className="space-y-4">
                    <Input id="title" label="Title" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} required />
                    <Input id="dt" type="datetime-local" label="Date" value={newSession.date_time} onChange={e => setNewSession({...newSession, date_time: e.target.value})} required />
                    <div>
                        <label className="block text-sm font-bold mb-1">Description</label>
                        <textarea className="w-full border rounded p-2" rows={3} value={newSession.description} onChange={e => setNewSession({...newSession, description: e.target.value})} required />
                    </div>
                    <label className="flex items-center">
                        <input type="checkbox" checked={newSession.is_compulsory} onChange={e => setNewSession({...newSession, is_compulsory: e.target.checked})} className="mr-2" />
                        Compulsory?
                    </label>
                    <Button type="submit" className="w-full">Create</Button>
                </form>
            </Modal>
        </div>
    );
};
export default TrainingPage;