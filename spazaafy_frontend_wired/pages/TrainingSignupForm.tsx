import React, { useState, useEffect } from 'react';
import { hrApi } from '../api/hrApi'; // We might need a public endpoint to list active trainings
import { DEPARTMENT_LABELS } from '../utils/roles';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const TrainingSignupForm: React.FC = () => {
    // You would fetch active training sessions here to populate a dropdown
    // For now, simple form structure
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Logic to extract data and call API
        setSuccess(true);
    };

    if (success) return <div className="min-h-screen flex items-center justify-center text-2xl text-green-600">Registered!</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
            <Card className="max-w-md w-full p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Training Registration</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="name" label="Full Name" required />
                    <div>
                        <label className="block text-sm font-bold mb-1">Department</label>
                        <select className="w-full border p-2 rounded" required>
                            <option value="">Select Department</option>
                            {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                    {/* Training Session Dropdown would go here */}
                    <Button type="submit" className="w-full">Sign Up</Button>
                </form>
            </Card>
        </div>
    );
};
export default TrainingSignupForm;