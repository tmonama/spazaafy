import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { hrApi } from '../api/hrApi';
import { DEPARTMENT_LABELS } from '../utils/roles';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Clock, MapPin, Briefcase } from 'lucide-react';

const JobApplicationForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    
    // State for Job Details
    const [job, setJob] = useState<any>(null);
    const [fetchingJob, setFetchingJob] = useState(true);
    const [fetchError, setFetchError] = useState('');

    // State for Form
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // ✅ Fetch Job Details on Load
    useEffect(() => {
        if (!id) return;
        hrApi.getPublicJobDetails(id)
            .then(data => {
                setJob(data);
                setFetchingJob(false);
            })
            .catch(err => {
                console.error(err);
                setFetchError("Job not found or no longer accepting applications.");
                setFetchingJob(false);
            });
    }, [id]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id) return;

        setLoading(true);
        try {
            const formData = new FormData(e.currentTarget);
            formData.append('hiring_request', id); 
            await hrApi.submitApplication(formData);
            setSuccess(true);
        } catch (e: any) {
            alert("Failed to apply. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // --- Helper to calculate Days Left ---
    const getDaysLeft = (deadlineStr: string) => {
        const deadline = new Date(deadlineStr);
        const now = new Date();
        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return { text: "Closed", color: "bg-red-100 text-red-800" };
        if (diffDays === 0) return { text: "Closes Today", color: "bg-orange-100 text-orange-800" };
        return { text: `${diffDays} days left`, color: "bg-green-100 text-green-800" };
    };

    if (fetchingJob) return <div className="min-h-screen flex items-center justify-center">Loading Job Details...</div>;
    
    if (fetchError || !job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-800">Job Unavailable</h1>
                    <p className="text-gray-500">{fetchError}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="max-w-md w-full p-8 text-center bg-white shadow-lg border-t-4 border-green-500">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Sent!</h2>
                    <p className="text-gray-600">
                        We have received your application for <strong>{job.role_title}</strong>.
                    </p>
                </Card>
            </div>
        );
    }

    const deadlineInfo = job.application_deadline ? getDaysLeft(job.application_deadline) : null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
            <div className="w-full max-w-lg space-y-6">
                
                {/* ✅ JOB DETAILS CARD */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">
                                {DEPARTMENT_LABELS[job.department] || job.department}
                            </span>
                            <h1 className="text-2xl font-bold mt-2 text-gray-900">{job.role_title}</h1>
                        </div>
                        {deadlineInfo && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${deadlineInfo.color} flex items-center`}>
                                <Clock size={12} className="mr-1" /> {deadlineInfo.text}
                            </span>
                        )}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-bold text-gray-700 mb-1">About the Role</h3>
                        <p className="text-gray-600 text-sm whitespace-pre-wrap">{job.job_description || "No description provided."}</p>
                    </div>
                </div>

                {/* APPLICATION FORM */}
                <Card className="p-8 bg-white shadow-md">
                    <h2 className="text-lg font-bold mb-4 border-b pb-2">Apply Now</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input id="first_name" name="first_name" label="First Name" required />
                            <Input id="last_name" name="last_name" label="Last Name" required />
                        </div>
                        <Input id="email" name="email" label="Email" type="email" required />
                        <Input id="phone" name="phone" label="Phone" required />
                        
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 transition">
                            <label className="block text-sm font-bold mb-2 text-gray-700">Upload CV (PDF)</label>
                            <input 
                                type="file" 
                                name="cv_file" 
                                accept="application/pdf"
                                onChange={e => setFile(e.target.files?.[0] || null)} 
                                required 
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-1 text-gray-700">Cover Letter</label>
                            <textarea 
                                name="cover_letter" 
                                rows={4} 
                                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                                placeholder="Tell us why you are a good fit..."
                            />
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Submitting..." : "Submit Application"}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};
export default JobApplicationForm;