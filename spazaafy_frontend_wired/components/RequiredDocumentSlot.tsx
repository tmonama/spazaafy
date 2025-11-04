import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';

interface RequiredDocumentSlotProps {
    documentName: string;
    onUpload: (documentName: string, file: File) => Promise<void>;
}

const RequiredDocumentSlot: React.FC<RequiredDocumentSlotProps> = ({ documentName, onUpload }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(''); // Clear previous errors
        const selectedFile = e.target.files?.[0];

        if (selectedFile) {
            // ✅ 1. VALIDATION: Check if the selected file is a PDF.
            if (selectedFile.type !== 'application/pdf') {
                setError(t('shopOwnerDashboard.alerts.pdfOnlyError'));
                setFile(null);
                // Clear the file input so the user can try again
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            // If valid, set the file in state.
            setFile(selectedFile);
        }
    };

    const handleUploadClick = async () => {
        if (!file) return;
        
        setIsUploading(true);
        setError('');
        try {
            await onUpload(documentName, file);
            // Reset state after a successful upload
            setFile(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (e: any) {
            setError(e.message || t('shopOwnerDashboard.alerts.uploadFailed'));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{documentName}</p>
                    <p className="text-xs text-red-500 dark:text-red-400">{t('shopOwnerDashboard.uploadNotices.notSubmitted', 'Not Submitted')}</p>
                </div>
                <div className="flex w-full sm:w-auto items-center space-x-2">
                     <input
                        id={`file-upload-${documentName.replace(/\s+/g, '-')}`}
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        // ✅ 2. BROWSER FILTER: Only allow PDF files to be selected.
                        accept="application/pdf"
                        disabled={isUploading}
                        className="text-sm text-gray-500 dark:text-gray-400 w-full file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light/20 file:text-primary dark:file:bg-primary-dark/30 dark:file:text-primary-light hover:file:bg-primary-light/30 cursor-pointer"
                     />
                    <Button 
                        onClick={handleUploadClick} 
                        size="sm" 
                        disabled={!file || isUploading}
                    >
                        {isUploading ? t('shopOwnerDashboard.uploadingButton') : t('shopOwnerDashboard.uploadButton')}
                    </Button>
                </div>
            </div>
            {/* Display validation or upload errors */}
            {error && <p className="text-red-500 text-sm mt-2 text-center sm:text-left">{error}</p>}
        </div>
    );
};

export default RequiredDocumentSlot;