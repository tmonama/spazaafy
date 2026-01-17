import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { Calendar } from 'lucide-react';

const TrainingPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    const [sessions, setSessions] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    
    // Modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newSession, setNewSession] = useState({ title: '', date_time: '', description: '', is_compulsory: false });

    const fetchSessions = async () => {
        try {
            const data = await hrApi.getTrainings(token);
            setSessions(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchSessions(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        await hrApi.createTraining(newSession, token);
        setCreateModalOpen(false);
        fetchSessions();
    };

    const filteredSessions = sessions.filter(s => 
        filterStatus === 'ALL' || s.status === filterStatus
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Training & Development</h1>
                
                <div className="flex gap-3">
                    <select 
                        className="border rounded p-2 bg-white text-sm"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    <Button onClick={() => setCreateModalOpen(true)}>Create Session</Button>
                </div>
            </div>

            <div className="grid gap-6">
                {filteredSessions.map(s => (
                    <Card key={s.id} className={`p-6 hover:shadow-md transition-shadow border-l-4 ${
                        s.status === 'COMPLETED' ? 'border-green-500' : 'border-purple-500'
                    }`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                                    <Calendar size={14} className="mr-1" />
                                    {new Date(s.date_time).toLocaleString()}
                                </div>
                                
                                <p className="text-gray-700 mb-3 line-clamp-2">{s.description}</p>
                                
                                <div className="flex gap-2">
                                    {s.is_compulsory && (
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                                            Compulsory
                                        </span>
                                    )}
                                    <span className={`text-xs px-2 py-1 rounded font-bold ${
                                        s.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-50 text-blue-800'
                                    }`}>
                                        {s.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="text-center bg-purple-50 px-4 py-2 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{s.signup_count}</p>
                                    <p className="text-xs text-gray-500">Signups</p>
                                </div>
                                
                                <Button size="sm" variant="outline" onClick={() => navigate(`/hr/training/${s.id}`)}>
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredSessions.length === 0 && (
                    <div className="text-center p-12 text-gray-500 bg-white rounded border border-dashed border-gray-300">
                        No training sessions found.
                    </div>
                )}
            </div>

            {/* CREATE MODAL */}
            <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="New Training Session">
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