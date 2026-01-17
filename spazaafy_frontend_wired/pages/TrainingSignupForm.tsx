import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hrApi } from '../api/hrApi';
import { DEPARTMENT_LABELS } from '../utils/roles';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const TrainingSignupForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    // ✅ Get session ID from URL
    const sessionId = searchParams.get('session'); 

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!sessionId) {
            setError("Invalid Training Link. Please ask HR for the correct link.");
            setLoading(false);
            return;
        }

        try {
            await hrApi.signupTraining({
                training: sessionId, // ✅ Send the ID to backend
                name,
                department
            });
            setSuccess(true);
        } catch (err) {
            setError("Failed to register. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="max-w-md w-full p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Registered!</h2>
                <p className="text-gray-600">You have successfully signed up for the training session.</p>
            </Card>
        </div>
    );

    if (!sessionId) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
             <div className="text-center">
                <h1 className="text-xl font-bold text-gray-800">Invalid Link</h1>
                <p className="text-gray-500">No training session specified.</p>
             </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
            <Card className="max-w-md w-full p-8">
                <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Training Registration</h1>
                <p className="text-center text-gray-500 mb-6 text-sm">Enter your details to attend.</p>
                
                {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input 
                        id="name" 
                        label="Full Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                        placeholder="e.g. John Doe"
                    />
                    
                    <div>
                        <label className="block text-sm font-bold mb-1 text-gray-700">Department</label>
                        <select 
                            className="w-full border p-2 rounded bg-white" 
                            required
                            value={department} 
                            onChange={e => setDepartment(e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {Object.entries(DEPARTMENT_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                            ))}
                        </select>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Registering..." : "Sign Up"}
                    </Button>
                </form>
            </Card>
        </div>
    );
};
export default TrainingSignupForm;