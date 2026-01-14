// src/pages/LoginPage.tsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';
import mockApi from '../api/mockApi'; // Ensure this points to your API client

const HOME = '/dashboard';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ 1. Handle Standard Login
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate(HOME, { replace: true });
    } catch (err: any) {
      let msg = err?.message || 'Login failed. Please check your credentials.';
      // Attempt to parse nested error messages
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

  // ✅ 2. Handle Google Login Success
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('');
    const token = credentialResponse.credential;

    if (!token) {
        setError("Google authentication failed. No token received.");
        return;
    }

    try {
        setLoading(true);
        // Call Backend
        const res = await mockApi.auth.googleAuth(token);

        if (res.status === "LOGIN_SUCCESS") {
            // User exists: Manually save session and reload/redirect
            // (Assuming standard JWT auth storage keys)
            sessionStorage.setItem('access', res.access);
            sessionStorage.setItem('refresh', res.refresh);
            sessionStorage.setItem('user', JSON.stringify(res.user));
            
            // Force reload to pick up auth state or navigate if AuthContext listens to storage
            window.location.href = HOME; 
        } 
        else if (res.status === "REGISTER_REQUIRED") {
            // User new: Navigate to Register with Prefill Data
            navigate('/register', { 
                state: { 
                    prefill: {
                        email: res.email,
                        firstName: res.first_name,
                        lastName: res.last_name,
                        googleToken: token,
                        isGoogle: true
                    }
                } 
            });
        }
    } catch (err: any) {
        console.error(err);
        setError("Failed to authenticate with server.");
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

          {/* ✅ Google Sign In Section */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-dark-surface text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-center w-full">
               <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login Failed")}
                  theme="outline"
                  size="large"
                  width="100%" 
                  text="signin_with"
                  shape="rectangular"
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