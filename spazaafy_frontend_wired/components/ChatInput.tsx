import React, { useState, useRef } from 'react';
import Button from './Button';

interface ChatInputProps {
    onSendMessage: (content: string, attachment?: File) => void;
    isSending: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isSending }) => {
    const [content, setContent] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (!content.trim() && !attachment) return;
        onSendMessage(content, attachment || undefined);
        setContent('');
        setAttachment(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current?.click();
    }

    const removeAttachment = () => {
        setAttachment(null);
         if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
            {attachment && (
                <div className="mb-2 px-3 py-2 bg-gray-200 dark:bg-gray-600 rounded-md text-sm flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-200 truncate">
                        Attached: <span className="font-semibold">{attachment.name}</span>
                    </span>
                    <button onClick={removeAttachment} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 ml-2">&times;</button>
                </div>
            )}
            <div className="flex items-start space-x-3">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type your message..."
                    rows={2}
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                />
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={handleAttachmentClick} className="p-2 text-gray-500 hover:text-primary dark:hover:text-primary-light transition-colors">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                <Button onClick={handleSend} isLoading={isSending} size="md">Send</Button>
            </div>
        </div>
    );
};

export default ChatInput;