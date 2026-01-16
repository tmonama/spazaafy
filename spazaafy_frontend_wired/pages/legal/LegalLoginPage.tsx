import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';

const LegalLoginPage: React.FC = () => {
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
      await login(email, password);
      navigate('/legal/dashboard');
    } catch (err: any) {
      setError("Invalid credentials or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
            <h1 className="text-center text-4xl font-extrabold text-white tracking-tight">Spazaafy Legal</h1>
            <p className="mt-2 text-center text-sm text-gray-400">
              Department of Legal & Compliance
            </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
                id="email" 
                type="email" 
                label="Internal Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                labelClassName="text-gray-300"
            />
            <Input 
                id="password" 
                type="password" 
                label="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                labelClassName="text-gray-300"
            />
            
            {error && <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-800">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-500">
          Need access?{' '}
          <Link to="/legal/register" className="font-medium text-blue-400 hover:text-blue-300">
            Request Registration
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LegalLoginPage;