import React, { useState } from 'react';
import { DEPARTMENT_ROLES, DEPARTMENT_LABELS } from '../utils/roles';
import { hrApi } from '../api/hrApi';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

const JobRequestForm: React.FC = () => {
    const [dept, setDept] = useState('');
    const [role, setRole] = useState('');
    const [reason, setReason] = useState('');
    const [success, setSuccess] = useState(false);

    const roles = dept ? DEPARTMENT_ROLES[dept] || [] : [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await hrApi.submitJobRequest({ department: dept, role_title: role, request_reason: reason });
        setSuccess(true);
    };

    if (success) return <div className="min-h-screen flex items-center justify-center text-green-600 text-2xl font-bold">Request Submitted!</div>;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 flex justify-center">
            <Card className="max-w-xl w-full p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Internal Hiring Request</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">Department</label>
                        <select className="w-full border p-2 rounded" value={dept} onChange={e => setDept(e.target.value)} required>
                            <option value="">Select Department</option>
                            {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Role</label>
                        <select className="w-full border p-2 rounded" value={role} onChange={e => setRole(e.target.value)} required disabled={!dept}>
                            <option value="">Select Role</option>
                            {roles.map(r => <option key={r} value={r}>{r}</option>)}
                            <option value="Other">Other (Specify in Reason)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Justification</label>
                        <textarea className="w-full border p-2 rounded" rows={4} value={reason} onChange={e => setReason(e.target.value)} required />
                    </div>

                    <Button type="submit" className="w-full">Submit Request</Button>
                </form>
            </Card>
        </div>
    );
};
export default JobRequestForm;