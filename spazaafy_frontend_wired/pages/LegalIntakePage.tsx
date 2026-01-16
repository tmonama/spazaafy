import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { legalApi } from '../api/legalApi';

const LegalIntakePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return alert("Please attach the document");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
        await legalApi.submitRequest(formData);
        setSuccess(true);
    } catch (err) {
        alert("Failed to submit");
    } finally {
        setLoading(false);
    }
  };

  if (success) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="text-center p-8">
              <h2 className="text-2xl font-bold text-green-600 mb-2">Submission Received</h2>
              <p className="text-gray-600">The Department of Legal & Compliance will review your document.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Submit Another</Button>
          </Card>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Spazaafy Legal Intake</h1>
            <p className="text-gray-400">Department of Legal & Compliance</p>
        </div>

        <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* ✅ FIX: Added id prop */}
                    <Input name="submitter_name" id="submitter_name" label="Your Name" required />
                    <Input name="submitter_email" id="submitter_email" label="Your Email" type="email" required />
                </div>
                
                {/* ✅ FIX: Added id prop */}
                <Input name="department" id="department" label="Department / Organization" placeholder="e.g. Field Ops" required />

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select name="category" className="w-full border rounded-md p-2">
                            <option value="CONTRACT">Contract / Agreement</option>
                            <option value="POLICY">Policy Document</option>
                            <option value="IP">Intellectual Property</option>
                            <option value="COMPLIANCE">Regulatory Compliance</option>
                            <option value="DISPUTE">Dispute / Litigation</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <select name="urgency" className="w-full border rounded-md p-2">
                            <option value="ROUTINE">Routine (7-14 Days)</option>
                            <option value="PRIORITY">Priority (3-5 Days)</option>
                            <option value="URGENT">Urgent (24-48 Hours)</option>
                            <option value="CRITICAL">Critical (Immediate)</option>
                        </select>
                    </div>
                </div>

                {/* ✅ FIX: Added id prop */}
                <Input name="title" id="title" label="Document Title" required />
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description & Context</label>
                    <textarea name="description" rows={4} className="w-full border rounded-md p-2" required placeholder="What is this for? What are the risks?" />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input type="file" name="document_file" onChange={e => setFile(e.target.files?.[0] || null)} required />
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