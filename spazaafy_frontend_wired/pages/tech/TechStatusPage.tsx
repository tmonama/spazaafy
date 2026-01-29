import React, { useEffect, useState } from 'react';
import { techApi } from '../../api/techApi';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { AlertTriangle, CheckCircle, RefreshCw, Plus } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'OPERATIONAL', label: 'Operational', color: 'bg-green-100 text-green-800' },
    { value: 'DEGRADED', label: 'Degraded', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'PARTIAL_OUTAGE', label: 'Partial Outage', color: 'bg-orange-100 text-orange-800' },
    { value: 'MAJOR_OUTAGE', label: 'Major Outage', color: 'bg-red-100 text-red-800' },
    { value: 'MAINTENANCE', label: 'Maintenance', color: 'bg-blue-100 text-blue-800' },
];

const TechStatusPage: React.FC = () => {
    const { token } = useAuth();
    const authToken = token || sessionStorage.getItem('access') || '';
    
    const [components, setComponents] = useState<any[]>([]);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newIncident, setNewIncident] = useState({ title: '', description: '', status: 'INVESTIGATING' });

    const fetchData = async () => {
        try {
            const [c, i] = await Promise.all([
                techApi.getComponents(authToken),
                techApi.getIncidents(authToken)
            ]);
            setComponents(c);
            setIncidents(i);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateComponent = async (id: string, status: string) => {
        await techApi.updateComponentStatus(id, status, authToken);
        fetchData();
    };

    const handleCreateIncident = async () => {
        if(!newIncident.title) return;
        await techApi.createSystemIncident(newIncident, authToken);
        setIsModalOpen(false);
        setNewIncident({ title: '', description: '', status: 'INVESTIGATING' });
        fetchData();
    };

    const handleResolve = async (id: string) => {
        await techApi.resolveIncident(id, authToken);
        fetchData();
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6 p-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Status Management</h1>
                <a href="/status" target="_blank" className="text-blue-500 text-sm hover:underline">View Public Page</a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Components Management */}
                <Card title="System Components">
                    <div className="space-y-4">
                        {components.map((comp) => (
                            <div key={comp.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{comp.name}</span>
                                <select 
                                    className="text-xs p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none"
                                    value={comp.status}
                                    onChange={(e) => updateComponent(comp.id, e.target.value)}
                                >
                                    {STATUS_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Incident Management */}
                <Card title="Active Incidents">
                     <div className="mb-4">
                        <Button onClick={() => setIsModalOpen(true)} className="w-full justify-center">
                            <Plus size={16} className="mr-2" /> Report New Incident
                        </Button>
                     </div>
                     <div className="space-y-4 max-h-96 overflow-y-auto">
                        {incidents.length === 0 && <p className="text-gray-500 text-center italic">No incidents.</p>}
                        {incidents.map((inc) => (
                            <div key={inc.id} className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900 dark:text-white">{inc.title}</h4>
                                    <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                                        inc.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>{inc.status}</span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{inc.description}</p>
                                {inc.status !== 'RESOLVED' && (
                                    <Button size="sm" variant="secondary" onClick={() => handleResolve(inc.id)}>
                                        <CheckCircle size={14} className="mr-1" /> Mark Resolved
                                    </Button>
                                )}
                            </div>
                        ))}
                     </div>
                </Card>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Incident">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Title</label>
                        <input 
                            className="w-full border rounded p-2" 
                            placeholder="e.g. Database Connectivity Issues"
                            value={newIncident.title}
                            onChange={e => setNewIncident({...newIncident, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Initial Status</label>
                        <select 
                            className="w-full border rounded p-2"
                            value={newIncident.status}
                            onChange={e => setNewIncident({...newIncident, status: e.target.value})}
                        >
                            <option value="INVESTIGATING">Investigating</option>
                            <option value="IDENTIFIED">Identified</option>
                            <option value="MONITORING">Monitoring</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">Description</label>
                        <textarea 
                            className="w-full border rounded p-2" 
                            rows={3}
                            placeholder="Describe the issue..."
                            value={newIncident.description}
                            onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleCreateIncident}>Post Incident</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TechStatusPage;