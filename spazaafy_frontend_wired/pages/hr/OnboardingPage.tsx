import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { DEPARTMENT_LABELS } from '../../utils/roles';

const OnboardingPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    const [employees, setEmployees] = useState<any[]>([]);
    const [deptFilter, setDeptFilter] = useState('ALL');

    useEffect(() => {
        hrApi.getEmployees(token).then(data => {
            setEmployees(data.filter((e: any) => e.status === 'ONBOARDING'));
        });
    }, []);

    const filtered = employees.filter(e => deptFilter === 'ALL' || e.department === deptFilter);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Onboarding Pipeline</h1>
                <select 
                    className="border rounded p-2 bg-white"
                    value={deptFilter}
                    onChange={e => setDeptFilter(e.target.value)}
                >
                    <option value="ALL">All Departments</option>
                    {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-4">
                {filtered.map(emp => (
                    // ✅ Flex Layout Fix
                    <Card key={emp.id} className="p-5 flex flex-col sm:flex-row justify-between items-center border-l-4 border-blue-500 hover:shadow-md transition">
                        <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-lg border border-gray-200">
                                {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{emp.first_name} {emp.last_name}</h3>
                                <p className="text-sm text-gray-500">{emp.role_title} • {DEPARTMENT_LABELS[emp.department]}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/hr/employees/${emp.id}`)}>
                                Manage Profile
                            </Button>
                        </div>
                    </Card>
                ))}
                
                {filtered.length === 0 && (
                    <div className="p-12 text-center text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                        No active onboarding tasks.
                    </div>
                )}
            </div>
        </div>
    );
};
export default OnboardingPage;