import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
    LifeBuoy, Send, Server, Monitor, AlertCircle, 
    FileText, Clock 
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Ticket } from '../types';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import mockApi from '../api/mockApi';
import { techApi } from '../api/techApi';

const SupportPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // ✅ Removed 'token'
    
    // ✅ Retrieve token from storage
    const token = sessionStorage.getItem('access') || localStorage.getItem('access') || '';

    // Determine User Type
    const isInternal = ['admin', 'hr', 'legal', 'employee'].includes(user?.role?.toLowerCase() || '');

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
            if (isInternal && token) {
                // Fetch from new Tech API
                const data = await techApi.getTickets(token);
                // Filter only tickets created by this user
                const myTickets = data.filter((t: any) => t.requester === user?.id || t.requester_name.includes(user?.firstName));
                // Sort by date (desc)
                myTickets.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setTickets(myTickets);
            } else {
                // Standard Spaza Shop API
                const fetchedTickets = await mockApi.tickets.list();
                fetchedTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setTickets(fetchedTickets);
            }
        } catch (err: any) {
            setError(t('supportPage.loadError', 'Failed to load tickets'));
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, [isInternal, token]);

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setNewTicket({ ...newTicket, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTicket.title || !newTicket.description) return;

        setIsSubmitting(true);
        try {
            if (isInternal && token) {
                // ✅ Submit to Tech Portal
                await techApi.createTicket({
                    title: newTicket.title,
                    description: newTicket.description,
                    category: newTicket.category
                }, token);
                alert("Tech Support Ticket Created");
            } else {
                // ✅ Submit to Customer Support
                await mockApi.tickets.create({
                    title: newTicket.title,
                    description: newTicket.description,
                    subject: newTicket.title,
                });
                alert("Support Ticket Created");
            }

            setNewTicket({ title: '', description: '', category: 'IT_SUPPORT' });
            await fetchTickets();
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
            case 'OPEN':
            case 'PENDING': return 'bg-green-100 text-green-800 border-green-200';
            case 'RESOLVED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'CLOSED': return 'bg-gray-200 text-gray-800 border-gray-300';
            case 'FIXING': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">

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
                                            <div 
                                                key={ticket.id} 
                                                className="block p-4 rounded-lg bg-white border border-gray-200 dark:bg-dark-input/40 dark:border-dark-surface hover:shadow-md transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center space-x-2">
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
                                                    {/* Handle both data structures (createdAt vs created_at) */}
                                                    {new Date(ticket.createdAt || (ticket as any).created_at).toLocaleDateString()}
                                                </div>
                                            </div>
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
                                        <div className="grid grid-cols-2 gap-2">
                                            {['IT_SUPPORT', 'ACCESS', 'BUG', 'REFERRAL'].map((cat) => (
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
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SupportPage;