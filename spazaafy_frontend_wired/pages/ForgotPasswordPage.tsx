import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import PublicHeader from '../components/PublicHeader';
import mockApi from '../api/mockApi';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await mockApi.auth.requestPasswordReset(email);
            setSuccessMessage(response.detail);
        } catch (err: any) {
            // ✅ The error message is now clean from mockApi.ts
            setError(err.message || 'An unknown error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <PublicHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <Card title="Forgot Your Password?">
                        {successMessage ? (
                            <div className="text-center">
                                <p className="text-gray-700 dark:text-gray-300 mb-4">{successMessage}</p>
                                <Link to="/login" className="font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light">
                                    &larr; Back to Login
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    No problem. Enter your email address below and we'll send you a link to reset it.
                                </p>
                                <Input
                                    id="email"
                                    label="Email Address"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                />
                                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                                <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
                                    Send Reset Link
                                </Button>
                                <div className="text-center">
                                    <Link to="/login" className="text-sm font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light">
                                        Remembered your password?
                                    </Link>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ForgotPasswordPage;