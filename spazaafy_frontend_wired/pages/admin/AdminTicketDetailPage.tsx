// src/pages/admin/AdminTicketDetailPage.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Ticket, ChatMessage, User, TicketStatus, UserRole } from '../../types';
import mockApi from '../../api/mockApi';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { Paperclip, XCircle } from 'lucide-react';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
const PRIORITIES: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

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
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setAttachment(e.target.files[0]);
      }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex flex-wrap items-start gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your reply..."
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1 min-w-[100px]"
          rows={2}
          disabled={isSending}
        />
        <div className="flex w-full sm:w-auto sm:flex-col gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <Button variant="secondary" type="button" onClick={() => fileInputRef.current?.click()} disabled={isSending} className="w-full justify-center">
              <Paperclip size={20} />
          </Button>
          <Button type="submit" disabled={isSending || (!content.trim() && !attachment)} className="w-full justify-center">
            {isSending ? '...' : 'Send'}
          </Button>
        </div>
      </div>
      {attachment && (
        <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md flex justify-between items-center text-sm">
            <span className="truncate pr-2">Selected file: {attachment.name}</span>
            <button type="button" onClick={() => { setAttachment(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-red-500 hover:text-red-700 flex-shrink-0">
                <XCircle size={18} />
            </button>
        </div>
      )}
    </form>
  );
};

// --- FIX START: MessageBubble Component ---
const MessageBubble: React.FC<{ message: ChatMessage; isFromAdmin: boolean; }> = ({ message, isFromAdmin }) => {
    // 1. Determine Attachment URL and Name safely
    let attachmentUrl = "";
    let attachmentName = "Attachment";

    if (typeof message.attachment === 'string') {
        attachmentUrl = message.attachment;
    } else if (message.attachment && typeof message.attachment === 'object') {
        attachmentUrl = message.attachment.url;
        attachmentName = message.attachment.name || "Attachment";
    }

    // 2. Determine if it's an absolute URL (S3) or relative (Local)
    // S3 URLs start with http/https, so we use them directly.
    // Local uploads start with /media, so we prepend the API base.
    const finalUrl = attachmentUrl.startsWith('http') 
        ? attachmentUrl 
        : `${(import.meta as any).env.VITE_API_BASE?.replace('/api', '') || 'http://localhost:8000'}${attachmentUrl}`;

    return (
        <div className={`flex ${isFromAdmin ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-lg p-3 rounded-lg ${
                isFromAdmin ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}>
                {message.content && <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>}
                
                {attachmentUrl && (
                    <a 
                        href={finalUrl}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`mt-2 flex items-center gap-2 p-2 rounded-lg hover:bg-opacity-80 transition-colors ${
                            isFromAdmin 
                                ? 'bg-black bg-opacity-20 text-white' 
                                : 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-500'
                        }`}
                    >
                        <Paperclip size={16} />
                        <span className="text-sm font-medium underline truncate max-w-[150px]">{attachmentName}</span>
                    </a>
                )}
                
                <p className="text-xs opacity-70 mt-1 text-right">{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
        </div>
    );
};
// --- FIX END ---

const roleDisplay: Record<UserRole, string> = {
    [UserRole.CONSUMER]: 'Consumer',
    [UserRole.SHOP_OWNER]: 'Spaza Shop',
    [UserRole.ADMIN]: 'Admin',
};

const AdminTicketDetailPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { user: adminUser } = useAuth();
    
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [users, setUsers] = useState<User[]>([]);
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
            const [ticketData, messagesData, usersData] = await Promise.all([
                mockApi.tickets.getById(ticketId),
                mockApi.tickets.listMessages(ticketId),
                mockApi.users.getAll(),
            ]);
            setTicket(ticketData);
            setMessages(messagesData);
            setUsers(usersData);
        } catch (err) {
            console.error("Failed to fetch ticket data:", err);
            setError("Could not load ticket data. It may not exist.");
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
            console.log("Polling for new messages...");
            const messagesData = await mockApi.tickets.listMessages(ticketId);
            setMessages(messagesData);
        }, 5000);
        return () => clearInterval(intervalId);
    }, [ticketId, ticket?.status]);

    const userMap = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    
    const handleCloseTicket = async () => {
        if (!ticketId) return;
        if (window.confirm('Are you sure you want to close this ticket?')) {
            try {
                await mockApi.tickets.updateStatus(ticketId, TicketStatus.CLOSED);
                await fetchTicketData();
            } catch (err) {
                console.error("Failed to close ticket:", err);
                alert("Failed to close ticket. Please try again.");
            }
        }
    };

    const handlePriorityChange = async (newPriority: Priority) => {
        if (!ticketId || ticket?.priority === newPriority) return;
        const originalTicket = ticket;
        setTicket(prev => prev ? { ...prev, priority: newPriority } : null);
        try {
            await mockApi.tickets.updatePriority(ticketId, newPriority);
        } catch (err) {
            console.error("Failed to update priority:", err);
            alert("Failed to update priority. Please try again.");
            setTicket(originalTicket);
        }
    };
    
    const handleSendMessage = async (content: string, attachment: File | null) => {
        if (!ticketId) return;
        setIsSending(true);
        try {
            await mockApi.tickets.postMessage(ticketId, { content, attachment });
            await fetchTicketData();
        } catch (err) {
            console.error("Failed to send message:", err);
            alert("Failed to send reply. Please try again.");
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return <p>Loading ticket details...</p>;
    }

    if (error || !ticket) {
        return (
            <div>
                <p className="text-red-500">{error || "Ticket not found."}</p>
                <Link to="/admin/tickets" className="text-primary hover:underline mt-4 inline-block">&larr; Back to all tickets</Link>
            </div>
        );
    }
    
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-4">
                <Link to="/admin/tickets" className="text-primary dark:text-primary-light hover:underline">
                    &larr; Back to all tickets
                </Link>
            </div>
            <Card>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div className="space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.title}</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Submitted on {new Date(ticket.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-600 block max-w-xs">
                                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Submitted By:</p>
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{ticket.submitterName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.submitterEmail}</p>
                                {ticket.submitterRole && (
                                    <span className={`mt-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                                        ticket.submitterRole === UserRole.CONSUMER ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                    }`}>
                                        {ticket.submitterRole === UserRole.SHOP_OWNER 
                                            ? (ticket.shopName || 'Spaza Shop')
                                            : roleDisplay[ticket.submitterRole]
                                        }
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center flex-wrap gap-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
                                {PRIORITIES.map(p => (
                                    <button
                                        key={p}
                                        onClick={() => handlePriorityChange(p)}
                                        className={`px-3 py-1 text-xs font-bold rounded-full transition-transform transform hover:scale-105 ${
                                            ticket.priority === p
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0 w-full sm:w-auto">
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                {ticket.status}
                            </span>
                             {ticket.status === 'OPEN' && (
                                <Button onClick={handleCloseTicket} variant="danger" size="sm" className="flex-grow sm:flex-grow-0 justify-center">Close Ticket</Button>
                             )}
                        </div>
                    </div>
                </div>
                
                <div className="p-4 h-[30rem] overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800">
                    {messages.map(message => {
                        const sender = userMap.get(message.senderId);
                        const isFromAdmin = sender?.role === 'admin';
                        return <MessageBubble key={message.id} message={message} isFromAdmin={isFromAdmin} />;
                    })}
                    <div ref={messagesEndRef} />
                </div>
                
                {ticket.status === 'OPEN' ? (
                    <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
                ) : (
                    <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
                        This ticket has been closed.
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminTicketDetailPage;