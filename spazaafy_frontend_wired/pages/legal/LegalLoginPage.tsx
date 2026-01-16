import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
      // 1. Perform standard login
      await login(email, password);
      
      // 2. Redirect to Legal Dashboard
      // (Note: ProtectedRoute will verify if they are actually Admin/Staff)
      navigate('/legal/dashboard');
    } catch (err: any) {
      setError("Invalid credentials or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Spazaafy Legal</h1>
            <p className="text-gray-400">Restricted Access</p>
        </div>

        <Card className="p-8">
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="email" type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input id="password" type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LegalLoginPage;