// pages/LoginPage.tsx — FULL FILE (uses AuthContext.login and navigates)

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';

const HOME = '/dashboard';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // keep the role toggle UI if you like, but we do NOT block login on it
  const [role, setRole] = useState<UserRole>(UserRole.CONSUMER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      // optional: we can warn if mismatch between chosen role vs actual
      // but never block navigation
      navigate(HOME, { replace: true });
    } catch (err: any) {
      let msg = err?.message || 'Login failed. Please check your credentials.';
      try {
        const parsed = JSON.parse(msg.split(':').pop() || '{}');
        msg =
          (parsed && (parsed.detail || parsed?.non_field_errors?.[0])) ||
          (parsed && typeof parsed === 'object' ? Object.values(parsed)?.[0]?.[0] : undefined) ||
          msg;
      } catch {}
      setError(String(msg));
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
            Sign in to your account
          </h2>
        </div>

        <Card>
          {/* Keep a form only to catch Enter key and prevent native reload */}
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault(); // stop browser reload on Enter
              handleSubmit();     // call our handler explicitly
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a:</label>
              <div className="grid grid-cols-2 rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CONSUMER)}
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-l-md ${
                    role === UserRole.CONSUMER
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Consumer
                </button>
                <button
                  type="button"
                  onClick={() => setRole(UserRole.SHOP_OWNER)}
                  className={`-ml-px px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-r-md ${
                    role === UserRole.SHOP_OWNER
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Shop Owner
                </button>
              </div>
            </div>

            <Input
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                {error}
              </div>
            )}

            <div>
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !email || !password}
                className="w-full"
                aria-label="Sign in"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
