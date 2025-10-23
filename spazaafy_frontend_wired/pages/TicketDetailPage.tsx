import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Ticket, ChatMessage, User } from '../types';
import { MOCK_DB } from '../data/mockData';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Header';
import Card from '../components/Card';
import ChatInput from '../components/ChatInput';
import ChatMessageItem from '../components/ChatMessageItem';
import Button from '../components/Button';

const TicketDetailPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { user: currentUser } = useAuth();
    
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [isSending, setIsSending] = useState(false);
    
    useEffect(() => {
        if (ticketId) {
            const foundTicket = MOCK_DB.tickets.findById(ticketId);
            setTicket(foundTicket || null);

            const ticketMessages = MOCK_DB.messages.findByTicketId(ticketId);
            setMessages(ticketMessages);

            if (foundTicket) {
                const ticketUser = MOCK_DB.users.findBy('id', foundTicket.userId);
                setUser(ticketUser || null);
            }

            const admin = MOCK_DB.users.findBy('id', 'admin-1');
            setAdminUser(admin || null);
        }
    }, [ticketId]);

    const handleSendMessage = (content: string, attachment?: File) => {
        if (!ticketId || !currentUser) return;

        setIsSending(true);
        setTimeout(() => {
            const newMessageData: Omit<ChatMessage, 'id' | 'createdAt'> = {
                ticketId,
                senderId: currentUser.id,
                content,
                ...(attachment && {
                    attachment: {
                        name: attachment.name,
                        type: attachment.type,
                        size: attachment.size,
                        url: URL.createObjectURL(attachment),
                    },
                }),
            };
            const createdMessage = MOCK_DB.messages.create(newMessageData);
            setMessages(prev => [...prev, createdMessage]);
            setIsSending(false);
        }, 500);
    };

    if (!ticket || !user || !adminUser) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
                <Header />
                <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <p>Loading ticket details...</p>
                </main>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
                 <div className="max-w-4xl mx-auto">
                    <div className="mb-4">
                        <Link to="/support" className="text-primary dark:text-primary-light hover:underline">
                            &larr; Back to all tickets
                        </Link>
                    </div>
                    <Card>
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                             <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{ticket.title}</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Submitted by {user.firstName} {user.lastName} on {new Date(ticket.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${ticket.status === 'Open' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                    {ticket.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-4 h-96 overflow-y-auto space-y-4 bg-white dark:bg-gray-800">
                            {messages.map(message => {
                                const isFromAdmin = message.senderId === adminUser.id;
                                const sender = isFromAdmin ? adminUser : user;
                                return (
                                    <ChatMessageItem
                                        key={message.id}
                                        message={message}
                                        sender={sender}
                                        isFromAdmin={isFromAdmin}
                                    />
                                );
                            })}
                        </div>
                        {ticket.status === 'Open' ? (
                            <ChatInput onSendMessage={handleSendMessage} isSending={isSending} />
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700">
                                This ticket is closed.
                            </div>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default TicketDetailPage;
