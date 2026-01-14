// src/pages/RegisterPage.tsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import AddressAutocompleteInput from '../components/AddressAutocompleteInput';
import mockApi from '../api/mockApi';
import { GoogleLogin } from '@react-oauth/google'; // ✅ Import Google

interface Province {
  id: string;
  name: string;
}

// Helper: format backend errors
function formatRegisterError(err: any): string {
  let fallback = 'Registration failed. Please try again.';
  if (!err) return fallback;

  if (typeof err.message === 'string' && err.message.trim()) {
    const lower = err.message.toLowerCase();
    if (lower.includes('email') && lower.includes('exist')) return 'Account already exists for this email.';
    fallback = err.message;
  }

  const data = (err as any).response?.data || (err as any).body || (err as any).data;
  if (data && typeof data === 'object') {
    if (typeof (data as any).detail === 'string') return (data as any).detail;
    
    const parts: string[] = [];
    for (const key of Object.keys(data)) {
      const value = (data as any)[key];
      const arr = Array.isArray(value) ? value : [value];
      arr.forEach((v: any) => {
        const text = String(v);
        if (key === 'email' && text.toLowerCase().includes('exist')) {
          parts.push('Account already exists for this email.');
        } else {
          parts.push(text);
        }
      });
    }
    if (parts.length > 0) return parts.join('\n');
  }
  return fallback;
}

const RegisterPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Get Prefill Data (from Login redirect)
  const prefill = location.state?.prefill;

  const initialRole =
    location.state?.role === 'shop_owner'
      ? UserRole.SHOP_OWNER
      : UserRole.CONSUMER;

  const [role, setRole] = useState<UserRole>(initialRole);
  
  // 2. Initialize Form
  const [formData, setFormData] = useState({
    firstName: prefill?.firstName || '',
    lastName: prefill?.lastName || '',
    email: prefill?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    address: '',
    province: '',
    latitude: 0,
    longitude: 0,
  });

  // Track if we have a google token (either from login redirect or clicked on this page)
  const [googleToken, setGoogleToken] = useState<string | null>(prefill?.googleToken || null);
  const [isGoogleAccount, setIsGoogleAccount] = useState<boolean>(!!prefill?.isGoogle);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (location.state?.role) {
        setRole(location.state.role === 'shop_owner' ? UserRole.SHOP_OWNER : UserRole.CONSUMER);
    }
  }, [location.state]);

  useEffect(() => {
    if (role === UserRole.SHOP_OWNER || role === UserRole.CONSUMER) { 
       const fetchProvinces = async () => {
        try {
          const apiProvinces = await mockApi.core.getProvinces();
          setProvinces(apiProvinces.map((p) => ({ id: String(p.id), name: p.name })));
          if (apiProvinces.length > 0 && !formData.province) {
            setFormData((prev) => ({ ...prev, province: String(apiProvinces[0].id) }));
          }
        } catch (err) {
          console.error('Failed to fetch provinces:', err);
        }
      };
      fetchProvinces();
    }
  }, [role]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    if (error) setError('');
  };

  const handlePlaceSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, address, latitude: lat, longitude: lng }));
    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: '' }));
  };

  // ✅ Handle Google Sign Up Click
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    if (!token) return;

    setLoading(true);
    setError('');

    try {
        // Check backend: Does user exist?
        const res = await mockApi.auth.googleAuth(token);

        if (res.status === "LOGIN_SUCCESS") {
            // User ALREADY exists -> Log them in directly
            sessionStorage.setItem('access', res.access);
            sessionStorage.setItem('refresh', res.refresh);
            sessionStorage.setItem('user', JSON.stringify(res.user));
            window.location.href = '/dashboard';
        } 
        else if (res.status === "REGISTER_REQUIRED") {
            // User NEW -> Fill form
            setFormData(prev => ({
                ...prev,
                email: res.email,
                firstName: res.first_name,
                lastName: res.last_name,
            }));
            setGoogleToken(token);
            setIsGoogleAccount(true);
            setError(""); // Clear any errors
        }
    } catch (err) {
        console.error(err);
        setError("Google authentication failed.");
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});

    const newFieldErrors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) newFieldErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newFieldErrors.lastName = 'Last name is required.';
    if (!formData.email.trim()) newFieldErrors.email = 'Email address is required.';
    if (!formData.phone.trim()) newFieldErrors.phone = 'Phone number is required.';
    if (!formData.password.trim()) newFieldErrors.password = 'Password is required.';
    if (!formData.confirmPassword.trim()) newFieldErrors.confirmPassword = 'Please confirm your password.';

    if (role === UserRole.SHOP_OWNER) {
      if (!formData.shopName.trim()) newFieldErrors.shopName = 'Shop name is required.';
      if (!formData.address.trim()) newFieldErrors.address = 'Shop address is required.';
      if (!formData.province) newFieldErrors.province = 'Province is required.';
    }

    if (!formData.phone.trim() || !/^0[0-9]{9}$/.test(formData.phone.trim())) {
        newFieldErrors.phone = 'Please enter a valid SA phone number.';
    }

    // Password Validation (only if not empty, otherwise required check hits)
    if (formData.password) {
        if (formData.password.length < 8) newFieldErrors.password = 'Password must be at least 8 characters.';
        if (formData.password !== formData.confirmPassword) newFieldErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptTerms) setError('Please accept the Privacy Policy to continue.');

    if (Object.keys(newFieldErrors).length > 0 || !acceptTerms) {
      setFieldErrors(newFieldErrors);
      if (!error) setError((prev) => prev || 'Please correct the highlighted fields.');
      return;
    }

    setLoading(true);
    try {
      const apiRole = role === UserRole.SHOP_OWNER ? 'OWNER' : 'CONSUMER';
      
      const payload: any = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        role: apiRole,
        // ✅ Include Google Token
        google_token: googleToken
      };

      if (apiRole === 'OWNER') {
        payload.shop_name = formData.shopName.trim();
        payload.address = formData.address.trim();
        payload.province = formData.province;
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      await mockApi.auth.register(payload);
      
      if (isGoogleAccount) {
          // Auto-verified via Google
          alert("Account created successfully! Please sign in with Google.");
          navigate('/login');
      } else {
          setRegistrationSuccess(true);
      }

    } catch (err: any) {
      setError(formatRegisterError(err));
    } finally {
      setLoading(false);
    }
  };

  const allRequiredConsumerFilled = formData.firstName && formData.lastName && formData.email && formData.phone && formData.password && formData.confirmPassword;
  const allRequiredOwnerFilled = allRequiredConsumerFilled && formData.shopName && formData.address && formData.province;
  const canSubmit = !loading && acceptTerms && (role === UserRole.SHOP_OWNER ? allRequiredOwnerFilled : allRequiredConsumerFilled);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-primary dark:text-primary">
            Spazaafy
          </h1>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            {isGoogleAccount ? "Complete your Profile" : "Create your account"}
          </h2>
        </div>
        <Card>
          {registrationSuccess ? (
            <div className="text-center p-4">
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                Registration Successful!
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                Please check your email to find a verification link to activate your account.
              </p>
              <p className="mt-4">
                <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                  &larr; Back to Login
                </Link>
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              
              {/* Role Switcher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I am a:</label>
                <div className="flex rounded-md shadow-sm">
                  <button type="button" onClick={() => setRole(UserRole.CONSUMER)} className={`px-4 py-2 border border-gray-300 dark:border-dark-surface text-sm font-medium rounded-l-md w-1/2 ${role === UserRole.CONSUMER ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200'}`}>Consumer</button>
                  <button type="button" onClick={() => setRole(UserRole.SHOP_OWNER)} className={`-ml-px px-4 py-2 border border-gray-300 dark:border-dark-surface text-sm font-medium rounded-r-md w-1/2 ${role === UserRole.SHOP_OWNER ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200'}`}>Shop Owner</button>
                </div>
              </div>

              {/* ✅ GOOGLE BUTTON */}
              {!isGoogleAccount && (
                  <div className="my-4">
                    <div className="flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError("Google Sign-Up Failed")}
                            text="signup_with"
                            theme="outline"
                            width="100%"
                        />
                    </div>
                    <div className="relative mt-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-dark-surface text-gray-500">Or sign up with email</span>
                        </div>
                    </div>
                  </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-3">
                <Input id="firstName" label="First name" value={formData.firstName} onChange={handleChange} error={fieldErrors.firstName} required />
                <Input id="lastName" label="Last name" value={formData.lastName} onChange={handleChange} error={fieldErrors.lastName} required />
              </div>

              {/* ✅ Email Field - Disabled if Google */}
              <Input
                id="email"
                type="email"
                label="Email address"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                required
                disabled={isGoogleAccount} // Lock if Google
                className={isGoogleAccount ? "bg-gray-100 cursor-not-allowed" : ""}
              />

              <Input id="phone" type="tel" label="Phone" value={formData.phone} onChange={handleChange} error={fieldErrors.phone} required />

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-3">
                <Input id="password" type="password" label="Password" value={formData.password} onChange={handleChange} error={fieldErrors.password} required />
                <Input id="confirmPassword" type="password" label="Confirm password" value={formData.confirmPassword} onChange={handleChange} error={fieldErrors.confirmPassword} required />
              </div>

              {/* Shop Owner Specific */}
              {role === UserRole.SHOP_OWNER && (
                <>
                  <Input id="shopName" label="Shop name" value={formData.shopName} onChange={handleChange} error={fieldErrors.shopName} required />
                  <AddressAutocompleteInput id="address" label="Shop address" value={formData.address} required onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))} onPlaceSelect={handlePlaceSelect} error={fieldErrors.address} />
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Province</label>
                    <select id="province" name="province" value={formData.province} onChange={handleChange} required className={`mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md shadow-sm bg-white dark:bg-dark-input text-gray-900 dark:text-white border-gray-300 dark:border-dark-surface focus:outline-none focus:ring-dark-border focus:border-dark-border sm:text-sm ${fieldErrors.province ? 'border-red-500' : ''}`}>
                      {provinces.length === 0 ? <option value="" disabled>Loading provinces...</option> : 
                        <>
                          <option value="">Select a province</option>
                          {provinces.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                        </>
                      }
                    </select>
                    {fieldErrors.province && <p className="mt-1 text-xs text-red-500">{fieldErrors.province}</p>}
                  </div>
                </>
              )}

              {/* Terms */}
              <div className="flex items-start space-x-3">
                <button type="button" onClick={() => setAcceptTerms((prev) => !prev)} className={`mt-1 flex h-5 w-5 items-center justify-center rounded border text-xs ${acceptTerms ? 'bg-primary border-primary text-white' : 'bg-white border-dark-border dark:bg-dark-input dark:border-dark-border'}`} aria-pressed={acceptTerms}>
                  {acceptTerms && <span className="leading-none">✓</span>}
                </button>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  I agree to allow Spazaafy to collect my data and use my location for service verification. Read our <Link to="/privacy-policy" className="font-semibold text-primary hover:text-primary-dark" target="_blank" rel="noopener noreferrer">Privacy Policy &amp; Data Collection</Link>.
                </p>
              </div>

              {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200 whitespace-pre-line">{error}</div>}

              <Button type="submit" disabled={!canSubmit} className="w-full">
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          )}
        </Card>
        
        {!registrationSuccess && (
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;