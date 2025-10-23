import React from 'react';
import { Link } from 'react-router-dom';
import { ShopDocument, DocumentStatus } from '../types';
import Button from './Button';

interface DocumentReviewItemProps {
    document: ShopDocument;
    onApprove: () => void;
    onReject: () => void;
}

const statusColors: Record<DocumentStatus, string> = {
    [DocumentStatus.PENDING]: 'border-yellow-500',
    [DocumentStatus.VERIFIED]: 'border-green-500',
    [DocumentStatus.REJECTED]: 'border-red-500',
};

const DocumentReviewItem: React.FC<DocumentReviewItemProps> = ({ document, onApprove, onReject }) => {
    
    const handleViewDocument = () => {
        if (document.file) {
            const url = URL.createObjectURL(document.file);
            window.open(url, '_blank');
        } else {
            alert('No file available for viewing.');
        }
    };

    return (
        <div className={`p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border-l-4 ${statusColors[document.status]}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between">
                <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{document.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        From: 
                        <Link to={`/admin/shops/${document.shopOwnerId}`} className="font-medium text-primary dark:text-primary-light hover:underline ml-1">
                            {document.shopName}
                        </Link>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Submitted: {new Date(document.submittedAt).toLocaleString()}
                    </p>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <Button 
                        onClick={handleViewDocument} 
                        size="sm" 
                        variant="neutral"
                        disabled={!document.file}
                    >
                        View Document
                    </Button>
                    {document.status === DocumentStatus.PENDING ? (
                        <>
                            <Button onClick={onApprove} size="sm" variant="primary">Approve</Button>
                            <Button onClick={onReject} size="sm" variant="danger">Reject</Button>
                        </>
                    ) : (
                        <div className="text-right">
                           <p className="font-semibold text-gray-700 dark:text-gray-300">Status:</p>
                           <p className={`font-bold ${
                               document.status === DocumentStatus.VERIFIED ? 'text-green-500' : 'text-red-500'
                           }`}>{document.status}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentReviewItem;