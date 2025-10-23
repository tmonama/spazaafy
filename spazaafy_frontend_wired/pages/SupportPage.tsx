import React, { useState } from 'react';
import { SupportTicket } from '../types';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

// FIX: Added missing 'userId' property to initial ticket objects to match the SupportTicket type.
const initialTickets: SupportTicket[] = [
    { id: 't-1', userId: 'user-1', title: 'Login Issue', description: 'Cannot reset my password.', status: 'Closed', createdAt: new Date(Date.now() - 5*24*60*60*1000).toISOString() },
    { id: 't-2', userId: 'user-2', title: 'Document Upload Failed', description: 'My COA document fails to upload.', status: 'Open', createdAt: new Date(Date.now() - 1*24*60*60*1000).toISOString() },
];

const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>(initialTickets);
    const [newTicket, setNewTicket] = useState({ title: '', description: '' });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewTicket({ ...newTicket, [e.target.id]: e.target.value });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // FIX: Added a guard for the user and included the 'userId' property when creating a new ticket.
        if(!newTicket.title || !newTicket.description || !user) return;

        const ticket: SupportTicket = {
            id: `t-${Date.now()}`,
            userId: user.id,
            ...newTicket,
            status: 'Open',
            createdAt: new Date().toISOString()
        };
        setTickets(prev => [ticket, ...prev]);
        setNewTicket({ title: '', description: '' });
    }
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <Card title="Your Support Tickets">
                            <div className="space-y-4">
                                {tickets.map(ticket => (
                                    <Link to={`/support/${ticket.id}`} key={ticket.id} className="block p-4 rounded-md bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-gray-800 dark:text-white">{ticket.title}</h4>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === 'Open' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-800'}`}>{ticket.status}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{ticket.description}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Opened on: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>
                    <div>
                        <Card title="Create a New Ticket">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input id="title" label="Query Title" value={newTicket.title} onChange={handleInputChange} required />
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        id="description"
                                        rows={4}
                                        value={newTicket.description}
                                        onChange={handleInputChange}
                                        required
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    ></textarea>
                                </div>
                                <Button type="submit" className="w-full">Submit Ticket</Button>
                            </form>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupportPage;