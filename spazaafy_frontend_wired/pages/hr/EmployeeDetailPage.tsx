import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { ArrowLeft, Mail, Phone, Briefcase, User, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

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
        fetchData(); // Refresh to see new photo
    };

    const handleStatusChange = async (newStatus: string) => {
        const reason = newStatus === 'RESIGNED' || newStatus === 'RETIRED' 
            ? prompt("Reason / Notes (Optional):") 
            : null;
            
        await hrApi.updateEmployeeStatus(id!, newStatus, token);
        fetchData();
        alert(`Status updated to ${newStatus}`);
    };

    if (loading) return <div className="p-8 text-center">Loading Profile...</div>;
    if (!emp) return <div className="p-8 text-center text-red-500">Employee not found.</div>;

    // Status Badge Color
    const statusColor = {
        'ONBOARDING': 'bg-blue-100 text-blue-800',
        'EMPLOYED': 'bg-green-100 text-green-800',
        'SUSPENDED': 'bg-red-100 text-red-800',
        'NOTICE': 'bg-orange-100 text-orange-800',
        'RESIGNED': 'bg-gray-200 text-gray-600',
        'RETIRED': 'bg-purple-100 text-purple-800',
    }[emp.status] || 'bg-gray-100';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* LEFT: Profile Card */}
                <Card className="p-6 flex flex-col items-center text-center">
                    <div className="relative w-32 h-32 mb-4 group">
                        <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md">
                            {emp.photo_url ? (
                                <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl font-bold">
                                    {emp.first_name[0]}{emp.last_name[0]}
                                </div>
                            )}
                        </div>
                        {/* Upload Overlay */}
                        <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                            <Upload className="text-white" size={24} />
                            <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                        </label>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900">{emp.first_name} {emp.last_name}</h2>
                    <p className="text-sm text-gray-500 mb-2">{emp.role_title}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor}`}>
                        {emp.status.replace('_', ' ')}
                    </span>
                </Card>

                {/* RIGHT: Details & Actions */}
                <div className="md:col-span-2 space-y-6">
                    
                    {/* Contact Info */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Contact Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-50 p-2 rounded"><Mail className="text-blue-600" size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm font-medium">{emp.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-green-50 p-2 rounded"><Phone className="text-green-600" size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="text-sm font-medium">{emp.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="bg-purple-50 p-2 rounded"><Briefcase className="text-purple-600" size={18} /></div>
                                <div>
                                    <p className="text-xs text-gray-500">Department</p>
                                    <p className="text-sm font-medium">{emp.department}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* CV Section */}
                    {/* Note: Backend needs to pass the Application ID or link the CV file to Employee Model to view it here.
                        Assuming Employee model might not have CV file directly, we might need to fetch the original Application.
                        For now, let's assume we link back to application or add CV field to Employee. 
                     */}
                    <Card className="p-6">
                         <h3 className="text-lg font-bold mb-4 border-b pb-2">Documents</h3>
                         <div className="flex items-center justify-between bg-gray-50 p-3 rounded border">
                             <div className="flex items-center gap-2">
                                <FileText className="text-gray-500" size={20} />
                                <span className="text-sm font-medium">Original Job Application / CV</span>
                             </div>
                             {/* In a real scenario, you'd store the CV link on the Employee model during creation */}
                             <button className="text-blue-600 text-sm hover:underline">View (Pending Link)</button>
                         </div>
                    </Card>

                    {/* Actions */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 border-b pb-2">Management Actions</h3>
                        
                        {emp.status === 'ONBOARDING' && (
                            <div className="flex gap-3 mb-4">
                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleStatusChange('EMPLOYED')}>
                                    <CheckCircle size={18} className="mr-2" /> Complete Onboarding
                                </Button>
                                <Button className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleStatusChange('FAILED_ONBOARDING')}>
                                    <XCircle size={18} className="mr-2" /> Fail Onboarding
                                </Button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="outline" onClick={() => handleStatusChange('SUSPENDED')}>Suspend</Button>
                            <Button variant="outline" onClick={() => handleStatusChange('NOTICE')}>Put on Notice</Button>
                            <Button variant="outline" onClick={() => handleStatusChange('RESIGNED')}>Mark Resigned</Button>
                            <Button variant="outline" onClick={() => handleStatusChange('RETIRED')}>Mark Retired</Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmployeeDetailPage;