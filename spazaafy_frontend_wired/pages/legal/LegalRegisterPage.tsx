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
      await mockApi.auth.requestLegalCode(email);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Access Denied. Email not authorized.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await mockApi.auth.registerLegal({ email, code, first_name: firstName, last_name: lastName, password });
      alert("Registration successful. Please log in.");
      navigate('/legal/login');
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-white tracking-tight">Legal Dept.</h1>
          <h2 className="mt-2 text-center text-lg text-gray-400">Secure Registration</h2>
        </div>

        <Card className="bg-gray-800 border-gray-700 p-8">
          {error && <div className="mb-4 bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded text-sm text-center">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-6">
              <Input 
                id="email" 
                type="email" 
                label="Internal Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="legal.internal@spazaafy.co.za"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                labelClassName="text-gray-300"
              />
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? "Verifying..." : "Request Access Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="bg-blue-900/30 border border-blue-800 text-blue-300 px-4 py-3 rounded text-sm mb-4 text-center">
                Code sent to: <span className="font-bold text-white">{email}</span>
              </div>
              
              <Input 
                id="code" 
                label="Verification Code" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                required 
                className="bg-gray-700 border-gray-600 text-white"
                labelClassName="text-gray-300"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                    id="fname" 
                    label="First Name" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required 
                    className="bg-gray-700 border-gray-600 text-white"
                    labelClassName="text-gray-300"
                />
                <Input 
                    id="lname" 
                    label="Last Name" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    required 
                    className="bg-gray-700 border-gray-600 text-white"
                    labelClassName="text-gray-300"
                />
              </div>

              <Input 
                id="pass" 
                type="password" 
                label="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="bg-gray-700 border-gray-600 text-white"
                labelClassName="text-gray-300"
              />
              
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {loading ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          )}
        </Card>
        
        <p className="text-center text-sm text-gray-500">
            Already registered?{' '}
            <Link to="/legal/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign in
            </Link>
        </p>
      </div>
    </div>
  );
};

export default LegalRegisterPage;