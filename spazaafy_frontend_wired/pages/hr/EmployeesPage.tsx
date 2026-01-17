import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const EmployeesPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [employees, setEmployees] = useState<any[]>([]);
    const [filterDept, setFilterDept] = useState('ALL');
    const [selectedEmp, setSelectedEmp] = useState<any>(null);

    useEffect(() => {
        hrApi.getEmployees(token).then(setEmployees);
    }, []);

    const filtered = filterDept === 'ALL' ? employees : employees.filter(e => e.department === filterDept);

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">Employees</h1>
                <select className="border rounded p-2" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="ALL">All Departments</option>
                    {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(emp => (
                    <div key={emp.id} onClick={() => setSelectedEmp(emp)} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden mb-4">
                                {emp.photo_url ? (
                                    <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                        {emp.first_name[0]}{emp.last_name[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold">{emp.first_name} {emp.last_name}</h3>
                            <p className="text-sm text-gray-500">{emp.role_title}</p>
                            <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                                emp.status === 'EMPLOYED' ? 'bg-green-100 text-green-800' : 
                                emp.status === 'ONBOARDING' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {emp.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* DETAIL MODAL would go here (Showing full details + edit status option) */}
        </div>
    );
};
export default EmployeesPage;