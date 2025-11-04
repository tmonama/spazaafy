import React from 'react';
import { useTranslation } from 'react-i18next';
import { ShopDocument, DocumentStatus } from '../types';

interface DocumentUploadItemProps {
    document: ShopDocument;
    documentName: string;
}

const getStatusColor = (status: DocumentStatus): string => {
    switch (status) {
        case DocumentStatus.VERIFIED:
            return 'text-green-600 dark:text-green-400';
        case DocumentStatus.REJECTED:
            return 'text-red-600 dark:text-red-400';
        case DocumentStatus.PENDING:
        default:
            return 'text-yellow-600 dark:text-yellow-400';
    }
};

const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({ document, documentName }) => {
    const { t } = useTranslation();
    
    const statusColor = getStatusColor(document.status);
    const submittedDate = document.submittedAt ? new Date(document.submittedAt).toLocaleDateString() : 'N/A';
    const expiryDateString = document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : null;
    
    // Create dynamic keys for translation
    const docNameKey = `enums.docNames.${documentName}`;
    const statusKey = `enums.docStatuses.${document.status}`;

    return (
        <div className="flex justify-between items-center p-3 border rounded-md bg-gray-50 dark:bg-dark-surface border-gray-200 dark:border-dark-border">
            <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t(docNameKey, documentName)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {t('shopOwnerDashboard.documentDetails.submitted')}: {submittedDate}
                </p>
                
                {document.status === DocumentStatus.VERIFIED && expiryDateString && (
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {t('shopOwnerDashboard.documentDetails.expires')}: {expiryDateString}
                    </p>
                )}
            </div>
            <div className={`text-sm font-semibold ${statusColor}`}>
                {t('shopOwnerDashboard.documentDetails.status')}: {t(statusKey, document.status)}
            </div>
        </div>
    );
};

export default DocumentUploadItem;