import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import mockApi from '../api/mockApi';
import Card from '../components/Card';
import PublicHeader from '../components/PublicHeader';

const EmailVerificationPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your account, please wait...');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setStatus('error');
                setMessage('No verification token found. The link may be broken.');
                return;
            }

            try {
                const response = await mockApi.auth.confirmEmailVerification(token);
                setStatus('success');
                setMessage(response.detail || 'Your account has been successfully verified.');
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may be invalid or expired.');
            }
        };

        verifyToken();
    }, [token]);

    const statusColors = {
        verifying: 'text-gray-700 dark:text-gray-300',
        success: 'text-green-600 dark:text-green-400',
        error: 'text-red-600 dark:text-red-400',
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <PublicHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <Card title="Account Verification">
                        <div className="text-center">
                            <p className={`mb-6 ${statusColors[status]}`}>{message}</p>
                            {(status === 'success' || status === 'error') && (
                                <Link to="/login" className="font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light">
                                    Proceed to Login &rarr;
                                </Link>
                            )}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default EmailVerificationPage;