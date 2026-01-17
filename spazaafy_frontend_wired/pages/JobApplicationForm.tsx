import React, { useState } from 'react';
import { useParams } from 'react-router-dom'; // ✅ Import useParams
import { hrApi } from '../api/hrApi';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const JobApplicationForm: React.FC = () => {
    // ✅ 1. Get the Job ID from the URL (defined as /jobs/:id/apply in App.tsx)
    const { id } = useParams<{ id: string }>();

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!id) {
            alert("Invalid Job Link. Missing ID.");
            return;
        }

        setLoading(true);
        
        try {
            const formData = new FormData(e.currentTarget);
            
            // ✅ 2. CRITICAL: Add the ID to the form data
            // The backend expects 'hiring_request': UUID
            formData.append('hiring_request', id); 

            await hrApi.submitApplication(formData);
            setSuccess(true);
        } catch (e: any) {
            console.error(e);
            // Handle specific backend messages (e.g. "Applications Closed")
            const msg = e.message && e.message.includes("400") 
                ? "Failed to apply. Applications may be closed for this position." 
                : "An error occurred. Please try again.";
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <Card className="max-w-md w-full p-8 text-center bg-white shadow-lg">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">✅</span>
                    </div>
                    <h2 className="text-2xl font-bold text-green-700 mb-2">Application Received!</h2>
                    <p className="text-gray-600">
                        Thank you for applying. If you are selected for an interview, we will contact you via email.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
            <Card className="max-w-lg w-full p-8 bg-white shadow-md">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Job Application</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input id="first_name" name="first_name" label="First Name" required />
                        <Input id="last_name" name="last_name" label="Last Name" required />
                    </div>
                    <Input id="email" name="email" label="Email" type="email" required />
                    <Input id="phone" name="phone" label="Phone" required />
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                        <label className="block text-sm font-bold mb-2 text-gray-700">CV / Resume (PDF)</label>
                        <input 
                            type="file" 
                            name="cv_file" 
                            accept="application/pdf"
                            onChange={e => setFile(e.target.files?.[0] || null)} 
                            required 
                            className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
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
    );
};
export default JobApplicationForm;