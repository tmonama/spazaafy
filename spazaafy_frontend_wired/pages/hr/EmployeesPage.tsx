import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hrApi } from '../../api/hrApi';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import { UserPlus, Search, Upload, Filter, Briefcase, Users } from 'lucide-react';

// ✅ Local Constants to ensure dropdowns work immediately
const DEPARTMENTS = [
  { value: 'EXECUTIVE', label: 'Executive & Leadership' },
  { value: 'TECH', label: 'Technology & Development' },
  { value: 'FINANCE', label: 'Finance & Administration' },
  { value: 'LEGAL', label: 'Legal & Compliance' },
  { value: 'SUPPORT', label: 'Customer Support' },
  { value: 'FIELD', label: 'Field Operations' },
  { value: 'COMMUNITY', label: 'Community Engagement' },
  { value: 'MEDIA', label: 'Media & Content' },
  { value: 'HR', label: 'HR & Training' },
];

const EMPLOYEE_STATUSES = [
  'ALL',
  'ONBOARDING',
  'EMPLOYED',
  'SUSPENDED',
  'NOTICE',
  'RESIGNED',
  'RETIRED',
  'TERMINATED',
];

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
    status: 'ONBOARDING',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setNewEmp({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        role_title: '',
        status: 'ONBOARDING',
      });
      setPhotoFile(null);
      setCvFile(null);

      fetchEmployees();
      alert('Employee created successfully!');
    } catch (error) {
      alert('Failed to create employee. Email might already be in use.');
    } finally {
      setCreating(false);
    }
  };

  const filtered = employees.filter((e) => {
    const matchesDept = filterDept === 'ALL' || e.department === filterDept;
    const matchesStatus = filterStatus === 'ALL' || e.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    if (status === 'EMPLOYED') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'ONBOARDING') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (['RESIGNED', 'RETIRED', 'TERMINATED'].includes(status))
      return 'bg-gray-100 text-gray-600 border-gray-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">Manage staff profiles and status</p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 hover:bg-green-700 shadow-sm">
          <UserPlus size={18} className="mr-2" /> Add Employee
        </Button>
      </div>

      {/* Filters Bar - Responsive & Spaced */}
      <Card className="p-5 mb-8 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between bg-white shadow-sm border border-gray-100">
        {/* Search */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="pl-10 pr-4 py-2.5 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-green-500 outline-none w-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
          {/* Department Filter */}
          <div className="relative w-full sm:w-64">
            <Briefcase size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              className="pl-9 pr-4 py-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none w-full appearance-none cursor-pointer"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-48">
            <Filter size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              className="pl-9 pr-4 py-2.5 border rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none w-full appearance-none cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {EMPLOYEE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Employee Grid (WIDER CARDS) */}
      {/* Fewer columns on large screens = wider cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((emp) => (
          <div
            key={emp.id}
            onClick={() => navigate(`/hr/employees/${emp.id}`)}
            className="cursor-pointer group h-full"
          >
            {/* Optional min width so cards stay wide */}
            <Card className="p-6 hover:shadow-lg transition-all border border-gray-200 flex flex-col items-center text-center h-full min-w-[260px]">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden mb-4 border-4 border-white shadow-md group-hover:scale-105 transition-transform">
                {emp.photo_url ? (
                  <img src={emp.photo_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl font-bold bg-gray-100">
                    {emp.first_name?.[0]}
                    {emp.last_name?.[0]}
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {emp.first_name} {emp.last_name}
              </h3>
              <p className="text-sm text-gray-600 font-medium mb-1 line-clamp-1">{emp.role_title}</p>
              <p className="text-xs text-gray-400 mb-4">{emp.department}</p>

              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(emp.status)}`}>
                {emp.status.replace('_', ' ')}
              </span>
            </Card>
          </div>
        ))}
      </div>

      {loading && <div className="text-center p-12 text-gray-500">Loading Employees...</div>}

      {!loading && filtered.length === 0 && (
        <div className="text-center p-16 bg-white rounded-xl border border-dashed border-gray-300 mt-8">
          <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Employees Found</h3>
          <p className="text-gray-500">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* CREATE MODAL */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add New Employee">
        <div className="max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          <form onSubmit={handleCreate} className="space-y-5 p-1">
            {/* Profile Picture Upload */}
            <div className="flex flex-col items-center mb-4">
              <label className="cursor-pointer group relative">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 group-hover:border-green-500 transition overflow-hidden">
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={28} className="text-gray-400 group-hover:text-green-500 transition" />
                  )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
              </label>
              <p className="text-xs text-center text-gray-400 mt-2">Tap to upload photo</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                id="fname"
                label="First Name"
                required
                value={newEmp.first_name}
                onChange={(e) => setNewEmp({ ...newEmp, first_name: e.target.value })}
              />
              <Input
                id="lname"
                label="Last Name"
                required
                value={newEmp.last_name}
                onChange={(e) => setNewEmp({ ...newEmp, last_name: e.target.value })}
              />
            </div>

            <Input
              id="email"
              type="email"
              label="Email Address"
              required
              value={newEmp.email}
              onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
              placeholder="name@spazaafy.co.za"
            />

            <Input
              id="phone"
              type="tel"
              label="Phone Number"
              required
              value={newEmp.phone}
              onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
            />

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Department</label>
              <select
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                required
                value={newEmp.department}
                onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
              >
                <option value="">Select Department</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <Input
              id="role"
              label="Job Title"
              required
              value={newEmp.role_title}
              onChange={(e) => setNewEmp({ ...newEmp, role_title: e.target.value })}
              placeholder="e.g. Marketing Specialist"
            />

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Initial Status</label>
              <select
                className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                value={newEmp.status}
                onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value })}
              >
                <option value="ONBOARDING">Onboarding</option>
                <option value="EMPLOYED">Employed (Active)</option>
              </select>
            </div>

            {/* CV Upload */}
            <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg text-center hover:bg-gray-50 transition">
              <label className="block text-sm font-bold mb-2 text-gray-700">Upload CV (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
              />
              {cvFile && <p className="text-xs text-green-600 mt-2 font-medium">Selected: {cvFile.name}</p>}
            </div>

            <div className="pt-2">
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={creating}>
                {creating ? 'Creating Profile...' : 'Create Employee Profile'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeesPage;
