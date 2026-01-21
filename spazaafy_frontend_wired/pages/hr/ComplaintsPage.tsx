import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import { AlertCircle, User, Clock, FileText, ChevronRight } from 'lucide-react';

const ComplaintsPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await hrApi.getComplaints(token);
                setComplaints(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const filtered = complaints.filter(c => filterStatus === 'ALL' || c.status === filterStatus);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-red-100 text-red-800 border-red-200';
            case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CLOSED': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Complaints...</div>;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">HR Complaints & Grievances</h1>
                    <p className="text-gray-500 text-sm">Manage and resolve reported issues.</p>
                </div>
                <div className="w-48">
                    <select 
                        className="w-full border rounded-lg p-2 bg-white shadow-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="OPEN">Open</option>
                        <option value="INVESTIGATING">Under Investigation</option>
                        <option value="CLOSED">Closed / Resolved</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {filtered.map(c => (
                    // ✅ NAVIGATION LOGIC HERE
                    <div 
                        key={c.id} 
                        onClick={() => navigate(`/hr/complaints/${c.id}`)}
                        className="group cursor-pointer block"
                    >
                        <Card className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-transparent hover:border-l-purple-500">
                            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide border ${getStatusColor(c.status)}`}>
                                            {c.status}
                                        </span>
                                        <span className="text-xs font-semibold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
                                            {c.type}
                                        </span>
                                        <span className="flex items-center text-xs text-gray-400">
                                            <Clock size={12} className="mr-1" /> {new Date(c.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    
                                    <p className="text-gray-900 font-medium truncate mb-2">{c.description.substring(0, 120)}...</p>
                                    
                                    <div className="flex gap-6 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <User size={14} className="mr-1.5 text-blue-500"/> 
                                            <span className="text-xs">From: <span className="font-semibold text-gray-700">{c.complainant_name}</span></span>
                                        </div>
                                        {c.respondent_name && (
                                            <div className="flex items-center">
                                                <AlertCircle size={14} className="mr-1.5 text-red-500"/> 
                                                <span className="text-xs">Against: <span className="font-semibold text-gray-700">{c.respondent_name}</span></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Arrow Icon */}
                                <div className="text-gray-300 group-hover:text-purple-600 transition-colors p-2 rounded-full group-hover:bg-purple-50">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
                
                {filtered.length === 0 && (
                    <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <FileText className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-500">No complaints found matching this filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComplaintsPage;