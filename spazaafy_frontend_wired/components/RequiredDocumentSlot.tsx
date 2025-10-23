import React, { useState, useRef } from 'react';
import Button from './Button';

interface RequiredDocumentSlotProps {
    documentName: string;
    onUpload: (documentName: string, file: File) => void;
}

const RequiredDocumentSlot: React.FC<RequiredDocumentSlotProps> = ({ documentName, onUpload }) => {
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUploadClick = () => {
        if (file) {
            onUpload(documentName, file);
            // Reset after upload
            setFile(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">{documentName}</p>
                <p className="text-xs text-red-500 dark:text-red-400">Not Submitted</p>
            </div>
            <div className="flex items-center space-x-2">
                 <input
                    id={`file-upload-${documentName.replace(/\s+/g, '-')}`}
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="text-sm text-gray-500 w-48 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-light/20 file:text-primary hover:file:bg-primary-light/30 cursor-pointer"
                 />
                <Button onClick={handleUploadClick} size="sm" disabled={!file}>Upload</Button>
            </div>
        </div>
    );
};

export default RequiredDocumentSlot;
