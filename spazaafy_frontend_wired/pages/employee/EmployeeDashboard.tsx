import React, { useEffect, useState } from 'react';
import { employeeApi } from '../../api/employeeApi';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import { Megaphone, Calendar, User, ArrowRight } from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        employeeApi.getAnnouncements(token)
            .then(setAnnouncements)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const renderContentWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => 
            urlRegex.test(part) ? (
                <a key={i} href={part} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                    {part}
                </a>
            ) : (
                part
            )
        );
    };

    // ✅ Helper for clean date format
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-ZA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6">
            <Card className="mb-6 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold mb-2">Welcome to Spazaafy!</h1>
                <p className="opacity-90">Your central hub for employee services, news, and administration.</p>
            </Card>

            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <Megaphone className="mr-2" /> Company Announcements
            </h2>
            
            <div className="space-y-4">
                {loading && <div className="text-center p-4 text-gray-500">Loading updates...</div>}

                {!loading && announcements.length === 0 && (
                    <Card className="p-6 border-l-4 border-blue-500 bg-blue-50/50">
                        <h3 className="font-bold text-lg">No New Announcements</h3>
                        <p className="text-gray-600 mt-2">Check back later for company updates.</p>
                    </Card>
                )}

                {announcements.map(a => (
                    <div 
                        key={a.id} 
                        onClick={() => setSelectedAnnouncement(a)}
                        className="cursor-pointer transition-transform hover:scale-[1.01]"
                    >
                        <Card className="p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{a.title}</h3>
                                <span className="text-xs text-gray-400 flex-shrink-0 flex items-center bg-gray-50 px-2 py-1 rounded">
                                    <Calendar size={12} className="mr-1" />
                                    {new Date(a.date_posted).toLocaleDateString()}
                                </span>
                            </div>
                            
                            <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                                {a.content}
                            </p>

                            <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-wide">
                                Read More <ArrowRight size={12} className="ml-1" />
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            {/* ✅ SCROLLABLE POPUP */}
            <Modal 
                isOpen={!!selectedAnnouncement} 
                onClose={() => setSelectedAnnouncement(null)} 
                title={selectedAnnouncement?.title || 'Announcement'}
            >
                {selectedAnnouncement && (
                    <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-4">
                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 border-b pb-3 sticky top-0 bg-white z-10">
                                <div className="flex items-center">
                                    <User size={14} className="mr-1" />
                                    <span>Posted by {selectedAnnouncement.author_name || 'HR Admin'}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar size={14} className="mr-1" />
                                    <span>{formatDate(selectedAnnouncement.date_posted)}</span>
                                </div>
                            </div>

                            {/* Full Content */}
                            <div className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                                {renderContentWithLinks(selectedAnnouncement.content)}
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button variant="outline" onClick={() => setSelectedAnnouncement(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default EmployeeDashboard;