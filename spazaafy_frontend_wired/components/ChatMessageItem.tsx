import React from 'react';
import { ChatMessage, User } from '../types';

interface ChatMessageItemProps {
    message: ChatMessage;
    sender: User;
    isFromAdmin: boolean;
}

const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, sender, isFromAdmin }) => {

    const alignment = isFromAdmin ? 'justify-end' : 'justify-start';
    const bubbleColor = isFromAdmin ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white';
    const bubbleRadius = isFromAdmin ? 'rounded-l-lg rounded-br-lg' : 'rounded-r-lg rounded-bl-lg';

    return (
        <div className={`flex items-end gap-2 ${alignment}`}>
            {!isFromAdmin && (
                 <div className="flex-shrink-0 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {sender.firstName.charAt(0)}{sender.lastName.charAt(0)}
                </div>
            )}
            <div className={`max-w-md md:max-w-lg`}>
                <div className={`px-4 py-3 ${bubbleColor} ${bubbleRadius}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.attachment && (
                        <a href={message.attachment.url} target="_blank" rel="noopener noreferrer" className={`mt-2 flex items-center gap-2 p-2 rounded-md ${isFromAdmin ? 'bg-primary-dark/80' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs font-medium truncate">{message.attachment.name}</span>
                        </a>
                    )}
                </div>
                <p className={`text-xs text-gray-400 mt-1 px-1 ${isFromAdmin ? 'text-right' : 'text-left'}`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                </p>
            </div>
             {isFromAdmin && (
                 <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AD
                </div>
            )}
        </div>
    );
};

export default ChatMessageItem;