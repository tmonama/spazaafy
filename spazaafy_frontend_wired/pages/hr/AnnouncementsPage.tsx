import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { Megaphone, Trash2, Calendar, Plus } from 'lucide-react';

const AnnouncementsPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await hrApi.getAnnouncements(token);
            setAnnouncements(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await hrApi.createAnnouncement({ title, content }, token);
            setIsModalOpen(false);
            setTitle('');
            setContent('');
            fetchData();
        } catch (e) {
            alert("Failed to post announcement.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await hrApi.deleteAnnouncement(id, token);
            fetchData();
        } catch (e) {
            alert("Failed to delete.");
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Company Announcements</h1>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} className="mr-2" /> Post New
                </Button>
            </div>

            <div className="grid gap-4">
                {loading && <div className="text-center p-8">Loading...</div>}
                
                {!loading && announcements.length === 0 && (
                    <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
                        <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No announcements posted yet.</p>
                    </div>
                )}

                {announcements.map((item) => (
                    <Card key={item.id} className="p-6 border-l-4 border-blue-500 relative group">
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                <p className="text-xs text-gray-500 mb-3 flex items-center mt-1">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(item.date_posted).toLocaleString()} 
                                    <span className="mx-2">•</span> 
                                    Posted by {item.author_name || 'HR Admin'}
                                </p>
                                <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                            </div>
                            
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Delete Announcement"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* CREATE MODAL */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post Announcement">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        id="title" 
                        label="Title / Headline" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                        placeholder="e.g. New Safety Protocols"
                    />
                    
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Message Content</label>
                        <textarea 
                            className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            rows={6}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            required
                            placeholder="Write your message here..."
                        />
                    </div>

                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm">
                        ℹ️ This will be visible to all employees on their dashboard immediately.
                    </div>

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? "Posting..." : "Post Announcement"}
                    </Button>
                </form>
            </Modal>
        </div>
    );
};

export default AnnouncementsPage;