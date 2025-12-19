import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShopDocument, DocumentStatus } from '../types';
import Button from './Button';
import Input from './Input';

interface DocumentReviewItemProps {
    document: ShopDocument;
    onApprove: (expiryDate: string | null) => void;
    onReject: () => void;
}

const statusColors: Record<DocumentStatus, string> = {
    [DocumentStatus.PENDING]: 'border-yellow-500',
    [DocumentStatus.VERIFIED]: 'border-green-500',
    [DocumentStatus.REJECTED]: 'border-red-500',
};

const DocumentReviewItem: React.FC<DocumentReviewItemProps> = ({ document, onApprove, onReject }) => {
    
    const [expiryDate, setExpiryDate] = useState('');
    const fullFileUrl = document.fileUrl || '#';

    // ✅ NEW: Generate Google Maps URL
    const mapsUrl = (document.uploadLat && document.uploadLng) 
        ? `https://www.google.com/maps/search/?api=1&query=${document.uploadLat},${document.uploadLng}`
        : null;

    return (
        <div className={`p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border-l-4 ${statusColors[document.status]}`}>
            <div className="flex flex-col sm:flex-row sm:justify-between">
                <div>
                    <p className="font-bold text-lg text-gray-900 dark:text-white">{document.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        From: <Link to={`/admin/shops/${document.shopOwnerId}`} className="font-medium text-primary hover:underline ml-1">{document.shopName}</Link>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Submitted: {document.submittedAt ? new Date(document.submittedAt).toLocaleString() : 'N/A'}
                    </p>

                    {/* ✅ NEW: Location Link */}
                    {mapsUrl && (
                        <div className="mt-1">
                            <a 
                                href={mapsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 hover:underline"
                            >
                                <span className="mr-1">📍</span>
                                View Upload Location
                                {document.uploadAccuracy && (
                                    <span className="text-gray-500 dark:text-gray-400 ml-1">
                                        (±{Math.round(document.uploadAccuracy)}m)
                                    </span>
                                )}
                            </a>
                        </div>
                    )}

                    {document.status === DocumentStatus.VERIFIED && document.expiryDate && (
                        <p className="text-xs text-red-500 dark:text-red-400 font-semibold mt-1">
                            Expires: {new Date(document.expiryDate).toLocaleDateString()}
                        </p>
                    )}
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    <a href={fullFileUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="neutral" disabled={!document.fileUrl}>View Document</Button>
                    </a>
                    {document.status === DocumentStatus.PENDING ? (
                        <div className="flex items-end space-x-2">
                            <Input 
                                type="date"
                                id={`expiry-date-${document.id}`}
                                label="Expiry Date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="py-1 text-sm w-40"
                            />
                            <Button onClick={() => onApprove(expiryDate || null)} size="sm" variant="primary">Approve</Button>
                            <Button onClick={onReject} size="sm" variant="danger">Reject</Button>
                        </div>
                    ) : (
                         <div className="text-right">
                           <p className="font-semibold text-gray-700 dark:text-gray-300">Status:</p>
                           <p className={`font-bold ${document.status === DocumentStatus.VERIFIED ? 'text-green-500' : 'text-red-500'}`}>{document.status}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentReviewItem;