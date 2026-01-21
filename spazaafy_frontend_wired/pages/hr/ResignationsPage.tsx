import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { FileWarning, UserMinus, Calendar, AlertTriangle } from 'lucide-react';

const ResignationsPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResignations = async () => {
            try {
                const data = await hrApi.getEmployees(token);
                // ✅ FIXED: Added 'RESIGNATION_REQUESTED' and 'NOTICE' to the filter
                setEmployees(data.filter((e: any) => 
                    ['RESIGNATION_REQUESTED', 'NOTICE', 'RESIGNED', 'RETIRED'].includes(e.status)
                ));
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setLoading(false);
            }
        };
        fetchResignations();
    }, []);

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'RESIGNATION_REQUESTED': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // New Request
            case 'NOTICE': return 'bg-orange-100 text-orange-800 border-orange-200'; // Approved, serving notice
            case 'RETIRED': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200'; // Resigned / Past
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Resignations...</div>;

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 rounded-lg">
                    <FileWarning className="text-amber-600 h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Resignations & Retirements</h1>
                    <p className="text-sm text-gray-500">Voluntary staff exits</p>
                </div>
            </div>

            <div className="grid gap-4">
                {employees.map(emp => (
                    <Card key={emp.id} className={`p-4 flex flex-col sm:flex-row justify-between items-center hover:shadow-md transition border-l-4 ${emp.status === 'RESIGNATION_REQUESTED' ? 'border-l-yellow-400 bg-yellow-50/30' : 'border-l-gray-300'}`}>
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-200 shadow-sm">
                                {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{emp.first_name} {emp.last_name}</h3>
                                <p className="text-sm text-gray-500">{emp.role_title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase border ${getStatusStyles(emp.status)}`}>
                                        {emp.status.replace('_', ' ')}
                                    </span>
                                    {emp.status === 'RESIGNATION_REQUESTED' && (
                                        <span className="flex items-center text-xs text-yellow-700 font-medium">
                                            <AlertTriangle size={12} className="mr-1"/> Action Required
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                             <span className="text-xs text-gray-400 flex items-center mb-1">
                                <Calendar size={12} className="mr-1" />
                                Updated: {new Date(emp.status_changed_at).toLocaleDateString()}
                            </span>
                            <Button size="sm" variant={emp.status === 'RESIGNATION_REQUESTED' ? 'primary' : 'outline'} onClick={() => navigate(`/hr/employees/${emp.id}`)}>
                                {emp.status === 'RESIGNATION_REQUESTED' ? 'Review Request' : 'Manage Profile'}
                            </Button>
                        </div>
                    </Card>
                ))}

                {employees.length === 0 && (
                    <div className="text-center p-12 bg-white rounded-lg border-2 border-dashed border-gray-200">
                        <UserMinus className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                        <h3 className="text-lg font-medium text-gray-900">No Resignations Found</h3>
                        <p className="text-gray-500">There are no employees currently marked as resigned, retired, or requesting exit.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResignationsPage;