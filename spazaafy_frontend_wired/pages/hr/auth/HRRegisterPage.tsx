import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import mockApi from '../../../api/mockApi'; // Using base auth api for code request
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const ALLOWED_EMAILS = [
  'spazaafy@gmail.com',
  'onboarding.internal@spazaafy.co.za',
  'training.internal@spazaafy.co.za',
  'hr@spazaafy.co.za',
];

const HRRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!ALLOWED_EMAILS.includes(email.toLowerCase())) {
      setLoading(false);
      setError('Access Denied: This email is not authorized for HR.');
      return;
    }

    try {
      await mockApi.auth.requestAdminCode(email); // Reusing admin code logic
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await mockApi.auth.registerAdminVerified({
        email,
        code,
        first_name: firstName,
        last_name: lastName,
        password,
      });

      alert('Registration successful.');
      navigate('/hr/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-fuchsia-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-purple-900">HR Portal</h1>
          <p className="text-purple-600">Request access to HR tools</p>
        </div>

        <Card className="p-8 shadow-xl">
          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <Input
                id="email"
                type="email"
                label="HR Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Requesting...' : 'Request Access'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 text-purple-800 p-3 rounded text-sm mb-2 text-center">
                Verification code sent to <strong>{email}</strong>
              </div>

              <Input id="code" label="Code" value={code} onChange={(e) => setCode(e.target.value)} required />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  id="fname"
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <Input
                  id="lname"
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <Input
                id="pass"
                type="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {loading ? 'Registering...' : 'Register'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/hr/login" className="font-bold text-purple-700 hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default HRRegisterPage;
