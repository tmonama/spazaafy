import React, { useState } from 'react';
import Modal from './Modal'; 
import Button from './Button';
// We don't import Input here anymore because we use a native textarea

interface DocumentRejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    docName?: string;
}

const DocumentRejectionModal: React.FC<DocumentRejectionModalProps> = ({ isOpen, onClose, onConfirm, docName }) => {
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert("Please provide a reason for rejection.");
            return;
        }
        onConfirm(reason);
        setReason(''); 
    };

    return (
        // ✅ FIXED: Changed 'show' to 'isOpen' based on the TS error
        <Modal isOpen={isOpen} onClose={onClose} title="Reject Document">
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    You are about to reject <strong>{docName || 'this document'}</strong>.
                    Please provide a reason for the shop owner.
                </p>
                
                <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Reason for Rejection <span className="text-red-500">*</span>
                    </label>
                    {/* ✅ FIXED: Switched to native textarea to support 'rows' and fix type error */}
                    <textarea
                        className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Document is blurry, expired, or does not match shop details."
                        rows={4}
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                    <Button variant="neutral" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleSubmit}>
                        Confirm Rejection
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default DocumentRejectionModal;