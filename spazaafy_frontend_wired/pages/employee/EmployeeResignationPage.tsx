import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../api/employeeApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { AlertTriangle, Calendar, FileWarning } from 'lucide-react';

const EmployeeResignationPage: React.FC = () => {
    const token = sessionStorage.getItem('access') || '';
    const [emp, setEmp] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Form State
    const [date, setDate] = useState('');
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        employeeApi.getProfile(token).then(setEmp).finally(() => setLoading(false));
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to submit a formal resignation request?")) return;
        
        setSubmitting(true);
        try {
            await employeeApi.submitResignation({ date, reason }, token);
            alert("Resignation Request Submitted to HR.");
            window.location.reload();
        } catch (e) {
            alert("Failed to submit request.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const alreadyRequested = emp?.status === 'RESIGNATION_REQUESTED' || emp?.status === 'NOTICE_GIVEN';

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">Resignation & Retirement</h1>

            {alreadyRequested ? (
                <Card className="p-8 text-center border-l-4 border-yellow-500 bg-yellow-50">
                    <FileWarning className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-yellow-800">Request Under Review</h2>
                    <p className="text-yellow-700 mt-2">
                        You have already submitted a resignation request. <br/>
                        Current Status: <strong>{emp.status.replace('_', ' ')}</strong>
                    </p>
                    {emp.resignation_date && (
                        <p className="mt-4 text-sm font-bold text-gray-600">
                            Proposed Last Day: {new Date(emp.resignation_date).toLocaleDateString()}
                        </p>
                    )}
                </Card>
            ) : (
                <Card className="p-8">
                    <div className="flex items-start gap-4 mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <AlertTriangle className="text-blue-600 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            Submitting this form initiates a formal process with Human Resources. 
                            Legal & HR will review your request and contact you regarding the next steps and exit interview.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input 
                            id="date" 
                            type="date" 
                            label="Intended Last Working Day" 
                            value={date} 
                            onChange={e => setDate(e.target.value)} 
                            required 
                        />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Leaving</label>
                            <textarea 
                                className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                                rows={5}
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Please provide details..."
                                required
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={submitting} variant="danger" className="w-full sm:w-auto">
                                {submitting ? "Submitting..." : "Submit Resignation Request"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}
        </div>
    );
};

export default EmployeeResignationPage;