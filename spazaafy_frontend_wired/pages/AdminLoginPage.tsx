import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

const AdminLoginPage: React.FC = () => {
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
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-green-900">Admin Portal</h1>
          <p className="text-green-600">Internal Administration</p>
        </div>

        <Card className="p-8 shadow-xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Admin Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-sm text-center text-red-600">{error}</p>}

            <Button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              isLoading={loading}
            >
              Sign in as Admin
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600">
          Need to create a new admin account?{' '}
          <Link to="/admin/register" className="font-bold text-green-700 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLoginPage;
