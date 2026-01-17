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
    
    // Filters
    const [deptFilter, setDeptFilter] = useState('ALL');

    useEffect(() => {
        hrApi.getEmployees(token).then(data => {
            // Filter only ONBOARDING status
            setEmployees(data.filter((e: any) => e.status === 'ONBOARDING'));
        });
    }, []);

    const filtered = employees.filter(e => deptFilter === 'ALL' || e.department === deptFilter);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Onboarding Pipeline</h1>
            
            {/* Filter Bar */}
            <div className="mb-6 flex gap-4">
                <select 
                    className="border rounded p-2"
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
                    <Card key={emp.id} className="p-4 flex justify-between items-center border-l-4 border-blue-500 hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                                {emp.first_name[0]}{emp.last_name[0]}
                            </div>
                            <div>
                                <h3 className="font-bold">{emp.first_name} {emp.last_name}</h3>
                                <p className="text-sm text-gray-500">{emp.role_title} • {DEPARTMENT_LABELS[emp.department]}</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/hr/employees/${emp.id}`)}>
                                Manage
                            </Button>
                        </div>
                    </Card>
                ))}
                
                {filtered.length === 0 && <p className="text-gray-500 text-center">No active onboarding tasks.</p>}
            </div>
        </div>
    );
};
export default OnboardingPage;