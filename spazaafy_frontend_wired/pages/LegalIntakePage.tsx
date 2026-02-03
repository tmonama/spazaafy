import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { legalApi } from '../api/legalApi';
import { UploadCloud, X, FileText, Plus } from 'lucide-react';

const LegalIntakePage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        const newFiles = Array.from(e.target.files);
        const validFiles: File[] = [];

        // Validate size (10MB limit per file)
        newFiles.forEach(file => {
            if (file.size > 10 * 1024 * 1024) {
                alert(`File ${file.name} is too large (Max 10MB).`);
            } else {
                validFiles.push(file);
            }
        });

        setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) return alert("Please attach at least one document");

    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Remove the default file input logic from FormData if it exists
    formData.delete('document_file'); 

    // ✅ Append all files with the key 'documents' (matching backend view)
    files.forEach((file) => {
        formData.append('documents', file);
    });
    
    try {
        await legalApi.submitRequest(formData);
        setSuccess(true);
    } catch (err: any) {
        console.error(err);
        alert("Failed to submit request.");
    } finally {
        setLoading(false);
    }
  };

  if (success) return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="p-8 bg-white shadow-lg flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-2">Submission Received</h2>
              <p className="text-gray-600 mb-6">The Department of Legal & Compliance has received {files.length} document(s).</p>
              <Button onClick={() => window.location.reload()} className="px-8">
                Submit Another
              </Button>
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
                            <option value="TERMINATION">Termination / Resignation</option>
                            <option value="OTHER">Other Advisory</option>
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

                {/* ✅ Multiple File Upload UI */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Attached Documents</label>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-center relative">
                        <input 
                            type="file" 
                            multiple 
                            onChange={handleFileChange} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center pointer-events-none">
                            <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500 font-medium">Click to upload files (Max 10MB each)</p>
                            <p className="text-xs text-gray-400">PDF, Word, Images allowed</p>
                        </div>
                    </div>

                    {/* Selected Files List */}
                    {files.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {files.map((f, i) => (
                                <div key={i} className="flex items-center justify-between bg-blue-50 p-2 rounded border border-blue-100">
                                    <div className="flex items-center truncate">
                                        <FileText className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                                        <span className="text-sm text-blue-800 truncate">{f.name}</span>
                                        <span className="text-xs text-gray-500 ml-2">({(f.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => removeFile(i)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Button type="submit" disabled={loading} className="w-full mt-4">
                    {loading ? "Submitting..." : `Submit ${files.length > 0 ? files.length : ''} Documents`}
                </Button>
            </form>
        </Card>
      </div>
    </div>
  );
};

export default LegalIntakePage;