import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const EmployeeLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      
      // ✅ CHANGE: Allow 'admin' role to access Employee Portal too
      if (user.role === 'employee' || user.role === 'admin') {
         navigate('/employee/dashboard');
      } else {
         setError("Access Denied: Only employees and staff can access this portal.");
      }
    } catch (err: any) {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
            <h1 className="text-3xl font-extrabold text-blue-900">Employee Portal</h1>
            <p className="text-blue-600">Access your personal workspace</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="email" type="email" label="Work Email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="name@spazaafy.co.za" />
            <Input id="password" type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600">
          First time here?{' '}
          <Link to="/employee/register" className="font-bold text-blue-700 hover:underline">
            Activate Account
          </Link>
        </p>
      </div>
    </div>
  );
};
export default EmployeeLoginPage;