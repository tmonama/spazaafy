import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import AddressAutocompleteInput from '../components/AddressAutocompleteInput';
import mockApi from '../api/mockApi';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../hooks/useAuth';

interface Province {
  id: string;
  name: string;
}

// Helper: format backend errors, with special handling for email already exists
function formatRegisterError(err: any): string {
  // Start from a generic fallback
  let fallback = 'Registration failed. Please try again.';

  if (!err) return fallback;

  // If message already exists
  if (typeof err.message === 'string' && err.message.trim()) {
    const lower = err.message.toLowerCase();
    if (lower.includes('email') && lower.includes('exist')) {
      return 'Account already exists for this email.';
    }
    fallback = err.message;
  }

  const data = (err as any).response?.data || (err as any).body || (err as any).data;

  if (data && typeof data === 'object') {
    // Common DRF style: { detail: "... " }
    if (typeof (data as any).detail === 'string') {
      const detail = (data as any).detail;
      const lower = detail.toLowerCase();
      if (lower.includes('email') && lower.includes('exist')) {
        return 'Account already exists for this email.';
      }
      return detail;
    }

    // Field-based errors e.g. { email: ["user with this email already exists."] }
    const parts: string[] = [];
    for (const key of Object.keys(data)) {
      const value = (data as any)[key];
      const arr = Array.isArray(value) ? value : [value];

      arr.forEach((v: any) => {
        const text = String(v);
        const lower = text.toLowerCase();
        if (key === 'email' && lower.includes('exist')) {
          parts.push('Account already exists for this email.');
        } else {
          const label =
            key === 'non_field_errors' || key === 'detail'
              ? ''
              : key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          parts.push(label ? `${label}: ${text}` : text);
        }
      });
    }

    if (parts.length > 0) {
      const combined = parts.join('\n');
      const lower = combined.toLowerCase();
      if (lower.includes('email') && lower.includes('exist')) {
        return 'Account already exists for this email.';
      }
      return combined;
    }
  }

  // Final safety net for email-exists wording hiding elsewhere
  const combined = fallback;
  const lower = combined.toLowerCase();
  if (lower.includes('email') && lower.includes('exist')) {
    return 'Account already exists for this email.';
  }

  return combined || 'Registration failed. Please try again.';
}

const RegisterPage: React.FC = () => {
  const location = useLocation();
  const { loginWithGoogle } = useAuth();

  // Check for Google Data passed from Login Page
  const googleData = location.state?.googleData;
  const googleTokenState = location.state?.googleToken;

  const initialRole =
    location.state?.role === 'shop_owner'
      ? UserRole.SHOP_OWNER
      : UserRole.CONSUMER;

  const [role, setRole] = useState<UserRole>(initialRole);

  // ✅ Pre-fill data if Google Data exists
  const [formData, setFormData] = useState({
    firstName: googleData?.first_name || '',
    lastName: googleData?.last_name || '',
    email: googleData?.email || '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    address: '',
    province: '',
    latitude: 0,
    longitude: 0,
  });

  const [googleToken, setGoogleToken] = useState<string | null>(googleTokenState || null);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    setRole(
      location.state?.role === 'shop_owner'
        ? UserRole.SHOP_OWNER
        : UserRole.CONSUMER
    );
  }, [location.state]);

  useEffect(() => {
    if (role === UserRole.SHOP_OWNER) {
      const fetchProvinces = async () => {
        try {
          const apiProvinces = await mockApi.core.getProvinces();
          setProvinces(
            apiProvinces.map((p) => ({ id: String(p.id), name: p.name }))
          );
          if (apiProvinces.length > 0 && !formData.province) {
            setFormData((prev) => ({
              ...prev,
              province: String(apiProvinces[0].id),
            }));
          }
        } catch (err) {
          console.error('Failed to fetch provinces:', err);
          setError('Could not load provinces. Please try again later.');
        }
      };
      fetchProvinces();
    }
  }, [role, formData.province]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (fieldErrors[id]) {
      setFieldErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (error) setError('');
  };

  const handlePlaceSelect = (address: string, lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, address, latitude: lat, longitude: lng }));
    if (fieldErrors.address) {
      setFieldErrors((prev) => ({ ...prev, address: '' }));
    }
  };

  const validatePassword = (pwd: string): string => {
    if (pwd.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(pwd))
      return 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(pwd))
      return 'Password must include at least one lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must include at least one digit.';
    return '';
  };

  // Phone number now REQUIRED + must be SA format
  const validatePhoneNumber = (phone: string): string => {
    if (!phone.trim()) {
      return 'Phone number is required.';
    }
    const saPhoneRegex = /^0[0-9]{9}$/;
    if (!saPhoneRegex.test(phone.trim())) {
      return 'Please enter a valid South African phone number.';
    }
    return '';
  };

  // ✅ Handle Google Sign Up Button Click (if user clicks "Sign up with Google" directly on register page)
  const handleGoogleSuccess = async (credentialResponse: any) => {
    const token = credentialResponse.credential;
    try {
      const result = await loginWithGoogle(token);
      if (result.status === 'LOGIN_SUCCESS') {
        // Account exists, just login
        window.location.href = '/dashboard'; 
      } else {
        // Account doesn't exist, pre-fill form
        const data = result.data;
        setFormData(prev => ({
            ...prev,
            firstName: data.first_name,
            lastName: data.last_name,
            email: data.email
        }));
        setGoogleToken(token);
        setError("Please complete your profile to finish registration.");
      }
    } catch(e) {
      setError("Google sign up failed.");
    }
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});

    const newFieldErrors: { [key: string]: string } = {};

    // Required fields for ALL users
    if (!formData.firstName.trim()) {
      newFieldErrors.firstName = 'First name is required.';
    }
    if (!formData.lastName.trim()) {
      newFieldErrors.lastName = 'Last name is required.';
    }
    if (!formData.email.trim()) {
      newFieldErrors.email = 'Email address is required.';
    }
    if (!formData.phone.trim()) {
      newFieldErrors.phone = 'Phone number is required.';
    }
    if (!formData.password.trim()) {
      newFieldErrors.password = 'Password is required.';
    }
    if (!formData.confirmPassword.trim()) {
      newFieldErrors.confirmPassword = 'Please confirm your password.';
    }

    // Shop owner-specific required fields
    if (role === UserRole.SHOP_OWNER) {
      if (!formData.shopName.trim()) {
        newFieldErrors.shopName = 'Shop name is required.';
      }
      if (!formData.address.trim()) {
        newFieldErrors.address = 'Shop address is required.';
      }
      if (!formData.province) {
        newFieldErrors.province = 'Province is required.';
      }
    }

    // Phone format
    const phoneError = validatePhoneNumber(formData.phone);
    if (phoneError) {
      newFieldErrors.phone = phoneError;
    }

    // Password complexity
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newFieldErrors.password = passwordError;
    }

    // Password match
    if (
      formData.password.trim() &&
      formData.confirmPassword.trim() &&
      formData.password !== formData.confirmPassword
    ) {
      newFieldErrors.confirmPassword = 'Passwords do not match.';
    }

    // Accept terms
    if (!acceptTerms) {
      setError(
        'Please accept the Privacy Policy and data collection terms to continue.'
      );
    }

    // If any local errors, stop here
    if (Object.keys(newFieldErrors).length > 0 || !acceptTerms) {
      setFieldErrors(newFieldErrors);
      if (!error) {
        // Only set a generic error if one isn't already set for terms
        setError((prev) =>
          prev ||
          'Please correct the highlighted fields and try again.'
        );
      }
      return;
    }

    setLoading(true);
    try {
      const apiRole: 'CONSUMER' | 'OWNER' =
        role === UserRole.SHOP_OWNER ? 'OWNER' : 'CONSUMER';

      const payload: any = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone: formData.phone.trim(),
        role: apiRole,
        // ✅ Attach Google Token if present
        google_token: googleToken || undefined
      };

      if (apiRole === 'OWNER') {
        payload.shop_name = formData.shopName.trim();
        payload.address = formData.address.trim();
        payload.province = formData.province;
        payload.latitude = formData.latitude;
        payload.longitude = formData.longitude;
      }

      await mockApi.auth.register(payload);
      if (googleToken) {
          // Log them in automatically or redirect to login?
          // Since mockApi.auth.register doesn't return tokens, we redirect to login
          // But actually, for UX, maybe just tell them to login.
          // OR: You can call login immediately here.
          setRegistrationSuccess(true); 
      } else {
          setRegistrationSuccess(true);
      }
    } catch (err: any) {
      setError(formatRegisterError(err));
    } finally {
      setLoading(false);
    }
  };

  const allRequiredConsumerFilled =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.phone.trim() &&
    formData.password.trim() &&
    formData.confirmPassword.trim();

  const allRequiredOwnerFilled =
    allRequiredConsumerFilled &&
    formData.shopName.trim() &&
    formData.address.trim() &&
    formData.province;

  const canSubmit =
    !loading &&
    acceptTerms &&
    (role === UserRole.SHOP_OWNER
      ? allRequiredOwnerFilled
      : allRequiredConsumerFilled);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-primary dark:text-primary">
            Spazaafy
          </h1>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>
        <Card>
          {registrationSuccess ? (
            <div className="text-center p-4">
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                {googleToken ? 'Account Created!' : 'Registration Successful!'}
              </h3>
              <p className="mt-2 text-gray-700 dark:text-gray-300">
                {googleToken 
                  ? "Your account has been verified via Google. You can now log in."
                  : "Please check your email to find a verification link to activate your account."
                }
              </p>
              <p className="mt-4">
                <Link
                  to="/login"
                  className="font-medium text-primary hover:text-primary-dark dark:hover:text-primary-light"
                >
                  &larr; Back to Login
                </Link>
              </p>
            </div>
          ) : (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  I am a:
                </label>
                <div className="flex rounded-md shadow-sm">
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.CONSUMER)}
                    className={`px-4 py-2 border border-gray-300 dark:border-dark-surface text-sm font-medium rounded-l-md w-1/2 ${
                      role === UserRole.CONSUMER
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Consumer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole(UserRole.SHOP_OWNER)}
                    className={`-ml-px px-4 py-2 border border-gray-300 dark:border-dark-surface text-sm font-medium rounded-r-md w-1/2 ${
                      role === UserRole.SHOP_OWNER
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white dark:bg-dark-surface text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    Shop Owner
                  </button>
                </div>
              </div>

              {/* ✅ Google Auth Section (Only if not already authenticated via Google) */}
              {!googleToken && (
                <div className="mt-6 w-full">
                   <div className="flex justify-center w-full">
                       <GoogleLogin 
                          onSuccess={handleGoogleSuccess}
                          onError={() => setError('Google sign up failed.')}
                          text="signup_with"
                          
                       />
                   </div>
                   <div className="relative mt-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-dark-border" />
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-dark-surface text-gray-500">Or register with email</span>
                      </div>
                   </div>
                </div>
              )}

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="firstName"
                  label="First name"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={fieldErrors.firstName}
                  required
                />
                <Input
                  id="lastName"
                  label="Last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={fieldErrors.lastName}
                  required
                />
              </div>

              {/* Email - ReadOnly if Google Token exists */}
              <Input
                id="email"
                type="email"
                label="Email address"
                value={formData.email}
                onChange={handleChange}
                error={fieldErrors.email}
                required
                readOnly={!!googleToken}
                className={googleToken ? "bg-gray-100 dark:bg-dark-surface cursor-not-allowed opacity-70" : ""}
              />

              <Input
                id="phone"
                type="tel"
                label="Phone"
                value={formData.phone}
                onChange={handleChange}
                error={fieldErrors.phone}
                required
              />

              {/* Passwords - Still required */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="password"
                  type="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleChange}
                  error={fieldErrors.password}
                  required
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  label="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={fieldErrors.confirmPassword}
                  required
                />
              </div>

              {/* Shop Owner Fields */}
              {role === UserRole.SHOP_OWNER && (
                <>
                  <Input
                    id="shopName"
                    label="Shop name"
                    value={formData.shopName}
                    onChange={handleChange}
                    error={fieldErrors.shopName}
                    required
                  />
                  <AddressAutocompleteInput
                    id="address"
                    label="Shop address"
                    value={formData.address}
                    required
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, address: value }))
                    }
                    onPlaceSelect={handlePlaceSelect}
                    error={fieldErrors.address}
                  />
                  <div>
                    <label
                      htmlFor="province"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Province
                    </label>
                    <select
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                      className={`mt-1 block w-full pl-3 pr-10 py-2 text-base rounded-md shadow-sm bg-white dark:bg-dark-input text-gray-900 dark:text-white border-gray-300 dark:border-dark-surface focus:outline-none focus:ring-dark-border focus:border-dark-border sm:text-sm ${
                        fieldErrors.province ? 'border-red-500' : ''
                      }`}
                    >
                      {provinces.length === 0 ? (
                        <option value="" disabled>
                          Loading provinces...
                        </option>
                      ) : (
                        <>
                          <option value="">Select a province</option>
                          {provinces.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    {fieldErrors.province && (
                      <p className="mt-1 text-xs text-red-500">
                        {fieldErrors.province}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* TERMS & PRIVACY CHECKBOX */}
              <div className="flex items-start space-x-3">
                <button
                  type="button"
                  onClick={() => setAcceptTerms((prev) => !prev)}
                  className={`mt-1 flex h-5 w-5 items-center justify-center rounded border text-xs ${
                    acceptTerms
                      ? 'bg-primary border-primary text-white'
                      : 'bg-white border-dark-border dark:bg-dark-input dark:border-dark-border'
                  }`}
                  aria-pressed={acceptTerms}
                >
                  {acceptTerms && <span className="leading-none">✓</span>}
                </button>
                <p className="text-xs text-gray-700 dark:text-gray-300">
                  I agree to allow Spazaafy to collect my data and use my
                  location for service verification. Read our{' '}
                  <Link
                    to="/privacy-policy"
                    className="font-semibold text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy &amp; Data Collection
                  </Link>
                  .
                </p>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200 whitespace-pre-line">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={!canSubmit}
                className="w-full"
              >
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          )}
        </Card>
        {!registrationSuccess && (
          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;