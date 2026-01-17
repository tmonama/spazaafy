import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hrApi } from '../api/hrApi';
import { DEPARTMENT_LABELS } from '../utils/roles';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Calendar, Info } from 'lucide-react';

const TrainingSignupForm: React.FC = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session'); 

    // Session Data State
    const [session, setSession] = useState<any>(null);
    const [fetching, setFetching] = useState(true);

    const [name, setName] = useState('');
    const [department, setDepartment] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // ✅ Fetch Training Details
    useEffect(() => {
        if (!sessionId) {
            setFetching(false);
            return;
        }
        hrApi.getPublicTrainingDetails(sessionId)
            .then(data => setSession(data))
            .catch(() => setError("Training session not found."))
            .finally(() => setFetching(false));
    }, [sessionId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await hrApi.signupTraining({
                training: sessionId,
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

    if (fetching) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    if (!sessionId || !session) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
             <div className="text-center">
                <h1 className="text-xl font-bold text-gray-800">Invalid Link</h1>
                <p className="text-gray-500">No training session found.</p>
             </div>
        </div>
    );

    if (success) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <Card className="max-w-md w-full p-8 text-center border-t-4 border-green-500">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">✅</span>
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Registered!</h2>
                <p className="text-gray-600">You are signed up for <strong>{session.title}</strong>.</p>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
            <div className="w-full max-w-md space-y-6">
                
                {/* ✅ TRAINING DETAILS CARD */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-purple-200">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">{session.title}</h1>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Calendar size={16} className="mr-2 text-purple-600" />
                        {new Date(session.date_time).toLocaleString()}
                    </div>

                    <div className="bg-purple-50 p-3 rounded text-sm text-purple-900 border border-purple-100 flex items-start">
                        <Info size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <p>{session.description}</p>
                    </div>

                    {session.is_compulsory && (
                        <p className="text-xs text-red-600 font-bold mt-2 text-right">⚠️ Attendance Compulsory</p>
                    )}
                </div>

                <Card className="p-8 bg-white shadow-md">
                    <h2 className="text-lg font-bold mb-4 text-center">Register Attendance</h2>
                    
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
                            {loading ? "Registering..." : "Confirm Spot"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};
export default TrainingSignupForm;