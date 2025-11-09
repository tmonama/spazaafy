import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Ticket } from '../types';
// Header and AlertsProvider are no longer imported here
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Link } from 'react-router-dom';
import mockApi from '../api/mockApi';

const SupportPage: React.FC = () => {
    const { t } = useTranslation();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newTicket, setNewTicket] = useState({ title: '', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const fetchedTickets = await mockApi.tickets.list();
            fetchedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTickets(fetchedTickets);
        } catch (err: any) {
            setError(t('supportPage.loadError'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewTicket({ ...newTicket, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.title || !newTicket.description) return;

        setIsSubmitting(true);
        try {
            await mockApi.tickets.create({
                title: newTicket.title,
                description: newTicket.description,
                subject: newTicket.title,
            });
            setNewTicket({ title: '', description: '' });
            await fetchTickets();
        } catch (err) {
            alert('Failed to create ticket. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        // The Header and main layout tags are handled by UserLayout in App.tsx
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card title={t('supportPage.yourTickets')}>
                        {loading ? (
                            <p>{t('supportPage.loading')}</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : (
                            <div className="space-y-4">
                                {tickets.length === 0 ? (
                                    <p className="text-gray-500">{t('supportPage.noTickets')}</p>
                                ) : (
                                    tickets.map(ticket => (
                                        <Link to={`/support/${ticket.id}`} key={ticket.id} className="block p-4 rounded-md bg-gray-50 dark:bg-dark-input/70 hover:bg-gray-100 dark:hover:bg-dark-input transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center space-x-2">
                                                    {ticket.unreadForCreator && (
                                                        <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0" title="New message"></span>
                                                    )}
                                                    <h4 className="font-bold text-gray-800 dark:text-white">{ticket.title}</h4>
                                                </div>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ticket.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-800'}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">{ticket.description}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-300 mt-2">{t('supportPage.openedOn', { date: new Date(ticket.createdAt).toLocaleDateString() })}</p>
                                        </Link>
                                    ))
                                )}
                            </div>
                        )}
                    </Card>
                </div>
                <div>
                    <Card title={t('supportPage.createTicket')}>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input id="title" label={t('supportPage.queryTitle')} value={newTicket.title} onChange={handleInputChange} required disabled={isSubmitting} />
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('supportPage.description')}</label>
                                <textarea id="description" rows={4} value={newTicket.description} onChange={handleInputChange} required disabled={isSubmitting} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-dark-surface rounded-md shadow-sm focus:outline-none focus:ring-dark-border focus:border-dark-border sm:text-sm bg-white dark:bg-dark-input text-gray-900 dark:text-gray-100"></textarea>
                            </div>
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? t('supportPage.submittingButton') : t('supportPage.submitButton')}
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;