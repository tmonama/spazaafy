import React, { useState, useMemo } from 'react';
import { SupportTicket, User } from '../../types';
import { MOCK_DB } from '../../data/mockData';
import Card from '../../components/Card';
import TicketListItemAdmin from '../../components/TicketListItemAdmin';

type FilterStatus = 'All' | 'Open' | 'Closed';

const AdminTicketsPage: React.FC = () => {
    const allTickets = useMemo(() => MOCK_DB.tickets.findAll().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), []);
    const allUsers = useMemo(() => MOCK_DB.users.findAll(), []);
    
    const [filter, setFilter] = useState<FilterStatus>('Open');
    
    const findUserForTicket = (ticket: SupportTicket): User | undefined => {
        return allUsers.find(u => u.id === ticket.userId);
    }
    
    const filteredTickets = useMemo(() => {
        return allTickets.filter(ticket => {
            if (filter === 'All') return true;
            return ticket.status === filter;
        });
    }, [allTickets, filter]);

    return (
         <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Support Tickets</h1>
            <Card>
                <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
                    {(['Open', 'Closed', 'All'] as FilterStatus[]).map(option => (
                        <button
                            key={option}
                            onClick={() => setFilter(option)}
                            className={`px-3 py-1 text-sm rounded-full font-semibold ${
                                filter === option 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <div className="p-4 space-y-4">
                    {filteredTickets.length > 0 ? (
                        filteredTickets.map(ticket => {
                            const user = findUserForTicket(ticket);
                            if (!user) return null; // Should not happen with mock data
                            return <TicketListItemAdmin key={ticket.id} ticket={ticket} user={user} />;
                        })
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No tickets match the current filter.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminTicketsPage;
