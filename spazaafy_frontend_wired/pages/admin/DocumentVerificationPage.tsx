import React, { useState, useEffect, useMemo } from 'react';
import { ShopDocument, DocumentStatus } from '../../types';
import mockApi from '../../api/mockApi';
import DocumentReviewItem from '../../components/DocumentReviewItem';
import Card from '../../components/Card';
import Button from '../../components/Button';

type FilterStatus = DocumentStatus | 'All';

const DocumentVerificationPage: React.FC = () => {
    const [documents, setDocuments] = useState<ShopDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>(DocumentStatus.PENDING);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const docs = await mockApi.documents.list();
            docs.sort((a, b) => new Date(b.submittedAt || 0).getTime() - new Date(a.submittedAt || 0).getTime());
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to fetch documents:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const handleUpdateStatus = async (docId: string, status: 'verify' | 'reject', expiryDate: string | null = null) => {
        const newStatus = status === 'verify' ? DocumentStatus.VERIFIED : DocumentStatus.REJECTED;

        setDocuments(currentDocs =>
            currentDocs.map(doc =>
                doc.id === docId ? { ...doc, status: newStatus, expiryDate: expiryDate || doc.expiryDate } : doc
            )
        );

        try {
            await mockApi.documents.updateStatus(docId, status, { 
                notes: `Admin action: ${status}`, 
                expiry_date: expiryDate 
            });
        } catch (error) {
            console.error(`Failed to ${status} document:`, error);
            alert(`Could not update the document status.`);
            fetchDocuments(); // Revert on failure
        }
    };

    const filteredDocuments = useMemo(() => {
        if (filter === 'All') return documents;
        return documents.filter(doc => doc.status === filter);
    }, [documents, filter]);

    const filterOptions: FilterStatus[] = [DocumentStatus.PENDING, DocumentStatus.VERIFIED, DocumentStatus.REJECTED, 'All'];

    if (loading) { return <p>Loading documents for verification...</p>; }

    const handleExport = async () => {
        try {
            await mockApi.documents.exportCsv();
        } catch (error) {
            console.error("Failed to export documents:", error);
            alert("Could not export documents.");
        }
    };

    return (
        <div>
            {/* ✅ FIX: Header stacks on small screens */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Document Verification</h1>
                <Button onClick={handleExport} className="w-full sm:w-auto">Export to CSV</Button>
            </div>
            
            <Card>
                 {/* ✅ FIX: Filter buttons wrap on small screens */}
                 <div className="flex flex-wrap items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Filter by status:</span>
                    {filterOptions.map(option => (
                        <button
                            key={option}
                            onClick={() => setFilter(option)}
                            className={`px-3 py-1 text-sm rounded-full font-semibold ${
                                filter === option 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                
                <div className="space-y-4 p-4">
                    {filteredDocuments.map(doc => (
                        <DocumentReviewItem
                            key={doc.id}
                            document={doc}
                            onApprove={(expiryDate) => handleUpdateStatus(doc.id, 'verify', expiryDate)}
                            onReject={() => handleUpdateStatus(doc.id, 'reject')}
                        />
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default DocumentVerificationPage;