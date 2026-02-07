import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import mockApi from '../../../api/mockApi'; 
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { Mail, CheckCircle } from 'lucide-react';

const HRRegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await mockApi.auth.requestHRCode(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ✅ Call NEW upgrade endpoint
      const res = await mockApi.accessControl.upgradeUser(email, code, 'HR');

      alert(res.detail || 'Access granted. Please log in.');
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
              <div className="bg-purple-50 p-3 rounded text-sm text-purple-800 border border-purple-200">
                You must have an <strong>Employee Profile</strong> to proceed.
              </div>
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
            <form onSubmit={handleUpgrade} className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 text-purple-800 p-3 rounded text-sm mb-2 text-center">
                Verification code sent to <strong>{email}</strong>
              </div>

              <Input id="code" label="Verification Code" value={code} onChange={(e) => setCode(e.target.value)} required />
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center"
              >
                {loading ? 'Verifying...' : <><CheckCircle className="w-4 h-4 mr-2"/> Verify & Access</>}
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