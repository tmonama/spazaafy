import React from 'react';
import { Ticket, UserRole } from '../types';
import { Link } from 'react-router-dom';

interface TicketListItemAdminProps {
    ticket: Ticket;
}

const roleDisplay: Record<UserRole, string> = {
    [UserRole.CONSUMER]: 'Consumer',
    [UserRole.SHOP_OWNER]: 'Spaza Shop',
    [UserRole.ADMIN]: 'Admin',
}

const TicketListItemAdmin: React.FC<TicketListItemAdminProps> = ({ ticket }) => {
    return (
        <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm border-l-4 border-primary">
            <div className="flex flex-col sm:flex-row sm:justify-between">
                {/* Left side: Ticket Info */}
                <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 dark:text-white">{ticket.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Submitted: {new Date(ticket.createdAt).toLocaleString()}
                    </p>
                </div>

                {/* Right side: User & Actions */}
                <div className="mt-4 sm:mt-0 sm:ml-6 flex-shrink-0 sm:w-64">
                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                        <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">Submitted By</p>
                        {/* ✅ Use the name directly from the ticket prop */}
                        <p className="text-sm text-gray-600 dark:text-gray-300">{ticket.submitterName}</p>
                        {ticket.submitterEmail && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ticket.submitterEmail}</p>}
                        {ticket.submitterRole && (
                             <span className={`mt-2 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${ticket.submitterRole === UserRole.CONSUMER ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                {roleDisplay[ticket.submitterRole]}
                            </span>
                        )}
                    </div>

                    <div className="mt-3">
                        <Link to={`/admin/tickets/${ticket.id}`} className="w-full text-center block px-4 py-2 text-sm font-medium rounded-md text-white bg-secondary hover:bg-secondary-dark transition-colors">
                            View & Reply
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketListItemAdmin;