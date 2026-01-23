import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import mockApi from '../../api/mockApi';
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';

const TechRegisterPage: React.FC = () => {
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

    try {
      await mockApi.auth.requestTechCode(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Access Denied. Email not on whitelist.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await mockApi.auth.registerTech({
        email,
        code,
        first_name: firstName,
        last_name: lastName,
        password,
      });

      alert('Registration successful. Redirecting to login...');
      navigate('/tech/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4 relative overflow-hidden">
      
       {/* Background Ambience */}
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-40 pointer-events-none"></div>

      <div className="max-w-md w-full space-y-6 relative z-10">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-[#1e1e1e] border border-gray-700 rounded-full flex items-center justify-center mb-4">
             <ShieldCheck className="text-green-400 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Secure Registration</h1>
          <p className="text-gray-400 text-sm mt-1">Authorized Personnel Only</p>
        </div>

        <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Internal Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="engineering@spazaafy.co.za"
                    className="w-full bg-[#2c2c2e] border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                    Must be a valid department email address.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-200 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Email'}
                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="bg-blue-900/20 border border-blue-900/50 text-blue-300 px-4 py-3 rounded-lg text-sm mb-4 text-center flex items-center justify-center">
                <Lock className="w-3 h-3 mr-2" /> Code sent to {email}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">ACCESS CODE</label>
                <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="w-full bg-[#2c2c2e] border border-gray-700 text-white rounded-lg px-4 py-3 text-center tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="000000"
                    maxLength={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">First Name</label>
                    <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full bg-[#2c2c2e] border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">Last Name</label>
                    <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="w-full bg-[#2c2c2e] border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Set Password</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#2c2c2e] border border-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg shadow-purple-900/20 disabled:opacity-50"
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have credentials?{' '}
          <Link to="/tech/login" className="font-bold text-gray-300 hover:text-white transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default TechRegisterPage;