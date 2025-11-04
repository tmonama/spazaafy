// src/pages/TicketDetailPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Ticket, ChatMessage } from '../types';
import mockApi from '../api/mockApi';
import { useAuth } from '../hooks/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';
import Header from '../components/Header';
import { Paperclip, XCircle } from 'lucide-react';

const ChatInput: React.FC<{
  onSendMessage: (content: string, attachment: File | null) => void;
  isSending: boolean;
}> = ({ onSendMessage, isSending }) => {
  const [content, setContent] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !attachment) return;
    onSendMessage(content, attachment);
    setContent('');
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) setAttachment(e.target.files[0]);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-dark-border">
      <div className="flex items-start space-x-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 border rounded-md flex-1 bg-white dark:bg-dark-input border-gray-300 dark:border-dark-surface focus:border-dark-border focus:ring-dark-border"
          rows={2}
          disabled={isSending}
        />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
            <Paperclip size={20} />
        </Button>
        <Button type="submit" disabled={isSending || (!content.trim() && !attachment)}>
          {isSending ? 'Sending...' : 'Send'}
        </Button>
      </div>
      {attachment && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-dark-surface/50 rounded-md flex justify-between items-center text-sm">
            <span className="truncate pr-2">Selected file: {attachment.name}</span>
            <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 hover:text-red-700 flex-shrink-0">
                <XCircle size={18} />
            </button>
        </div>
      )}
    </form>
  );
};

const MessageBubble: React.FC<{ message: ChatMessage; isFromCurrentUser: boolean; }> = ({ message, isFromCurrentUser }) => {
    const apiBaseUrl = (import.meta as any).env.VITE_API_BASE || 'http://localhost:8000';
    return (
        <div className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${
                isFromCurrentUser ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900'
            }`}>
                {message.content && <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>}
                {message.attachment && (
                    <a 
                        href={`${apiBaseUrl.replace('/api', '')}${message.attachment.url}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-2 flex items-center gap-2 p-2 bg-black bg-opacity-20 rounded-lg hover:bg-opacity-30"
                    >
                        <Paperclip size={16} />
                        <span className="text-sm font-medium underline truncate">{message.attachment.name}</span>
                    </a>
                )}
                <p className="text-xs opacity-70 mt-1 text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    );
};

const TicketDetailPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { user } = useAuth();
    
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSending, setIsSending] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchTicketData = async (isInitialLoad = false) => {
        if (!ticketId) return;
        if (isInitialLoad) setLoading(true);
        try {
            const [ticketData, messagesData] = await Promise.all([
                mockApi.tickets.getById(ticketId),
                mockApi.tickets.listMessages(ticketId),
            ]);
            setTicket(ticketData);
            setMessages(messagesData);
        } catch (err) {
            console.error("Failed to fetch ticket data:", err);
            setError("Could not load ticket data.");
        } finally {
            if (isInitialLoad) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicketData(true);
    }, [ticketId]);

    useEffect(() => {
        if (!ticketId || ticket?.status !== 'OPEN') {
            return;
        }
        const intervalId = setInterval(async () => {
            const messagesData = await mockApi.tickets.listMessages(ticketId);
            setMessages(messagesData);
        }, 5000);
        return () => clearInterval(intervalId);
    }, [ticketId, ticket?.status]);

    const handleSendMessage = async (content: string, attachment: File | null) => {
        if (!ticketId || !user) return;
        setIsSending(true);
        try {
            await mockApi.tickets.postMessage(ticketId, { content, attachment });
            await fetchTicketData();
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send message. Please try again.");
        } finally {
            setIsSending(false);
        }
    };
    
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <Header />
                <main className="container mx-auto p-4"><p>Loading ticket...</p></main>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
                <Header />
                <main className="container mx-auto p-4"><p className="text-red-500">{error || "Ticket not found."}</p></main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg">
            <Header />
            <main className="py-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <div className="mb-4">
                        <Link to="/support" className="text-primary dark:text-primary-light hover:underline">
                            &larr; Back to all tickets
                        </Link>
                    </div>
                    <Card>
                        <div className="p-4 border-b border-gray-200 dark:border-dark-border">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.title}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Opened on {new Date(ticket.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 h-[30rem] overflow-y-auto space-y-4 bg-gray-50 dark:bg-dark-surface/50">
                            {messages.map(message => {
                                const isFromCurrentUser = message.senderId === user?.id;
                                return <MessageBubble key={message.id} message={message} isFromCurrentUser={isFromCurrentUser} />;
                            })}
                            <div ref={messagesEndRef} />
                        </div>
                        {ticket.status === 'OPEN' ? (
                            <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-dark-surface/50">
                                This ticket has been closed and you can no longer reply.
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default TicketDetailPage;