import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { 
    FileWarning, UserMinus, Calendar, AlertTriangle, 
    Search, Filter, Eye, X, Briefcase, ChevronRight 
} from 'lucide-react';

const ResignationsPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    
    // Data States
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter States
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [typeFilter, setTypeFilter] = useState('ALL'); 
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [viewReasonModal, setViewReasonModal] = useState<any>(null); 

    useEffect(() => {
        const fetchResignations = async () => {
            try {
                const data = await hrApi.getEmployees(token);
                // Filter all relevant statuses
                const relevant = data.filter((e: any) => 
                    ['RESIGNATION_REQUESTED', 'NOTICE', 'RESIGNED', 'RETIRED'].includes(e.status)
                );
                setEmployees(relevant);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResignations();
    }, []);

    // --- Helpers ---
    const getExitType = (reason: string | null) => {
        if (!reason) return 'RESIGNATION';
        if (reason.includes('[RETIREMENT]')) return 'RETIREMENT';
        if (reason.includes('[RESIGNATION]')) return 'RESIGNATION';
        return 'RESIGNATION'; 
    };

    const cleanReason = (reason: string | null) => {
        if (!reason) return 'No reason provided.';
        return reason.replace('[RETIREMENT]', '').replace('[RESIGNATION]', '').trim();
    };

    // --- Filter Logic ---
    const filteredEmployees = employees.filter(emp => {
        // 1. Status
        if (statusFilter !== 'ALL' && emp.status !== statusFilter) return false;
        
        // 2. Type (Parse from reason string)
        const exitType = getExitType(emp.resignation_reason);
        if (typeFilter !== 'ALL' && exitType !== typeFilter) return false;

        // 3. Search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            const textMatch = 
                emp.first_name.toLowerCase().includes(term) ||
                emp.last_name.toLowerCase().includes(term);
            if (!textMatch) return false;
        }
        return true;
    });

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'RESIGNATION_REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'NOTICE': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'RETIRED': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Resignations...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-amber-100 rounded-xl text-amber-600 shadow-sm">
                    <FileWarning size={28} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resignations & Retirements</h1>
                    <p className="text-sm text-gray-500">Manage voluntary staff exits and notices.</p>
                </div>
            </div>

            {/* Filters Bar */}
            <Card className="p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative">
                        <Filter size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                        <select 
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none w-full"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="RESIGNATION_REQUESTED">Requests (Action Required)</option>
                            <option value="NOTICE">On Notice</option>
                            <option value="RETIRED">Retired</option>
                            <option value="RESIGNED">Resigned</option>
                        </select>
                    </div>

                    <div className="relative">
                        <Briefcase size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
                        <select 
                            className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none w-full"
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >
                            <option value="ALL">All Types</option>
                            <option value="RESIGNATION">Resignation</option>
                            <option value="RETIREMENT">Retirement</option>
                        </select>
                    </div>
                </div>

                <div className="relative w-full md:w-64">
                    <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search name..." 
                        className="pl-9 pr-4 py-2 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-amber-500 outline-none w-full"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            {/* Employee Cards List */}
            <div className="space-y-4">
                {filteredEmployees.map(emp => {
                    const type = getExitType(emp.resignation_reason);
                    const isUrgent = emp.status === 'RESIGNATION_REQUESTED';

                    return (
                        <Card key={emp.id} className={`p-6 transition hover:shadow-md border-l-4 ${isUrgent ? 'border-l-amber-500 bg-amber-50/20' : 'border-l-gray-300'}`}>
                            
                            {/* Flex Container for Desktop Layout */}
                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                
                                {/* Avatar */}
                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-gray-400 font-bold text-2xl border border-gray-200 shadow-sm flex-shrink-0">
                                    {emp.first_name[0]}{emp.last_name[0]}
                                </div>

                                {/* Info Stack - Vertical Layout */}
                                <div className="flex-1 space-y-1.5">
                                    <h3 className="font-bold text-xl text-gray-900 leading-tight">
                                        {emp.first_name} {emp.last_name}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-600 font-medium">{emp.role_title}</p>
                                    <p className="text-sm text-gray-500">{emp.department}</p>
                                    
                                    {/* Badges Row */}
                                    <div className="flex flex-wrap items-center gap-2 pt-1">
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase rounded border border-gray-200 tracking-wider">
                                            {type}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border tracking-wider ${getStatusStyles(emp.status)}`}>
                                            {emp.status.replace('_', ' ')}
                                        </span>
                                    </div>

                                    {/* Date Info */}
                                    {emp.resignation_date && (
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 pt-1">
                                            <Calendar size={14} className="text-amber-600"/>
                                            <span>Proposed Last Day: <strong>{emp.resignation_date}</strong></span>
                                        </div>
                                    )}
                                </div>

                                {/* Actions - Pushed to Right */}
                                <div className="flex flex-row md:flex-col lg:flex-row gap-3 w-full md:w-auto md:ml-auto mt-2 md:mt-0">
                                    <Button 
                                        size="sm" 
                                        variant="secondary" 
                                        onClick={() => setViewReasonModal(emp)}
                                        className="flex-1 md:w-full lg:w-auto justify-center"
                                    >
                                        <Eye size={16} className="mr-2"/> View Reason
                                    </Button>

                                    <Button 
                                        size="sm" 
                                        variant={isUrgent ? 'primary' : 'outline'} 
                                        onClick={() => navigate(`/hr/employees/${emp.id}`)}
                                        className={`flex-1 md:w-full lg:w-auto justify-center ${isUrgent ? 'bg-amber-600 hover:bg-amber-700 border-amber-600' : ''}`}
                                    >
                                        {isUrgent ? 'Review Request' : 'Manage Profile'} <ChevronRight size={16} className="ml-1"/>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {filteredEmployees.length === 0 && (
                    <div className="text-center p-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <UserMinus className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">No Records Found</h3>
                        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>

            {/* --- REASON POPUP MODAL --- */}
            {viewReasonModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Exit Reason</h3>
                                <p className="text-xs text-gray-500">
                                    {viewReasonModal.first_name} {viewReasonModal.last_name}
                                </p>
                            </div>
                            <button onClick={() => setViewReasonModal(null)} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Submitted Reason</span>
                            <div className="mt-2 p-4 bg-amber-50/50 border border-amber-100 rounded-lg text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                                {cleanReason(viewReasonModal.resignation_reason)}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Details</span>
                                <div className="mt-2 text-sm space-y-1">
                                    <p><span className="text-gray-500">Type:</span> {getExitType(viewReasonModal.resignation_reason)}</p>
                                    <p><span className="text-gray-500">Submission Date:</span> {new Date(viewReasonModal.status_changed_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-gray-50 flex justify-end">
                            <Button onClick={() => setViewReasonModal(null)}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResignationsPage;