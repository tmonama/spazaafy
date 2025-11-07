import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';

const ALLOWED_DOMAINS = ['spazaafy.com', 'spazaafy.co.za'];
const ALLOWED_SPECIFIC_EMAILS = ['spazaafy@gmail.com'];
type FormStage = 'enter-email' | 'enter-code-password' | 'complete';

const AdminRegisterPage: React.FC = () => {
  const [stage, setStage] = useState<FormStage>('enter-email');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateAdminEmail = (email: string) => {
    const emailLower = email.toLowerCase();
    
    // 1. Check if it's a specifically allowed email
    if (ALLOWED_SPECIFIC_EMAILS.includes(emailLower)) {
      return true;
    }
    
    // 2. If not, check the domain
    if (!emailLower.includes('@')) return false;
    const domain = emailLower.split('@')[1];
    return ALLOWED_DOMAINS.includes(domain);
  };

  const handleSendCode = async () => {
    setError('');
    // Use the updated validation function
    if (!validateAdminEmail(email)) {
      // ✅ THE FIX: Update the error message
      setError('Registration is restricted to authorized emails.');
      return;
    }
    setIsLoading(true);
    try {
      await mockApi.auth.requestAdminCode(email);
      setStage('enter-code-password');
      setSuccess('Verification code sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to send code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await mockApi.auth.registerAdminVerified({ email, password, code, first_name: firstName, last_name:  lastName });
      setSuccess('Admin account created successfully! Redirecting to login...');
      setStage('complete');
      setTimeout(() => navigate('/admin/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. The code may be incorrect or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-primary dark:text-primary-light">Spazaafy</h1>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">Create Admin Account</h2>
        </div>
        <Card>
          <div className="space-y-6">
            <Input
              id="email" label="Admin Email" type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={stage !== 'enter-email'}
              readOnly={stage !== 'enter-email'}
            />

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="firstName" label="First name" type="text" required
                value={firstName} onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                id="lastName" label="Last name" type="text" required
                value={lastName} onChange={(e) => setLastName(e.target.value)}
              />
          </div>

            {stage === 'enter-email' && (
              <Button type="button" onClick={handleSendCode} className="w-full" isLoading={isLoading}>
                Send Verification Code
              </Button>
            )}

            {stage === 'enter-code-password' && (
              <form onSubmit={handleRegister} className="space-y-6">
                <Input
                  id="code" label="Verification Code" type="text" required value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
                <Input
                  id="password" label="Password" type="password" required value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Create Account
                </Button>
              </form>
            )}
          </div>
          <div className="mt-4">
            {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
            {success && <p className="text-sm text-center text-green-600 dark:text-green-400">{success}</p>}
          </div>
        </Card>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/admin-login" className="font-medium text-primary hover:text-primary-dark dark:text-primary-light">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;