import React, { useEffect, useState } from 'react';
import { employeeApi } from '../../api/employeeApi';
import Card from '../../components/Card';
import { Megaphone } from 'lucide-react';

const EmployeeDashboard: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [announcements, setAnnouncements] = useState<any[]>([]);

    useEffect(() => {
        employeeApi.getAnnouncements(token).then(setAnnouncements).catch(() => {});
    }, []);

    return (
        <div className="p-6">
            <Card className="mb-6 p-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl">
                <h1 className="text-3xl font-bold mb-2">Welcome to Spazaafy!</h1>
                <p>Your central hub for employee services, news, and administration.</p>
            </Card>

            <h2 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <Megaphone className="mr-2" /> Company Announcements
            </h2>
            
            <div className="space-y-4">
                {/* Default Placeholder */}
                {announcements.length === 0 && (
                    <Card className="p-6 border-l-4 border-blue-500">
                        <h3 className="font-bold text-lg">Welcome to the Team!</h3>
                        <p className="text-gray-600 mt-2">
                            We are excited to have you on board. Please complete your profile and check the training tab for onboarding materials.
                        </p>
                        <span className="text-xs text-gray-400 mt-4 block">Posted by HR</span>
                    </Card>
                )}

                {announcements.map(a => (
                    <Card key={a.id} className="p-6 border-l-4 border-blue-500">
                        <h3 className="font-bold text-lg">{a.title}</h3>
                        <p className="text-gray-600 mt-2">{a.content}</p>
                        <span className="text-xs text-gray-400 mt-4 block">
                            {new Date(a.date_posted).toLocaleDateString()}
                        </span>
                    </Card>
                ))}
            </div>
        </div>
    );
};
export default EmployeeDashboard;