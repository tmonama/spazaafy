import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Ensure this is imported
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { Calendar, Megaphone } from 'lucide-react';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const TrainingPage: React.FC = () => {
    const navigate = useNavigate(); // ✅ Hook
    const token = sessionStorage.getItem('access') || '';
    const [sessions, setSessions] = useState<any[]>([]);
    const [filterStatus, setFilterStatus] = useState('ALL');
    
    // Modal
    const [createModalOpen, setCreateModalOpen] = useState(false);
    
    // Form State
    const [newSession, setNewSession] = useState({ 
        title: '', 
        date_time: '', 
        description: '', 
        is_compulsory: false,
        target_departments: [] as string[],
        post_announcement: false
    });

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
        setNewSession({ title: '', date_time: '', description: '', is_compulsory: false, target_departments: [], post_announcement: false });
        fetchSessions();
    };

    const toggleDept = (deptCode: string) => {
        setNewSession(prev => {
            const current = prev.target_departments;
            if (current.includes(deptCode)) {
                return { ...prev, target_departments: current.filter(d => d !== deptCode) };
            } else {
                return { ...prev, target_departments: [...current, deptCode] };
            }
        });
    };

    const toggleAllDepts = () => {
        setNewSession(prev => ({ ...prev, target_departments: [] }));
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
                                
                                <div className="flex flex-wrap gap-2">
                                    {s.is_compulsory && (
                                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                                            Compulsory
                                        </span>
                                    )}
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        Targets: {(!s.target_departments || s.target_departments.length === 0) ? 'Everyone' : `${s.target_departments.length} Depts`}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="text-center bg-purple-50 px-4 py-2 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{s.signup_count}</p>
                                    <p className="text-xs text-gray-500">Signups</p>
                                </div>
                                
                                {/* ✅ FIXED: Explicit Navigation */}
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
                <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <Input id="title" label="Title" value={newSession.title} onChange={e => setNewSession({...newSession, title: e.target.value})} required />
                        <Input id="dt" type="datetime-local" label="Date" value={newSession.date_time} onChange={e => setNewSession({...newSession, date_time: e.target.value})} required />
                        
                        <div>
                            <label className="block text-sm font-bold mb-1">Description</label>
                            <textarea className="w-full border rounded p-2" rows={3} value={newSession.description} onChange={e => setNewSession({...newSession, description: e.target.value})} required />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Target Audience</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm border p-3 rounded max-h-40 overflow-y-auto">
                                <label className="flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={newSession.target_departments.length === 0} 
                                        onChange={toggleAllDepts}
                                        className="mr-2"
                                    />
                                    <span className="font-bold">All Employees</span>
                                </label>
                                {Object.entries(DEPARTMENT_LABELS).map(([code, label]) => (
                                    <label key={code} className="flex items-center p-1 hover:bg-gray-50 rounded cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={newSession.target_departments.includes(code)} 
                                            onChange={() => toggleDept(code)}
                                            className="mr-2"
                                        />
                                        <span className="truncate" title={label}>{label}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-1">If "All Employees" is checked, the training is visible to everyone.</p>
                        </div>

                        <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded">
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={newSession.is_compulsory} onChange={e => setNewSession({...newSession, is_compulsory: e.target.checked})} className="mr-2 h-4 w-4 text-purple-600" />
                                <span className="font-bold text-gray-700">Mark as Compulsory</span>
                            </label>
                            
                            <label className="flex items-center cursor-pointer">
                                <input type="checkbox" checked={newSession.post_announcement} onChange={e => setNewSession({...newSession, post_announcement: e.target.checked})} className="mr-2 h-4 w-4 text-blue-600" />
                                <div className="flex items-center">
                                    <Megaphone size={16} className="mr-2 text-blue-600" />
                                    <span className="text-gray-700">Push to Employee Dashboard Announcements</span>
                                </div>
                            </label>
                        </div>

                        <Button type="submit" className="w-full">Create Session</Button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};
export default TrainingPage;