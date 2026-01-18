import React, { useEffect, useState } from 'react';
import { employeeApi } from '../../api/employeeApi';
import Card from '../../components/Card';
import { User, Briefcase, Upload } from 'lucide-react';

const EmployeeProfilePage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [emp, setEmp] = useState<any>(null);

    const fetchProfile = () => {
        employeeApi.getProfile(token).then(setEmp).catch(console.error);
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files?.[0]) {
            await employeeApi.uploadPhoto(emp.id, e.target.files[0], token);
            fetchProfile();
        }
    }

    if (!emp) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Card className="p-8 flex flex-col items-center mb-6 relative">
                 {/* Center Profile Pic */}
                <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 overflow-hidden border-4 border-white shadow-lg relative group">
                    {emp.photo_url ? (
                        <img src={emp.photo_url} alt="Me" className="w-full h-full object-cover" />
                    ) : (
                         <div className="flex items-center justify-center h-full text-4xl text-gray-400 font-bold">
                            {emp.first_name[0]}
                         </div>
                    )}
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
                        <Upload className="text-white" />
                        <input type="file" className="hidden" onChange={handleUpload} />
                    </label>
                </div>
                
                <h1 className="text-2xl font-bold">{emp.first_name} {emp.last_name}</h1>
                <p className="text-gray-500 font-medium">{emp.role_title}</p>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mt-2">
                    {emp.status}
                </span>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold border-b pb-2 mb-4">Personal Details</h3>
                    <p className="mb-2"><span className="font-bold text-gray-500 text-xs uppercase">Email:</span> <br/>{emp.email}</p>
                    <p><span className="font-bold text-gray-500 text-xs uppercase">Phone:</span> <br/>{emp.phone}</p>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold border-b pb-2 mb-4">Employment</h3>
                    <p className="mb-2"><span className="font-bold text-gray-500 text-xs uppercase">Department:</span> <br/>{emp.department}</p>
                    <p><span className="font-bold text-gray-500 text-xs uppercase">Joined:</span> <br/>{new Date(emp.joined_at).toLocaleDateString()}</p>
                </Card>
            </div>
        </div>
    );
};
export default EmployeeProfilePage;