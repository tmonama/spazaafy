import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft, Mail, Phone, Briefcase, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

const EmployeeDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';

    const [emp, setEmp] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await hrApi.getEmployeeById(id!, token);
            setEmp(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchData(); }, [id]);

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await hrApi.uploadEmployeePhoto(id!, file, token);
        fetchData();
    };

    const handleStatusChange = async (newStatus: string) => {
        const reason = (newStatus === 'RESIGNED' || newStatus === 'RETIRED' || newStatus === 'FAILED_ONBOARDING')
            ? prompt("Reason / Notes:") 
            : null;
        
        // If they cancel the prompt for reason, abort action
        if ((newStatus === 'FAILED_ONBOARDING' || newStatus === 'RESIGNED') && !reason) return;

        // Pass reason to API (We need to update API to accept reason if not already)
        await hrApi.updateEmployeeStatus(id!, newStatus, token);
        fetchData();
    };

    if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
    if (!emp) return <div className="p-8 text-center text-red-500">Employee not found.</div>;

    const statusColor = {
        'ONBOARDING': 'bg-blue-100 text-blue-800',
        'EMPLOYED': 'bg-green-100 text-green-800',
        'SUSPENDED': 'bg-red-100 text-red-800',
        'NOTICE': 'bg-orange-100 text-orange-800',
        'RESIGNED': 'bg-gray-200 text-gray-600',
        'RETIRED': 'bg-purple-100 text-purple-800',
    }[emp.status] || 'bg-gray-100';

    return (
        <div className="p-4 max-w-6xl mx-auto"> {/* ✅ Wider Container */}
            
            {/* Header */}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-200 transition">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT: Profile Card - Centered */}
                <Card className="p-8 flex flex-col items-center text-center h-fit">
                    <div className="relative w-36 h-36 mb-6 group mx-auto"> {/* ✅ Centered Container */}
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex items-center justify-center">
                            {emp.photo_url ? (
                                <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-gray-400 text-4xl font-bold">{emp.first_name[0]}{emp.last_name[0]}</span>
                            )}
                        </div>
                        {/* Upload Overlay */}
                        <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Upload className="text-white" size={28} />
                            <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                        </label>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">{emp.first_name} {emp.last_name}</h2>
                    <p className="text-sm text-gray-500 mb-4 font-medium">{emp.role_title}</p>
                    
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                        {emp.status.replace('_', ' ')}
                    </span>
                </Card>

                {/* RIGHT: Details & Actions */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Contact Info - ✅ Improved Grid Sizing */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Contact Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-50 p-2 rounded-lg mt-1"><Mail className="text-blue-600" size={20} /></div>
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                                    <p className="text-sm font-medium text-gray-900 truncate" title={emp.email}>{emp.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="bg-green-50 p-2 rounded-lg mt-1"><Phone className="text-green-600" size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                                    <p className="text-sm font-medium text-gray-900">{emp.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 md:col-span-2">
                                <div className="bg-purple-50 p-2 rounded-lg mt-1"><Briefcase className="text-purple-600" size={20} /></div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase">Department</p>
                                    <p className="text-sm font-medium text-gray-900">{emp.department}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Documents */}
                    <Card className="p-6">
                         <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Documents</h3>
                         <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                             <div className="flex items-center gap-3">
                                <div className="bg-white p-2 rounded border border-gray-200">
                                    <FileText className="text-gray-500" size={20} />
                                </div>
                                <span className="text-sm font-medium text-gray-900">Original Job Application / CV</span>
                             </div>
                             <button className="text-blue-600 text-xs font-bold hover:underline bg-blue-50 px-3 py-1 rounded">
                                View
                             </button>
                         </div>
                    </Card>

                    {/* Actions */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2 text-gray-800">Management Actions</h3>
                        
                        {emp.status === 'ONBOARDING' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('EMPLOYED')}>
                                    <CheckCircle size={18} className="mr-2" /> Complete Onboarding
                                </Button>
                                <Button variant="danger" onClick={() => handleStatusChange('FAILED_ONBOARDING')}>
                                    <XCircle size={18} className="mr-2" /> Fail Onboarding
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Button variant="outline" onClick={() => handleStatusChange('SUSPENDED')}>Suspend</Button>
                            <Button variant="outline" onClick={() => handleStatusChange('NOTICE')}>Notice</Button>
                            <Button variant="outline" onClick={() => handleStatusChange('RESIGNED')}>Resign</Button>
                            <Button variant="outline" onClick={() => handleStatusChange('RETIRED')}>Retire</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailPage;