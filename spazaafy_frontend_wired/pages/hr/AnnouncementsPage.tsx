import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { Megaphone, Trash2, Calendar, Plus, Edit } from 'lucide-react';

const AnnouncementsPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal & Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null); // ✅ Track ID for editing
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

    // ✅ Open Modal for Creation
    const openCreateModal = () => {
        setEditId(null);
        setTitle('');
        setContent('');
        setIsModalOpen(true);
    };

    // ✅ Open Modal for Editing
    const openEditModal = (item: any) => {
        setEditId(item.id);
        setTitle(item.title);
        setContent(item.content);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editId) {
                // Update existing
                await hrApi.updateAnnouncement(editId, { title, content }, token);
            } else {
                // Create new
                await hrApi.createAnnouncement({ title, content }, token);
            }
            
            setIsModalOpen(false);
            setEditId(null);
            setTitle('');
            setContent('');
            fetchData();
        } catch (e) {
            alert("Failed to save announcement.");
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
                <Button onClick={openCreateModal}>
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
                    <Card key={item.id} className="p-6 border-l-4 border-blue-500 relative group hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                                <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                                <p className="text-xs text-gray-500 mb-3 flex items-center mt-1">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(item.date_posted).toLocaleString()} 
                                    <span className="mx-2">•</span> 
                                    Posted by {item.author_name || 'HR Admin'}
                                </p>
                                <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => openEditModal(item)}
                                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 rounded"
                                    title="Edit"
                                >
                                    <Edit size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* MODAL */}
            <Modal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                title={editId ? "Edit Announcement" : "Post Announcement"}
            >
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

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? "Saving..." : (editId ? "Save Changes" : "Post Announcement")}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AnnouncementsPage;