import React, { useEffect, useState } from 'react';
import { techApi } from '../api/techApi';
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity } from 'lucide-react';

const PublicStatusPage: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        techApi.getPublicStatus()
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Status...</div>;
    if (!data) return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load status.</div>;

    const { components, incidents } = data;
    
    // Calculate overall status
    const isAllOperational = components.every((c: any) => c.status === 'OPERATIONAL');
    const hasMajorOutage = components.some((c: any) => c.status === 'MAJOR_OUTAGE');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header / Banner */}
            <div className={`py-12 px-4 text-center ${
                isAllOperational ? 'bg-green-600' : hasMajorOutage ? 'bg-red-600' : 'bg-yellow-500'
            } text-white`}>
                <div className="max-w-4xl mx-auto">
                    {isAllOperational ? (
                        <div className="flex flex-col items-center">
                            <CheckCircle className="w-16 h-16 mb-4 opacity-90" />
                            <h1 className="text-4xl font-bold">All Systems Operational</h1>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            <AlertTriangle className="w-16 h-16 mb-4 opacity-90" />
                            <h1 className="text-4xl font-bold">System Issues Detected</h1>
                        </div>
                    )}
                    <p className="mt-2 opacity-90">Current status of the Spazaafy Platform</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8">
                {/* Components List */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800">System Components</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {components.map((comp: any) => (
                            <div key={comp.id} className="p-5 flex justify-between items-center">
                                <div className="font-medium text-gray-700">{comp.name}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold ${
                                        comp.status === 'OPERATIONAL' ? 'text-green-600' : 
                                        comp.status === 'MAINTENANCE' ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                        {comp.status_label}
                                    </span>
                                    {comp.status === 'OPERATIONAL' ? <CheckCircle size={18} className="text-green-500"/> : 
                                     comp.status === 'MAINTENANCE' ? <Clock size={18} className="text-blue-500"/> :
                                     <XCircle size={18} className="text-red-500"/>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Incident History */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                        <Activity className="text-gray-400" />
                        <h2 className="text-xl font-bold text-gray-800">Incident History</h2>
                    </div>
                    <div className="p-6 space-y-6">
                        {incidents.length === 0 ? (
                            <p className="text-gray-500 italic">No recent incidents reported.</p>
                        ) : (
                            incidents.map((inc: any) => (
                                <div key={inc.id} className="border-l-4 border-gray-200 pl-4 py-1">
                                    <h3 className="font-bold text-lg text-gray-900">{inc.title}</h3>
                                    <div className="flex gap-2 text-xs font-bold uppercase mt-1 mb-2">
                                        <span className={`px-2 py-0.5 rounded ${
                                            inc.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {inc.status_label}
                                        </span>
                                        <span className="text-gray-400 flex items-center">
                                            {new Date(inc.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{inc.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                
                <div className="text-center py-8 text-gray-400 text-sm">
                    &copy; {new Date().getFullYear()} Spazaafy Platform Status
                </div>
            </div>
        </div>
    );
};

export default PublicStatusPage;