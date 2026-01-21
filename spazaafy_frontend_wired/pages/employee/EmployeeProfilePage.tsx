import React, { useEffect, useState } from 'react';
import { employeeApi } from '../../api/employeeApi';
import Card from '../../components/Card';
import { User, Briefcase, Upload, Award } from 'lucide-react';

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
            {/* Main Profile Header */}
            <Card className="p-8 flex flex-col items-center mb-6 relative border-t-4 border-purple-500">
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
                
                <h1 className="text-2xl font-bold text-gray-900">{emp.first_name} {emp.last_name}</h1>
                <p className="text-gray-500 font-medium">{emp.role_title}</p>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold mt-2">
                    {emp.status.replace('_', ' ')}
                </span>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="font-bold border-b pb-2 mb-4 flex items-center text-gray-800">
                        <User size={18} className="mr-2 text-blue-600"/> Personal Details
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <span className="font-bold text-gray-400 text-xs uppercase tracking-wide">Email</span>
                            <p className="text-gray-900">{emp.email}</p>
                        </div>
                        <div>
                            <span className="font-bold text-gray-400 text-xs uppercase tracking-wide">Phone</span>
                            <p className="text-gray-900">{emp.phone}</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <h3 className="font-bold border-b pb-2 mb-4 flex items-center text-gray-800">
                        <Briefcase size={18} className="mr-2 text-purple-600"/> Employment
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <span className="font-bold text-gray-400 text-xs uppercase tracking-wide">Department</span>
                            <p className="text-gray-900">{emp.department}</p>
                        </div>
                        <div>
                            <span className="font-bold text-gray-400 text-xs uppercase tracking-wide">Date Joined</span>
                            <p className="text-gray-900">{new Date(emp.joined_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* ✅ Training Section (NEW) */}
            <Card className="mt-6 p-6">
                <h3 className="font-bold border-b pb-2 mb-4 flex items-center text-gray-800">
                    <Award className="mr-2 text-yellow-600" size={20} />
                    Training & Qualifications
                </h3>
                
                {emp.trainings_attended && emp.trainings_attended.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                                <tr>
                                    <th className="px-4 py-3">Training Title</th>
                                    <th className="px-4 py-3">Date Completed</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {emp.trainings_attended.map((t: any) => (
                                    <tr key={t.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-medium text-gray-900">{t.title}</td>
                                        <td className="px-4 py-3 text-gray-600">{new Date(t.date_time).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">
                                            <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-full border border-green-200">
                                                VERIFIED
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded border border-dashed border-gray-300">
                        <p className="text-gray-500 text-sm">No training records found.</p>
                    </div>
                )}
            </Card>
        </div>
    );
};
export default EmployeeProfilePage;