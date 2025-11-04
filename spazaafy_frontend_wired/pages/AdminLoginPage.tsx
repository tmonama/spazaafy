import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const auth = useAuth();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ FIX 1: Capture the user object that is returned by the login function
      const loggedInUser = await auth.login(email, password);

      // ✅ FIX 2: Check the role of the user object we just received
      if (loggedInUser?.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        // If the user is valid but not an admin, log them out immediately
        await auth.logout();
        setError('Access denied. This user is not an administrator.');
      }
    } catch (err: any) {
      console.error("Admin login failed:", err);
      // The error from the API (like "Invalid email or password") will be caught here
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-primary dark:text-primary-light">Spazaafy</h1>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Administrator Login
          </h2>
        </div>
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input id="email" label="Admin Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input id="password" label="Password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />

            {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
            
            <Button type="submit" className="w-full" isLoading={loading}>
              Sign in as Admin
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLoginPage;