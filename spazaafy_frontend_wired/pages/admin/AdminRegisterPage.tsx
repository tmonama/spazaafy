import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Card from '../../components/Card';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';

const AdminRegisterPage: React.FC = () => {
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
      await mockApi.auth.requestAdminCode(email);
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
      const res = await mockApi.accessControl.upgradeUser(email, code, 'ADMIN');

      alert(res.detail || 'Admin access granted. Please log in.');
      navigate('/admin-login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-white shadow-sm border border-gray-200 rounded-full flex items-center justify-center mb-4">
             <ShieldCheck className="text-green-600 w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-green-900">Admin Portal</h1>
          <p className="text-green-600">Access Request</p>
        </div>

        <Card className="p-8 shadow-xl">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
               <div className="bg-green-50 p-4 rounded-lg text-sm text-green-800 border border-green-100 mb-2">
                You must already have an active <strong>Employee Profile</strong> to request Admin access.
              </div>
              <Input
                id="email"
                label="Admin Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                isLoading={loading}
              >
                Send Verification Code
              </Button>
            </form>
          ) : (
            <form onSubmit={handleUpgrade} className="space-y-6">
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm mb-4 text-center flex items-center justify-center">
                <Lock className="w-4 h-4 mr-2" /> Code sent to {email}
              </div>

              <Input
                id="code"
                label="Verification Code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
              />
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                isLoading={loading}
              >
                Verify & Grant Access
              </Button>
            </form>
          )}
        </Card>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/admin-login" className="font-bold text-green-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminRegisterPage;