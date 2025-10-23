import React, { useState, useMemo } from 'react';
import { ShopDocument, DocumentStatus } from '../../types';
import { MOCK_DB } from '../../data/mockData';
import DocumentReviewItem from '../../components/DocumentReviewItem';
import Card from '../../components/Card';

type FilterStatus = DocumentStatus | 'All';

const DocumentVerificationPage: React.FC = () => {
    const [documents, setDocuments] = useState<ShopDocument[]>(MOCK_DB.documents.findAll());
    // FIX: Used DocumentStatus enum member for type safety.
    const [filter, setFilter] = useState<FilterStatus>(DocumentStatus.PENDING);

    const handleUpdateStatus = (docId: string, status: DocumentStatus) => {
        MOCK_DB.documents.updateStatus(docId, status);
        
        // If the new status is 'Verified', check if the shop can be fully verified
        if (status === DocumentStatus.VERIFIED) {
            const doc = documents.find(d => d.id === docId);
            if(doc) {
                const shopDocs = MOCK_DB.documents.findByShopOwnerId(doc.shopOwnerId);
                const allDocsVerified = shopDocs.every(d => d.status === DocumentStatus.VERIFIED);
                if (allDocsVerified) {
                    // In a real app, you might also check for a successful site visit
                    MOCK_DB.shops.updateVerificationStatus(doc.shopOwnerId, true);
                }
            }
        } else {
             const doc = documents.find(d => d.id === docId);
             if(doc) {
                 MOCK_DB.shops.updateVerificationStatus(doc.shopOwnerId, false);
             }
        }
        
        setDocuments(MOCK_DB.documents.findAll());
    };

    const filteredDocuments = useMemo(() => {
        if (filter === 'All') {
            return documents;
        }
        return documents.filter(doc => doc.status === filter);
    }, [documents, filter]);

    // FIX: Used DocumentStatus enum members instead of string literals for type safety.
    const filterOptions: FilterStatus[] = [DocumentStatus.PENDING, DocumentStatus.VERIFIED, DocumentStatus.REJECTED, 'All'];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Document Verification</h1>
            
            <Card>
                 <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
                    {filterOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => setFilter(option)}
                            className={`px-3 py-1 text-sm rounded-full font-semibold ${
                                filter === option 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                
                <div className="space-y-4 p-4">
                    {filteredDocuments.length > 0 ? (
                        filteredDocuments.map(doc => (
                            <DocumentReviewItem
                                key={doc.id}
                                document={doc}
                                onApprove={() => handleUpdateStatus(doc.id, DocumentStatus.VERIFIED)}
                                onReject={() => handleUpdateStatus(doc.id, DocumentStatus.REJECTED)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No documents match the current filter.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default DocumentVerificationPage;