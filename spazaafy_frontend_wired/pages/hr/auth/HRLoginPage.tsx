import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import Card from '../../../components/Card';
import Input from '../../../components/Input';
import Button from '../../../components/Button';

const HRLoginPage: React.FC = () => {
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
      navigate('/hr/hiring');
    } catch (err) {
      setError("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-4">
        <h1 className="text-center text-3xl font-extrabold text-purple-700">HR Login</h1>
        <Card className="p-8 border-t-4 border-purple-600">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input id="email" type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input id="password" type="password" label="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white">Sign In</Button>
          </form>
        </Card>
        <p className="text-center text-sm"><Link to="/hr/register" className="text-purple-600 hover:underline">Request Access</Link></p>
      </div>
    </div>
  );
};
export default HRLoginPage;