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
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateAdminEmail = (value: string) => {
    const emailLower = value.toLowerCase();

    // 1) specifically allowed emails
    if (ALLOWED_SPECIFIC_EMAILS.includes(emailLower)) return true;

    // 2) allowed domains
    if (!emailLower.includes('@')) return false;
    const domain = emailLower.split('@')[1];
    return ALLOWED_DOMAINS.includes(domain);
  };

  const handleSendCode = async () => {
    setError('');
    setSuccess('');

    if (!validateAdminEmail(email)) {
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
    setSuccess('');
    setIsLoading(true);

    try {
      await mockApi.auth.registerAdminVerified({
        email,
        password,
        code,
        first_name: firstName,
        last_name: lastName,
      });

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-green-900">Admin Portal</h1>
          <p className="text-green-600">Create Admin Account</p>
        </div>

        <Card className="p-8 shadow-xl">
          <div className="space-y-6">
            <Input
              id="email"
              label="Admin Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={stage !== 'enter-email'}
              readOnly={stage !== 'enter-email'}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="firstName"
                label="First name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                id="lastName"
                label="Last name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            {stage === 'enter-email' && (
              <Button
                type="button"
                onClick={handleSendCode}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                isLoading={isLoading}
              >
                Send Verification Code
              </Button>
            )}

            {stage === 'enter-code-password' && (
              <form onSubmit={handleRegister} className="space-y-6">
                <Input
                  id="code"
                  label="Verification Code"
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                />
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                />
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </form>
            )}

            <div className="mt-2">
              {error && <p className="text-sm text-center text-red-600">{error}</p>}
              {success && <p className="text-sm text-center text-green-700">{success}</p>}
            </div>
          </div>
        </Card>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/admin/login" className="font-bold text-green-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;
