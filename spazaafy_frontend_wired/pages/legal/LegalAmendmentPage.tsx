import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { legalApi } from '../../api/legalApi';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

const LegalAmendmentPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !token) return;

        setLoading(true);
        const formData = new FormData();
        formData.append('revision_file', file);

        try {
            await legalApi.submitAmendment(token, formData);
            setStatus('SUCCESS');
        } catch (err) {
            console.error(err);
            setStatus('ERROR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 shadow-xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Upload Revised Document</h1>
                    <p className="text-gray-500 text-sm mt-1">Legal & Compliance Department</p>
                </div>

                {status === 'SUCCESS' ? (
                    <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Upload Successful</h3>
                        <p className="text-gray-600 mt-2">
                            Thank you. The legal team has been notified and will review your amendment shortly.
                        </p>
                    </div>
                ) : status === 'ERROR' ? (
                    <div className="text-center py-8">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">Upload Failed</h3>
                        <p className="text-gray-600 mt-2">
                            This link may have expired or is invalid. Please contact the legal department directly.
                        </p>
                        <Button variant="secondary" onClick={() => setStatus('IDLE')} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                            <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600 mb-2">Click to select file (Max 10MB)</p>
                            <input 
                                type="file" 
                                onChange={handleFileChange} 
                                required 
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            />
                        </div>

                        {file && (
                            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm text-center">
                                Selected: <strong>{file.name}</strong>
                            </div>
                        )}

                        <Button type="submit" disabled={loading || !file} className="w-full">
                            {loading ? "Uploading..." : "Submit Amendment"}
                        </Button>
                    </form>
                )}
            </Card>
        </div>
    );
};

export default LegalAmendmentPage;