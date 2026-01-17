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
    'hr@spazaafy.co.za'
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
        setError("Access Denied: This email is not authorized for HR.");
        return;
    }

    try {
      await mockApi.auth.requestAdminCode(email); // Reusing admin code logic
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send code.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await mockApi.auth.registerAdminVerified({ email, code, first_name: firstName, last_name: lastName, password });
      alert("Registration successful.");
      navigate('/hr/login');
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-center text-3xl font-extrabold text-purple-700">Spazaafy HR</h1>
        <Card className="p-8 border-t-4 border-purple-600">
          {error && <div className="mb-4 bg-red-50 text-red-600 p-2 rounded text-sm text-center">{error}</div>}
          
          {step === 1 ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <Input id="email" type="email" label="HR Email" value={email} onChange={e => setEmail(e.target.value)} required />
              <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">Request Access</Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input id="code" label="Code" value={code} onChange={e => setCode(e.target.value)} required />
              <div className="grid grid-cols-2 gap-2">
                <Input id="fname" label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                <Input id="lname" label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
              <Input id="pass" type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} required />
              <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">Register</Button>
            </form>
          )}
        </Card>
        <p className="text-center text-sm"><Link to="/hr/login" className="text-purple-600 hover:underline">Login here</Link></p>
      </div>
    </div>
  );
};
export default HRRegisterPage;