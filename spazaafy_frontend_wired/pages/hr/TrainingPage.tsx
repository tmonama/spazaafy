import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { Users, Calendar, Link as LinkIcon, Copy, CheckCircle } from 'lucide-react';

const TrainingPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [sessions, setSessions] = useState<any[]>([]);
    
    // Create Modal State
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [newSession, setNewSession] = useState({ title: '', date_time: '', description: '', is_compulsory: false });

    // Details Modal State
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

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

    const copyToClipboard = (id: string) => {
        const link = `${window.location.origin}/training/signup?session=${id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const openDetails = (session: any) => {
        setSelectedSession(session);
        setDetailsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Training & Development</h1>
                <Button onClick={() => setCreateModalOpen(true)}>Create Session</Button>
            </div>

            <div className="grid gap-6">
                {sessions.map(s => (
                    <Card key={s.id} className="p-6 hover:shadow-md transition-shadow border-l-4 border-purple-500">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                                <div className="flex items-center text-sm text-gray-500 mt-1 mb-3">
                                    <Calendar size={14} className="mr-1" />
                                    {new Date(s.date_time).toLocaleString()}
                                </div>
                                
                                <p className="text-gray-700 mb-3 line-clamp-2">{s.description}</p>
                                
                                {s.is_compulsory && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold">
                                        Compulsory
                                    </span>
                                )}
                            </div>
                            
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="text-center bg-purple-50 px-4 py-2 rounded-lg">
                                    <p className="text-2xl font-bold text-purple-600">{s.signup_count}</p>
                                    <p className="text-xs text-gray-500">Signups</p>
                                </div>
                                <Button size="sm" variant="outline" onClick={() => openDetails(s)}>
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* --- CREATE MODAL --- */}
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

            {/* --- DETAILS MODAL --- */}
            <Modal isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)} title="Training Details">
                {selectedSession && (
                    <div className="space-y-6">
                        {/* Header Info */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h2 className="text-lg font-bold text-gray-900">{selectedSession.title}</h2>
                            <p className="text-sm text-gray-600">{new Date(selectedSession.date_time).toLocaleString()}</p>
                            <p className="text-sm mt-2">{selectedSession.description}</p>
                        </div>

                        {/* Public Link Section */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Public Signup Link</label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 p-2 rounded border text-sm text-gray-600 truncate font-mono">
                                    {window.location.origin}/training/signup?session={selectedSession.id}
                                </div>
                                <Button size="sm" onClick={() => copyToClipboard(selectedSession.id)} variant={copied ? "primary" : "outline"}>
                                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Share this link with employees to register.</p>
                        </div>

                        {/* Signups List */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                                <Users size={18} className="mr-2" />
                                Registered Attendees ({selectedSession.signups?.length || 0})
                            </h3>
                            
                            <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                                {selectedSession.signups && selectedSession.signups.length > 0 ? (
                                    selectedSession.signups.map((signup: any) => (
                                        <div key={signup.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                            <div>
                                                <p className="font-medium text-sm">{signup.name}</p>
                                                <p className="text-xs text-gray-500">{signup.department}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(signup.submitted_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">
                                        No signups yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-2 text-right">
                            <Button variant="neutral" onClick={() => setDetailsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};
export default TrainingPage;