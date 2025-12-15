// src/components/ReferralModal.tsx

import React, { useState } from 'react';
import Button from './Button';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (partnerName: string, partnerEmail: string) => Promise<void>;
  count: number; // How many requests are being referred?
}

const ReferralModal: React.FC<ReferralModalProps> = ({ isOpen, onClose, onConfirm, count }) => {
  const [partnerName, setPartnerName] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName || !partnerEmail) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(partnerName, partnerEmail);
      onClose(); // Close on success
      setPartnerName('');
      setPartnerEmail('');
    } catch (err) {
      console.error(err);
      // Parent component handles error alerting usually
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Refer {count} Request{count > 1 ? 's' : ''}
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Enter the details of the service partner you are referring these leads to. 
          An email will be sent to them with the lead details.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Partner Company Name</label>
            <input 
              type="text" 
              required
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g. LegalZoom SA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Partner Email</label>
            <input 
              type="email" 
              required
              value={partnerEmail}
              onChange={(e) => setPartnerEmail(e.target.value)}
              className="mt-1 w-full rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="referrals@partner.com"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="neutral" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Send Referral
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReferralModal;