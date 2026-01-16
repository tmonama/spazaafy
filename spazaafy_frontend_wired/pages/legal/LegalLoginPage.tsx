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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
            <h1 className="text-center text-4xl font-extrabold text-primary">Spazaafy Legal</h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Department of Legal & Compliance
            </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input 
                id="email" 
                type="email" 
                label="Internal Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
            />
            <Input 
                id="password" 
                type="password" 
                label="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
            />
            
            {error && <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">{error}</div>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600">
          Need access?{' '}
          <Link to="/legal/register" className="font-medium text-primary hover:text-primary-dark">
            Request Registration
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LegalLoginPage;