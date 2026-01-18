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
      // Optional: Check if role is EMPLOYEE
      navigate('/employee/dashboard');
    } catch (err: any) {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
            <h1 className="text-3xl font-extrabold text-blue-700">Employee Portal</h1>
            <p className="text-gray-500 mt-2">Internal Access Only</p>
        </div>

        <Card className="p-8 border-t-4 border-blue-600 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
                id="email" 
                type="email" 
                label="Corporate Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="name@spazaafy.co.za"
            />
            <Input 
                id="password" 
                type="password" 
                label="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
            />
            
            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </Card>
        
        <p className="text-center text-sm text-gray-600">
          First time here?{' '}
          <Link to="/employee/register" className="font-medium text-blue-600 hover:underline">
            Activate Account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default EmployeeLoginPage;