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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Legal Dept.</h1>
          <p className="text-gray-400">Secure Registration</p>
        </div>

        <Card className="p-8">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}

          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <Input 
                id="email" 
                type="email" 
                label="Internal Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="legal.internal@spazaafy.co.za"
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Verifying..." : "Request Access Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-2">
                Code sent to: <strong>{email}</strong>
              </div>
              <Input id="code" label="Verification Code" value={code} onChange={e => setCode(e.target.value)} required />
              <div className="grid grid-cols-2 gap-2">
                <Input id="fname" label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                <Input id="lname" label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <Input id="pass" type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              
              <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                {loading ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center">
            <Link to="/legal/login" className="text-sm text-blue-600 hover:underline">
              Already have an account? Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LegalRegisterPage;