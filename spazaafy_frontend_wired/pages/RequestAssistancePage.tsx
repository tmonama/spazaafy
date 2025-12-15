// src/pages/RequestAssistancePage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import mockApi from '../api/mockApi';
import { UserRole } from '../types';

const ASSISTANCE_OPTIONS = [
  { value: 'CIPC_REGISTRATION', label: 'CIPC Registration' },
  { value: 'SARS_TAX_CLEARANCE', label: 'SARS Tax Clearance' },
  { value: 'HEALTH_CERTIFICATE', label: 'Health Certificate (COA)' },
  { value: 'TRADING_LICENSE', label: 'Trading License' },
  { value: 'ZONING_PERMIT', label: 'Zoning Permit' },
  { value: 'OTHER', label: 'Other' },
];

// ✅ Interface for success state
interface SuccessState {
  code: string;
}

const RequestAssistancePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assistanceType, setAssistanceType] = useState('');
  const [comments, setComments] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ New state to trigger the success view
  const [successData, setSuccessData] = useState<SuccessState | null>(null);

  // Redirect if not shop owner (safety check)
  if (user && user.role !== UserRole.SHOP_OWNER) {
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
            <Header />
            <div className="p-8 text-center text-gray-700 dark:text-gray-300">
                Access Restricted to Shop Owners.
            </div>
        </div>
      );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!assistanceType || !comments.trim() || !consent) {
      setError("All fields are compulsory. Please fill in all details and accept the consent.");
      return;
    }

    try {
      setLoading(true);
      
      // ✅ Capture the response to get the reference code
      const response = await mockApi.assistance.request({
        assistance_type: assistanceType,
        comments: comments,
        consent: consent
      });

      // ✅ Update state to show success screen instead of redirecting
      setSuccessData({ code: response.reference_code || "PENDING" });
      
    } catch (err: any) {
      console.error(err);
      setError("Failed to send request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ RENDER SUCCESS VIEW
  if (successData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-8 text-center">
            {/* Success Icon */}
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Request Received!</h2>
            
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              We have received your request. We have forwarded your details to our partners and they will contact you shortly.
            </p>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-xl mb-8">
              <p className="text-xs text-blue-600 dark:text-blue-300 uppercase font-bold tracking-wider mb-2">
                Your Reference Number
              </p>
              <p className="text-4xl font-mono font-bold text-blue-800 dark:text-blue-100 tracking-tight">
                {successData.code}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-3">
                Please quote this number if you contact support.
              </p>
            </div>

            <Button onClick={() => navigate('/dashboard')} className="w-full py-3 text-lg">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER FORM (Standard View) ---
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow-md p-6 sm:p-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
            Request Business Assistance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Need help getting compliant? Fill out the form below and we will connect you with our vetted partners to assist with your documentation.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Assistance Type Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                What document do you need help with? <span className="text-red-500">*</span>
              </label>
              <select
                value={assistanceType}
                onChange={(e) => setAssistanceType(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                required
              >
                <option value="">-- Select a document type --</option>
                {ASSISTANCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Comments Textbox */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Comments / More Info <span className="text-red-500">*</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={4}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
                placeholder="Please describe specifically what you need help with..."
                required
              />
            </div>

            {/* 3. Consent Checkbox */}
            <div className="flex items-start bg-gray-50 dark:bg-gray-800 p-4 rounded-md border border-gray-100 dark:border-gray-700">
              <div className="flex items-center h-5 mt-1">
                <input
                  id="consent"
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
                  required
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="consent" className="font-bold text-gray-700 dark:text-gray-300">
                  Consent to share profile <span className="text-red-500">*</span>
                </label>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  I agree to share my name, contact details, and shop information with Spazaafy partners so they can contact me to fulfill this service.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button type="submit" isLoading={loading} className="w-full">
                Submit Request
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestAssistancePage;