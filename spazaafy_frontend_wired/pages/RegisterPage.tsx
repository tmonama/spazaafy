// pages/RegisterPage.tsx — FULL FILE (uses AuthContext.register and navigates)

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '../types';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import AddressAutocompleteInput from '../components/AddressAutocompleteInput';
import { useAuth } from '../hooks/useAuth';

const HOME = '/dashboard';

// Define a type for the province data you'll fetch from the API
interface Province {
  id: string;
  name: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const initialRole =
    location.state?.role === 'shop_owner' ? UserRole.SHOP_OWNER : UserRole.CONSUMER;

  const [role, setRole] = useState<UserRole>(initialRole);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    address: '',
    province: '', // This will now store the province ID
  });
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRole(location.state?.role === 'shop_owner' ? UserRole.SHOP_OWNER : UserRole.CONSUMER);
  }, [location.state]);

  // Fetch provinces when the role is set to SHOP_OWNER
  useEffect(() => {
    if (role === UserRole.SHOP_OWNER) {
      const fetchProvinces = async () => {
        try {
          // TODO: Replace this with a real API call to your backend
          // e.g., const data = await mockApi.utils.getProvinces();
          const mockProvinces: Province[] = [
            { id: '1', name: 'Gauteng' },
            { id: '2', name: 'KwaZulu-Natal' },
            { id: '3', name: 'Western Cape' },
            { id: '4', name: 'Eastern Cape' },
            { id: '5', name: 'Free State' },
            { id: '6', name: 'Limpopo' },
            { id: '7', name: 'Mpumalanga' },
            { id: '8', name: 'North West' },
            { id: '9', name: 'Northern Cape' },
          ];
          setProvinces(mockProvinces);
          // Optionally set a default value
          if (mockProvinces.length > 0 && !formData.province) {
            setFormData((prev) => ({ ...prev, province: mockProvinces[0].id }));
          }
        } catch (err) {
          console.error('Failed to fetch provinces:', err);
          setError('Could not load provinces. Please try again later.');
        }
      };
      fetchProvinces();
    }
  }, [role]); // This effect runs when `role` changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddressSelect = (address: string) => {
    setFormData((prev) => ({ ...prev, address }));
  };

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(pwd)) return 'Password must include at least one uppercase letter.';
    if (!/[a-z]/.test(pwd)) return 'Password must include at least one lowercase letter.';
    if (!/[0-9]/.test(pwd)) return 'Password must include at least one digit.';
    return '';
  };

  const handleSubmit = async () => {
    setError('');

    // --- UPDATED VALIDATION ---
    if (role === UserRole.SHOP_OWNER && (!formData.shopName.trim() || !formData.province)) {
      return setError('Shop name and province are required for shop owners.');
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) return setError(passwordError);

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      const apiRole: 'CONSUMER' | 'OWNER' =
        role === UserRole.SHOP_OWNER ? 'OWNER' : 'CONSUMER';

      const payload = {
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim() || undefined,
        last_name: formData.lastName.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        role: apiRole,
        shop_name: apiRole === 'OWNER' ? formData.shopName.trim() || undefined : undefined,
        address: apiRole === 'OWNER' ? formData.address.trim() || undefined : undefined,
        // Send the province ID to the backend
        province: apiRole === 'OWNER' ? formData.province || undefined : undefined,
      } as {
        email: string;
        password: string;
        first_name?: string;
        last_name?: string;
        phone?: string;
        role: 'CONSUMER' | 'OWNER' | 'ADMIN';
        shop_name?: string;
        address?: string;
        province?: string; // This will now be an ID string
      };

      await register(payload);
      navigate(HOME, { replace: true });
    } catch (err: any) {
      let msg = err?.message || 'Registration failed.';
      try {
        const parsed = JSON.parse(msg.split(':').pop() || '{}');
        msg =
          parsed?.detail ||
          parsed?.non_field_errors?.[0] ||
          (parsed && typeof parsed === 'object' ? (Object.values(parsed)?.[0] as any)?.[0] : undefined) ||
          msg;
      } catch { /* keep default */ }
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-center text-4xl font-extrabold text-primary dark:text-primary-light">
            Spazaafy
          </h1>
          <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
        </div>
        <Card>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                I am a:
              </label>
              <div className="flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setRole(UserRole.CONSUMER)}
                  className={`px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-l-md w-1/2 ${
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
                  className={`-ml-px px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-r-md w-1/2 ${
                    role === UserRole.SHOP_OWNER
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Shop Owner
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input id="firstName" label="First name" value={formData.firstName} onChange={handleChange} />
              <Input id="lastName" label="Last name" value={formData.lastName} onChange={handleChange} />
            </div>

            <Input id="email" type="email" label="Email address" value={formData.email} onChange={handleChange} required />
            <Input id="phone" type="tel" label="Phone (optional)" value={formData.phone} onChange={handleChange} />

            <div className="grid grid-cols-2 gap-3">
              <Input id="password" type="password" label="Password" value={formData.password} onChange={handleChange} required />
              <Input id="confirmPassword" type="password" label="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>

            {role === UserRole.SHOP_OWNER && (
              <>
                <Input id="shopName" label="Shop name" value={formData.shopName} onChange={handleChange} required />
                <AddressAutocompleteInput id="address" label="Shop address" value={formData.address} onSelect={handleAddressSelect} />
                
                {/* --- REPLACED TEXT INPUT WITH A DROPDOWN --- */}
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Province
                  </label>
                  <select
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {provinces.length === 0 ? (
                      <option value="" disabled>Loading provinces...</option>
                    ) : (
                      provinces.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
                {error}
              </div>
            )}

            <Button
              type="button"
              onClick={handleSubmit}
              // --- UPDATED DISABLED LOGIC ---
              disabled={
                loading ||
                !formData.email ||
                !formData.password ||
                (role === UserRole.SHOP_OWNER && (!formData.shopName.trim() || !formData.province))
              }
              className="w-full"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </Card>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;