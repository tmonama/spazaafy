import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { legalApi } from '../api/legalApi';

const LegalIntakePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ New Helper for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
        // 10MB in bytes = 10 * 1024 * 1024
        const maxSize = 10 * 1024 * 1024;

        if (selectedFile.size > maxSize) {
            alert("File is too large. Maximum allowed size is 10MB.");
            e.target.value = ""; // Clear the input
            setFile(null);
            return;
        }
        setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Please attach the document");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
        await legalApi.submitRequest(formData);
        setSuccess(true);
    } catch (err: any) {
        console.error(err);
        // Display backend error if available (e.g. validator failure)
        const msg = err.response?.data?.document_file?.[0] || "Failed to submit request.";
        alert(msg);
    } finally {
        setLoading(false);
    }
  };

  if (success) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="text-center p-8 bg-white shadow-lg">
              <h2 className="text-2xl font-bold text-green-600 mb-2">Submission Received</h2>
              <p className="text-gray-600">The Department of Legal & Compliance will review your document.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Submit Another</Button>
          </Card>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Spazaafy Legal Intake</h1>
            <p className="text-gray-600">Department of Legal & Compliance</p>
        </div>

        <Card className="p-6 bg-white shadow-md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Input name="submitter_name" id="submitter_name" label="Your Name" required />
                    <Input name="submitter_email" id="submitter_email" label="Your Email" type="email" required />
                </div>
                
                <Input name="department" id="department" label="Department / Organization" placeholder="e.g. Field Ops" required />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select name="category" className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900">
                            <option value="CONTRACT">Contract / Agreement</option>
                            <option value="POLICY">Policy Document</option>
                            <option value="IP">Intellectual Property</option>
                            <option value="COMPLIANCE">Regulatory Compliance</option>
                            <option value="DISPUTE">Dispute / Litigation</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <select name="urgency" className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900">
                            <option value="ROUTINE">Routine (7-14 Days)</option>
                            <option value="PRIORITY">Priority (3-5 Days)</option>
                            <option value="URGENT">Urgent (24-48 Hours)</option>
                            <option value="CRITICAL">Critical (Immediate)</option>
                        </select>
                    </div>
                </div>

                <Input name="title" id="title" label="Document Title" required />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description & Context</label>
                    <textarea 
                        name="description" 
                        rows={4} 
                        className="w-full border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-400" 
                        required 
                        placeholder="What is this for? What are the risks?" 
                    />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                    <p className="text-sm text-gray-500 mb-2">Upload Document (PDF, Word, Images) - Max 10MB</p>
                    <input 
                        type="file" 
                        name="document_file" 
                        // ✅ Updated Handler
                        onChange={handleFileChange} 
                        required 
                        className="text-gray-700 mx-auto" 
                    />
                </div>

                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Submitting..." : "Submit to Legal"}
                </Button>
            </form>
        </Card>
      </div>
    </div>
  );
};

export default LegalIntakePage;