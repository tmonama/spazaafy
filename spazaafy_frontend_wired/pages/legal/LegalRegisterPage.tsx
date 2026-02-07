import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const LegalRegisterPage: React.FC = () => {
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
      await mockApi.auth.requestLegalCode(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Access Denied. Email not authorized.');
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
      const res = await mockApi.accessControl.upgradeUser(email, code, 'LEGAL');

      alert(res.detail || 'Access granted. Please log in.');
      navigate('/legal/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-rose-900">Legal Portal</h1>
          <p className="text-rose-600">Secure Access Request</p>
        </div>

        <Card className="p-8 shadow-xl">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div className="bg-rose-50 p-3 rounded text-sm text-rose-800 border border-rose-200">
                You must have an <strong>Employee Profile</strong> to request Legal Admin access.
              </div>
              <Input
                id="email"
                type="email"
                label="Internal Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="legal.internal@spazaafy.co.za"
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
              >
                {loading ? 'Verifying...' : 'Request Access Code'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpgrade} className="space-y-6">
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded text-sm mb-4 text-center">
                Code sent to: <span className="font-bold">{email}</span>
              </div>

              <Input
                id="code"
                label="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white"
              >
                {loading ? 'Processing...' : 'Verify & Grant Access'}
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-gray-600">
          Already registered?{' '}
          <Link to="/legal/login" className="font-bold text-rose-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LegalRegisterPage;