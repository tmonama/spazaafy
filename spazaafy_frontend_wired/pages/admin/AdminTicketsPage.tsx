import React, { useState, useEffect, useMemo } from 'react';
import { Ticket, TicketStatus } from '../../types';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import TicketListItemAdmin from '../../components/TicketListItemAdmin';

type FilterStatus = 'All' | TicketStatus;
type PriorityFilter = 'All' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const PRIORITY_FILTERS: PriorityFilter[] = ['All', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const AdminTicketsPage: React.FC = () => {
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<FilterStatus>(TicketStatus.OPEN);
    const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('All');
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const ticketsData = await mockApi.tickets.list();
                setAllTickets(ticketsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                console.error("Failed to fetch data for tickets page:", err);
                setError("Could not load data. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    useEffect(() => {
        // Reset priority filter if status is not 'OPEN'
        if (filter !== TicketStatus.OPEN) {
            setPriorityFilter('All');
        }
    }, [filter]);

    const filteredTickets = useMemo(() => {
        let tickets = allTickets;

        // Apply status filter first
        if (filter !== 'All') {
            tickets = tickets.filter(ticket => ticket.status === filter);
        }

        // If status is OPEN, then apply priority filter
        if (filter === TicketStatus.OPEN && priorityFilter !== 'All') {
            // A ticket's priority can be undefined; default to 'LOW' for filtering
            tickets = tickets.filter(ticket => (ticket.priority || 'LOW') === priorityFilter);
        }

        return tickets;
    }, [allTickets, filter, priorityFilter]);

    if (loading) {
        return <p>Loading tickets...</p>;
    }
    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
         <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Support Tickets</h1>
            <Card>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
                        {([TicketStatus.OPEN, TicketStatus.CLOSED, 'All'] as FilterStatus[]).map(option => (
                            <button
                                key={option}
                                onClick={() => setFilter(option)}
                                className={`px-3 py-1 text-sm rounded-full font-semibold transition-colors ${
                                    filter === option 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>

                    {/* Conditionally render the priority filter section */}
                    {filter === TicketStatus.OPEN && (
                        <div className="flex items-center space-x-2 mt-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by priority:</span>
                            {PRIORITY_FILTERS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPriorityFilter(p)}
                                    className={`px-3 py-1 text-sm rounded-full font-semibold capitalize transition-colors ${
                                        priorityFilter === p
                                        ? 'bg-secondary text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                    }`}
                                >
                                    {p.toLowerCase()}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map(ticket => (
                            <TicketListItemAdmin 
                                key={ticket.id} 
                                ticket={ticket} 
                            />
                        ))
                    ) : (
                         <p className="text-center text-gray-500 py-8">
                            No tickets match the current filter.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminTicketsPage;