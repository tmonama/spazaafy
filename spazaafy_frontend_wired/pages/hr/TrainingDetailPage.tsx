import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Calendar, Users, Copy, CheckCircle, ArrowLeft, Link as LinkIcon } from 'lucide-react';

const TrainingDetailPage: React.FC = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        if (!sessionId) return;
        setLoading(true);
        hrApi.getTrainingById(sessionId, token)
            .then(setSession)
            .catch((err) => console.error("Failed to load session", err))
            .finally(() => setLoading(false));
    }, [sessionId]);

    const copyToClipboard = () => {
        if (!session) return;
        const link = `${window.location.origin}/training/signup?session=${session.id}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    if (!session) return <div className="p-8 text-center text-red-500">Training session not found.</div>;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate('/hr/training')} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{session.title}</h1>
                    <p className="text-sm text-gray-500">Training & Development</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center text-gray-600">
                                <Calendar size={18} className="mr-2" />
                                <span className="font-medium">
                                    {new Date(session.date_time).toLocaleString(undefined, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                session.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                                {session.status}
                            </span>
                        </div>

                        <div className="prose max-w-none text-gray-700">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="whitespace-pre-wrap">{session.description}</p>
                        </div>

                        {session.is_compulsory && (
                            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 text-sm font-medium">
                                ⚠️ This training is Compulsory
                            </div>
                        )}
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <Users size={20} className="mr-2" />
                            Signups ({session.signups?.length || 0})
                        </h3>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-500 uppercase">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Department</th>
                                        <th className="px-4 py-3">Registered At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {session.signups && session.signups.length > 0 ? (
                                        session.signups.map((signup: any) => (
                                            <tr key={signup.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">{signup.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{signup.department}</td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(signup.submitted_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-gray-400 italic">
                                                No employees have signed up yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* RIGHT COLUMN: Actions & Link */}
                <div className="space-y-6">
                    {/* Share Card */}
                    <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-100">
                        <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wide mb-2 flex items-center">
                            <LinkIcon size={16} className="mr-2" /> Share Link
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                            Share this public link with employees so they can register for the session.
                        </p>
                        
                        <div className="flex items-center gap-2 mb-2">
                            <code className="flex-1 bg-white border border-purple-200 p-2 rounded text-xs text-gray-600 truncate">
                                {window.location.origin}/training/signup?session={session.id}
                            </code>
                            <Button 
                                size="sm" 
                                onClick={copyToClipboard} 
                                className={copied ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                            </Button>
                        </div>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="p-6">
                        <h3 className="font-bold text-gray-900 mb-4">Management Actions</h3>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                Edit Session Details
                            </Button>
                            {/* You can add Mark Attendance logic here later */}
                            <Button variant="primary" className="w-full justify-start">
                                Mark Attendance
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TrainingDetailPage;