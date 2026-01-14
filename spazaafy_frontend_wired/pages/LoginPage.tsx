// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';

const HOME = '/dashboard';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, googleLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-primary dark:text-primary">
            Spazaafy
          </h1>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Sign in to your account
          </h2>
        </div>

        <Card>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
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
                type="submit"
                disabled={loading || !email || !password}
                className="w-full"
                aria-label="Sign in"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-4">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const token = credentialResponse.credential;
                  if (!token) throw new Error('No credential returned');

                  const result = await googleLogin(token);

                  if (result.status === 'REGISTER_REQUIRED') {
                    navigate('/register', {
                      state: {
                        google: true,
                        googleToken: token,
                        email: result.email,
                        firstName: result.first_name,
                        lastName: result.last_name,
                      },
                    });
                    return;
                  }

                  navigate(HOME, { replace: true });
                } catch {
                  setError('Google sign-in failed. Please try again.');
                }
              }}
              onError={() => setError('Google sign-in failed.')}
            />
          </div>
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