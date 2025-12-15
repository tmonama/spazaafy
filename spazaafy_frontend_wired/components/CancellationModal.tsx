// src/components/CancellationModal.tsx

import React, { useState } from 'react';
import Button from './Button';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  count: number;
}

const CancellationModal: React.FC<CancellationModalProps> = ({ isOpen, onClose, onConfirm, count }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(reason);
      onClose();
      setReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          Cancel {count} Request{count > 1 ? 's' : ''}?
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          This will notify the shop owner(s) that their request has been cancelled. Please provide a reason.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Cancellation</label>
            <textarea 
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="e.g. Duplicate request, Incorrect documents..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="neutral" type="button" onClick={onClose} disabled={isSubmitting}>
              Back
            </Button>
            <Button variant="danger" type="submit" isLoading={isSubmitting}>
              Confirm Cancellation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancellationModal;