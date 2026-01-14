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
  const { login, loginWithGoogle } = useAuth(); // ✅ Get loginWithGoogle

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

  // ✅ Handle Google Success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    setLoading(true);
    try {
      const token = credentialResponse.credential;
      if (!token) {
        throw new Error("No Google credential received.");
      }

      console.log("Sending Google Token to backend:", token); // Debug log

      const result = await loginWithGoogle(token);
      
      if (result.status === 'LOGIN_SUCCESS') {
        navigate(HOME, { replace: true });
      } else if (result.status === 'REGISTER_REQUIRED') {
        navigate('/register', { 
          state: { 
            googleData: result.data, 
            googleToken: token 
          } 
        });
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err); // Log full error to console
      // Show the actual error message from the backend (mockApi parses it)
      setError(err.message || 'Google sign-in failed. Please try again.');
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

          {/* ✅ Google Auth Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-dark-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-surface text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign In was unsuccessful')}
                  theme="outline"
                  width="100%" 
                  // Note: The Google button has a specific width style, usually handled by library
               />
            </div>
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