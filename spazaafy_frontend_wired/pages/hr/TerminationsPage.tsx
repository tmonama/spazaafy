import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';

const TerminationsPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    const [employees, setEmployees] = useState<any[]>([]);

    useEffect(() => {
        hrApi.getEmployees(token).then(data => {
            setEmployees(data.filter((e: any) => 
                ['PENDING_TERMINATION', 'NOTICE_GIVEN', 'TERMINATED'].includes(e.status)
            ));
        });
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-red-800">Terminations Tracker</h1>
            <div className="space-y-4">
                {employees.map(emp => (
                    <Card key={emp.id} className="p-4 flex justify-between items-center border-l-4 border-red-500">
                        <div>
                            <h3 className="font-bold">{emp.first_name} {emp.last_name}</h3>
                            <p className="text-sm text-gray-500">{emp.role_title}</p>
                            <span className="text-xs font-bold text-red-600 uppercase">{emp.status.replace('_', ' ')}</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/hr/employees/${emp.id}`)}>
                            View Actions
                        </Button>
                    </Card>
                ))}
                {employees.length === 0 && <p>No active terminations.</p>}
            </div>
        </div>
    );
};
export default TerminationsPage;