import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import PublicHeader from '../components/PublicHeader';
import mockApi from '../api/mockApi';

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (password !== passwordConfirm) {
            setError("The two password fields don't match.");
            return;
        }
        if (!token) {
            setError("Invalid session. Please request a new reset link.");
            return;
        }

        setError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            const response = await mockApi.auth.confirmPasswordReset({
                token,
                password,
                password_confirm: passwordConfirm,
            });
            setSuccessMessage(response.detail);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            // ✅ The error message is now clean from mockApi.ts
            setError(err.message || 'The link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <PublicHeader />
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto">
                    <Card title="Reset Your Password">
                        {successMessage ? (
                            <div className="text-center">
                                <p className="text-green-600 dark:text-green-400 mb-4">{successMessage}</p>
                                <p className="text-gray-600 dark:text-gray-400">Redirecting you to the login page...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <Input
                                    id="password"
                                    label="New Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                />
                                <Input
                                    id="passwordConfirm"
                                    label="Confirm New Password"
                                    type="password"
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                    error={error.includes("match") ? error : undefined}
                                />
                                {error && !error.includes("match") && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                                <Button type="submit" className="w-full" isLoading={loading} disabled={loading}>
                                    Reset Password
                                </Button>
                            </form>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default ResetPasswordPage;