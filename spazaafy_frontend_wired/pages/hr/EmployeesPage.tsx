import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import { DEPARTMENT_LABELS } from '../../utils/roles';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { UserPlus, Search, Upload } from 'lucide-react';

const EMPLOYEE_STATUSES = ['ALL', 'ONBOARDING', 'EMPLOYED', 'SUSPENDED', 'NOTICE', 'RESIGNED', 'RETIRED'];

const EmployeesPage: React.FC = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem('access') || '';
    
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [filterDept, setFilterDept] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    // Form State
    const [newEmp, setNewEmp] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        role_title: '',
        status: 'ONBOARDING'
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [cvFile, setCvFile] = useState<File | null>(null);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const data = await hrApi.getEmployees(token);
            setEmployees(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);

        try {
            const formData = new FormData();
            formData.append('first_name', newEmp.first_name);
            formData.append('last_name', newEmp.last_name);
            formData.append('email', newEmp.email);
            formData.append('phone', newEmp.phone);
            formData.append('department', newEmp.department);
            formData.append('role_title', newEmp.role_title);
            formData.append('status', newEmp.status);

            if (photoFile) formData.append('profile_picture', photoFile);
            if (cvFile) formData.append('cv_file', cvFile);

            await hrApi.createEmployee(formData, token);
            
            setIsCreateModalOpen(false);
            // Reset form
            setNewEmp({ first_name: '', last_name: '', email: '', phone: '', department: '', role_title: '', status: 'ONBOARDING' });
            setPhotoFile(null);
            setCvFile(null);
            
            fetchEmployees();
            alert("Employee created successfully!");
        } catch (error) {
            alert("Failed to create employee. Email might already be in use.");
        } finally {
            setCreating(false);
        }
    };

    const filtered = employees.filter(e => {
        const matchesDept = filterDept === 'ALL' || e.department === filterDept;
        const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
        const matchesSearch = searchQuery === '' || 
            `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.email.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesDept && matchesStatus && matchesSearch;
    });

    return (
        <div className="p-6">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
                    <p className="text-sm text-gray-500">Manage staff profiles and status</p>
                </div>
                
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <UserPlus size={18} className="mr-2" /> Add Employee
                    </Button>
                </div>
            </div>

            {/* Filters Bar */}
            <Card className="p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="pl-10 w-full border rounded-md p-2 text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <select className="border rounded p-2 bg-white text-sm w-full md:w-auto" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                    <option value="ALL">All Departments</option>
                    {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>

                <select className="border rounded p-2 bg-white text-sm w-full md:w-auto" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    {EMPLOYEE_STATUSES.map(status => (
                        <option key={status} value={status}>{status.replace('_', ' ')}</option>
                    ))}
                </select>
            </Card>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(emp => (
                    <div 
                        key={emp.id} 
                        onClick={() => navigate(`/hr/employees/${emp.id}`)} 
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-all hover:border-purple-300 group"
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden mb-4 border-2 border-white shadow-sm group-hover:scale-105 transition-transform">
                                {emp.photo_url ? (
                                    <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold bg-gray-100">
                                        {emp.first_name[0]}{emp.last_name[0]}
                                    </div>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{emp.first_name} {emp.last_name}</h3>
                            <p className="text-sm text-gray-500 mb-2 line-clamp-1">{emp.role_title}</p>
                            
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                                emp.status === 'EMPLOYED' ? 'bg-green-100 text-green-800' : 
                                emp.status === 'ONBOARDING' ? 'bg-blue-100 text-blue-800' : 
                                emp.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {emp.status.replace('_', ' ')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {loading && <div className="text-center p-12 text-gray-500">Loading Employees...</div>}
            {!loading && filtered.length === 0 && (
                <div className="text-center p-12 text-gray-500 bg-white border-2 border-dashed rounded-lg">
                    No employees found matching filters.
                </div>
            )}

            {/* CREATE MODAL */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Employee">
                {/* ✅ Added Scroll Wrapper here */}
                <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                    <form onSubmit={handleCreate} className="space-y-4">
                        
                        {/* Profile Picture Upload */}
                        <div className="flex justify-center mb-4">
                            <label className="cursor-pointer">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-500">
                                    {photoFile ? (
                                        <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <Upload size={24} className="text-gray-400" />
                                    )}
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={e => setPhotoFile(e.target.files?.[0] || null)} />
                            </label>
                            <p className="text-xs text-center text-gray-400 mt-2">Tap to upload photo</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input 
                                id="fname" label="First Name" required 
                                value={newEmp.first_name} 
                                onChange={e => setNewEmp({...newEmp, first_name: e.target.value})} 
                            />
                            <Input 
                                id="lname" label="Last Name" required 
                                value={newEmp.last_name} 
                                onChange={e => setNewEmp({...newEmp, last_name: e.target.value})} 
                            />
                        </div>
                        
                        <Input 
                            id="email" type="email" label="Email Address" required 
                            value={newEmp.email} 
                            onChange={e => setNewEmp({...newEmp, email: e.target.value})} 
                            placeholder="name@spazaafy.co.za"
                        />
                        
                        <Input 
                            id="phone" type="tel" label="Phone Number" required 
                            value={newEmp.phone} 
                            onChange={e => setNewEmp({...newEmp, phone: e.target.value})} 
                        />

                        <div>
                            <label className="block text-sm font-bold mb-1">Department</label>
                            <select 
                                className="w-full border rounded p-2" 
                                required
                                value={newEmp.department}
                                onChange={e => setNewEmp({...newEmp, department: e.target.value})}
                            >
                                <option value="">Select Department</option>
                                {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => (
                                    <option key={k} value={k}>{v}</option>
                                ))}
                            </select>
                        </div>

                        <Input 
                            id="role" label="Job Title" required 
                            value={newEmp.role_title} 
                            onChange={e => setNewEmp({...newEmp, role_title: e.target.value})} 
                            placeholder="e.g. Marketing Specialist"
                        />

                        <div>
                            <label className="block text-sm font-bold mb-1">Initial Status</label>
                            <select 
                                className="w-full border rounded p-2" 
                                value={newEmp.status}
                                onChange={e => setNewEmp({...newEmp, status: e.target.value})}
                            >
                                <option value="ONBOARDING">Onboarding</option>
                                <option value="EMPLOYED">Employed (Active)</option>
                            </select>
                        </div>

                        {/* CV Upload */}
                        <div className="border border-dashed border-gray-300 p-4 rounded text-center">
                            <label className="block text-sm font-bold mb-1">Upload CV (PDF)</label>
                            <input 
                                type="file" 
                                accept="application/pdf"
                                onChange={e => setCvFile(e.target.files?.[0] || null)}
                                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                            />
                            {cvFile && <p className="text-xs text-green-600 mt-1">{cvFile.name}</p>}
                        </div>

                        <Button type="submit" className="w-full" disabled={creating}>
                            {creating ? "Creating..." : "Create Employee Profile"}
                        </Button>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeesPage;