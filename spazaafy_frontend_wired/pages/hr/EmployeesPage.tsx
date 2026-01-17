import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const EMPLOYEE_STATUSES = ['ALL', 'ONBOARDING', 'EMPLOYED', 'SUSPENDED', 'NOTICE', 'RESIGNED', 'RETIRED'];

const EmployeesPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    const [employees, setEmployees] = useState<any[]>([]);
    
    // Filters
    const [filterDept, setFilterDept] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        hrApi.getEmployees(token).then(setEmployees);
    }, []);

    const filtered = employees.filter(e => {
        const matchesDept = filterDept === 'ALL' || e.department === filterDept;
        const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
        return matchesDept && matchesStatus;
    });

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                
                <div className="flex flex-wrap gap-2">
                    {/* Department Filter */}
                    <select className="border rounded p-2 bg-white text-sm" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                        <option value="ALL">All Departments</option>
                        {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select className="border rounded p-2 bg-white text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                        {EMPLOYEE_STATUSES.map(status => (
                            <option key={status} value={status}>{status.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(emp => (
                    <div 
                        key={emp.id} 
                        onClick={() => navigate(`/hr/employees/${emp.id}`)} 
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all hover:border-purple-300"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden mb-4 border-2 border-white shadow-sm">
                                {emp.photo_url ? (
                                    <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold bg-gray-100">
                                        {emp.first_name[0]}{emp.last_name[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{emp.first_name} {emp.last_name}</h3>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{emp.role_title}</p>
                            
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                emp.status === 'EMPLOYED' ? 'bg-green-100 text-green-800' : 
                                emp.status === 'ONBOARDING' ? 'bg-blue-100 text-blue-800' : 
                                emp.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {emp.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center p-12 text-gray-500">
                    No employees found matching filters.
                </div>
            )}
        </div>
    );
};
export default EmployeesPage;