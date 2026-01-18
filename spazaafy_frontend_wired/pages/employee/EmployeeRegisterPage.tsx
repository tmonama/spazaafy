import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { API_BASE } from '../../api/mockApi';

// ✅ Define allowed exceptions here on frontend too
const ALLOWED_EXCEPTIONS = ['spazaafy@gmail.com', 'tappdevelops@gmail.com'];

const EmployeeRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const emailLower = email.toLowerCase().trim();

    // ✅ Updated Validation Logic
    const isAllowedDomain = emailLower.endsWith('@spazaafy.co.za');
    const isException = ALLOWED_EXCEPTIONS.includes(emailLower);

    if (!isAllowedDomain && !isException) {
        setError("Email must be a valid @spazaafy.co.za address.");
        setLoading(false);
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/hr/auth/employee/request_access/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ first_name: firstName, last_name: lastName, email: emailLower })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Verification failed");
        
        setStep(2);
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    setLoading(true);
    setError('');

    try {
        const res = await fetch(`${API_BASE}/hr/auth/employee/complete_registration/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                first_name: firstName, 
                last_name: lastName, 
                email: email.toLowerCase().trim(), 
                code, 
                password 
            })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || "Registration failed");

        alert("Account Activated! Please Login.");
        navigate('/employee/login');
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full p-8">
            <h1 className="text-2xl font-bold mb-2 text-center text-gray-900">Activate Employee Account</h1>
            <p className="text-center text-gray-500 mb-6 text-sm">Link your HR profile to a digital account.</p>
            
            {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded text-sm text-center">{error}</div>}

            {step === 1 ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input id="fname" label="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} required placeholder="As per HR records" />
                        <Input id="lname" label="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} required />
                    </div>
                    <Input id="email" type="email" label="Work Email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@spazaafy.co.za" />
                    
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Verifying..." : "Verify Identity"}
                    </Button>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="bg-blue-50 text-blue-800 p-3 rounded text-sm mb-2 text-center">
                        Verification code sent to <strong>{email}</strong>
                    </div>
                    
                    <Input id="code" label="Verification Code" value={code} onChange={e => setCode(e.target.value)} required />
                    <Input id="pass" type="password" label="Create Password" value={password} onChange={e => setPassword(e.target.value)} required />
                    <Input id="conf" type="password" label="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />

                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Activating..." : "Complete Activation"}
                    </Button>
                </form>
            )}
        </Card>
    </div>
  );
};
export default EmployeeRegisterPage;