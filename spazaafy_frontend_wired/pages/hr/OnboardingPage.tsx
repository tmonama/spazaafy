import React, { useState, useEffect } from 'react';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';

const OnboardingPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        hrApi.getEmployees(token).then(data => {
            setEmployees(data.filter((e: any) => e.status === 'ONBOARDING'));
        });
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Onboarding Pipeline</h1>
            <div className="space-y-4">
                {employees.map(emp => (
                    <Card key={emp.id} className="p-4 flex justify-between items-center border-l-4 border-blue-500">
                        <div>
                            <h3 className="font-bold">{emp.first_name} {emp.last_name}</h3>
                            <p className="text-sm text-gray-500">{emp.role_title}</p>
                        </div>
                        <span className="text-sm text-blue-600 font-bold">In Progress</span>
                    </Card>
                ))}
            </div>
        </div>
    );
};
export default OnboardingPage;