import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { hrApi } from '../api/hrApi';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const JobApplicationForm: React.FC = () => {
    // In real usage, you'd get the hiring_request ID from URL or params
    // For this example, we assume it's passed or selected
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        // Hardcode a hiring_request ID for testing, or read from hidden input if provided by URL
        // formData.append('hiring_request', 'ID_HERE'); 

        try {
            await hrApi.submitApplication(formData);
            alert("Application Received!");
        } catch (e) {
            alert("Failed to apply. Applications may be closed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center">
            <Card className="max-w-lg w-full p-8">
                <h1 className="text-2xl font-bold mb-6 text-center">Job Application</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input id="first_name" name="first_name" label="First Name" required />
                        <Input id="last_name" name="last_name" label="Last Name" required />
                    </div>
                    <Input id="email" name="email" label="Email" type="email" required />
                    <Input id="phone" name="phone" label="Phone" required />
                    
                    <div>
                        <label className="block text-sm font-bold mb-1">CV / Resume (PDF)</label>
                        <input type="file" name="cv_file" onChange={e => setFile(e.target.files?.[0] || null)} required className="w-full" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-1">Cover Letter</label>
                        <textarea name="cover_letter" rows={4} className="w-full border rounded p-2" />
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