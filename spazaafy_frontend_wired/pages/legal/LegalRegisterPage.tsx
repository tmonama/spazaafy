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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-primary">Legal Dept.</h1>
          <h2 className="mt-2 text-center text-lg text-gray-600">Secure Registration</h2>
        </div>

        <Card>
          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm text-center">{error}</div>}

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
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Verifying..." : "Request Access Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded text-sm mb-4 text-center">
                Code sent to: <span className="font-bold">{email}</span>
              </div>
              
              <Input 
                id="code" 
                label="Verification Code" 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                required 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                    id="fname" 
                    label="First Name" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)} 
                    required 
                />
                <Input 
                    id="lname" 
                    label="Last Name" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)} 
                    required 
                />
              </div>

              <Input 
                id="pass" 
                type="password" 
                label="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Registering..." : "Complete Registration"}
              </Button>
            </form>
          )}
        </Card>
        
        <p className="text-center text-sm text-gray-600">
            Already registered?{' '}
            <Link to="/legal/login" className="font-medium text-primary hover:text-primary-dark">
            Sign in
            </Link>
        </p>
      </div>
    </div>
  );
};

export default LegalRegisterPage;