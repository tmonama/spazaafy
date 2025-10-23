import React from 'react';
import { ShopDocument, DocumentStatus } from '../types';

interface DocumentUploadItemProps {
    document: ShopDocument;
}

const statusColors: Record<DocumentStatus, string> = {
    [DocumentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [DocumentStatus.VERIFIED]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [DocumentStatus.REJECTED]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};


const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({ document }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4">
            <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{document.name}</p>
                <div className="flex items-center mt-1">
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">Submitted</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 ml-2">({new Date(document.submittedAt).toLocaleDateString()})</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-600 dark:text-gray-300">Status:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[document.status]}`}>
                    {document.status}
                </span>
            </div>
        </div>
    );
};

export default DocumentUploadItem;