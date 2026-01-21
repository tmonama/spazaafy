import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
    LifeBuoy, Send, Server, Monitor, AlertCircle, 
    FileText, CheckCircle, Clock 
} from 'lucide-react';

// Hooks & Context
import { useAuth } from '../hooks/useAuth';
import { Ticket } from '../types';

// Components
import Header from '../components/Header';         // For Consumers/Shops
import InternalHeader from '../components/InternalHeader'; // For Admin/HR/Legal/Employees
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';

// API
import mockApi from '../api/mockApi';

const SupportPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    
    // Determine User Type
    const isInternal = ['admin', 'hr', 'legal', 'employee'].includes(user?.role || '');

    // State
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Form State
    const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'IT_SUPPORT' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Tickets
    const fetchTickets = async () => {
        try {
            setLoading(true);
            const fetchedTickets = await mockApi.tickets.list();
            // Sort by newest first
            fetchedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setTickets(fetchedTickets);
        } catch (err: any) {
            setError(t('supportPage.loadError', 'Failed to load tickets'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewTicket({ ...newTicket, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.title || !newTicket.description) return;

        setIsSubmitting(true);
        try {
            // For internal users, prepend category to description or title if API doesn't support category field yet
            const finalDescription = isInternal 
                ? `[Category: ${newTicket.category}] ${newTicket.description}`
                : newTicket.description;

            await mockApi.tickets.create({
                title: newTicket.title,
                description: finalDescription,
                subject: newTicket.title,
                // If your backend supports a category field, pass it here
                // category: newTicket.category 
            });

            setNewTicket({ title: '', description: '', category: 'IT_SUPPORT' });
            await fetchTickets();
            alert(isInternal ? "Tech Support Ticket Created" : "Support Ticket Created");
        } catch (err) {
            alert('Failed to create ticket. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper for Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-green-100 text-green-800 border-green-200';
            case 'RESOLVED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CLOSED': return 'bg-gray-200 text-gray-800 border-gray-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
            {/* ✅ Dynamic Header Switching */}
            {isInternal ? <InternalHeader /> : <Header />}

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                {/* Page Title Section */}
                <div className="mb-8">
                    {isInternal ? (
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <Server className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Internal Tech Support</h1>
                                <p className="text-gray-500">Report system bugs, access issues, or hardware problems to IT.</p>
                            </div>
                        </div>
                    ) : (
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('supportPage.title', 'Customer Support')}</h1>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* LEFT COLUMN: Ticket List */}
                    <div className="md:col-span-2 order-2 md:order-1">
                        <Card title={isInternal ? "My Tech Requests" : t('supportPage.yourTickets')}>
                            {loading ? ( <p className="text-center py-4 text-gray-500">{t('supportPage.loading')}</p> ) 
                            : error ? ( <p className="text-red-500">{error}</p> ) 
                            : (
                                <div className="space-y-4">
                                    {tickets.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                                            <FileText className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                                            <p>{t('supportPage.noTickets')}</p>
                                        </div>
                                    ) : (
                                        tickets.map(ticket => (
                                            <Link 
                                                to={`/support/${ticket.id}`} 
                                                key={ticket.id} 
                                                className="block p-4 rounded-lg bg-white border border-gray-200 dark:bg-dark-input/40 dark:border-dark-surface hover:shadow-md transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center space-x-2">
                                                        {ticket.unreadForCreator && (
                                                            <span className="w-2.5 h-2.5 bg-red-500 rounded-full flex-shrink-0 animate-pulse" title="New response"></span>
                                                        )}
                                                        <h4 className="font-bold text-gray-800 dark:text-white text-base">{ticket.title}</h4>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                                                    {ticket.description}
                                                </p>
                                                <div className="flex items-center text-xs text-gray-400 dark:text-gray-500">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {t('supportPage.openedOn', { date: new Date(ticket.createdAt).toLocaleDateString() })}
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Create Form */}
                    <div className="order-1 md:order-2">
                        <Card title={isInternal ? "Open Tech Ticket" : t('supportPage.createTicket')}>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                
                                {/* Internal Category Selector */}
                                {isInternal && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['IT_SUPPORT', 'ACCESS', 'BUG'].map((cat) => (
                                                <div 
                                                    key={cat}
                                                    onClick={() => setNewTicket({ ...newTicket, category: cat })}
                                                    className={`cursor-pointer border rounded-md p-2 text-center text-xs font-bold transition ${
                                                        newTicket.category === cat 
                                                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' 
                                                        : 'border-gray-200 text-gray-500 hover:border-blue-300'
                                                    }`}
                                                >
                                                    {cat === 'IT_SUPPORT' && <Monitor className="mx-auto h-4 w-4 mb-1" />}
                                                    {cat === 'ACCESS' && <LifeBuoy className="mx-auto h-4 w-4 mb-1" />}
                                                    {cat === 'BUG' && <AlertCircle className="mx-auto h-4 w-4 mb-1" />}
                                                    {cat.replace('_', ' ')}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <Input 
                                    id="title" 
                                    label={isInternal ? "Subject" : t('supportPage.queryTitle')} 
                                    value={newTicket.title} 
                                    onChange={handleInputChange} 
                                    required 
                                    disabled={isSubmitting} 
                                    placeholder={isInternal ? "e.g. Cannot access HR Dashboard" : "Briefly summarize your issue"}
                                />
                                
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        {t('supportPage.description')}
                                    </label>
                                    <textarea 
                                        id="description" 
                                        rows={5} 
                                        value={newTicket.description} 
                                        onChange={handleInputChange} 
                                        required 
                                        disabled={isSubmitting} 
                                        className="w-full rounded-md border-gray-300 dark:border-dark-surface shadow-sm focus:border-primary focus:ring-primary p-3 text-sm bg-white dark:bg-dark-input text-gray-900 dark:text-gray-100"
                                        placeholder={isInternal ? "Steps to reproduce, error messages, etc." : "Provide details..."}
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        t('supportPage.submittingButton', 'Submitting...')
                                    ) : (
                                        <span className="flex items-center justify-center">
                                            <Send className="w-4 h-4 mr-2" /> 
                                            {isInternal ? "Submit to Tech Team" : t('supportPage.submitButton')}
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </Card>
                        
                        {/* Help Text for Internal */}
                        {isInternal && (
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-1">Urgent Issue?</h4>
                                <p className="text-xs text-blue-600 dark:text-blue-300">
                                    For critical system outages affecting operations, please contact the IT Emergency Line directly at <strong>ext. 1011</strong>.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupportPage;