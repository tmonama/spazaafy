
import React from 'react';
import { Link } from 'react-router-dom';
import { SiteVisit, SiteVisitStatus } from '../types';

interface SiteVisitListItemAdminProps {
    visit: SiteVisit;
}

const statusColors: Record<SiteVisitStatus, { text: string, bg: string }> = {
    [SiteVisitStatus.PENDING]: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
    [SiteVisitStatus.APPROVED]: { text: 'text-green-800', bg: 'bg-green-100' },
    [SiteVisitStatus.FAILED]: { text: 'text-red-800', bg: 'bg-red-100' },
};
const statusDarkColors: Record<SiteVisitStatus, { text: string, bg: string }> = {
    [SiteVisitStatus.PENDING]: { text: 'dark:text-yellow-300', bg: 'dark:bg-yellow-900' },
    [SiteVisitStatus.APPROVED]: { text: 'dark:text-green-300', bg: 'dark:bg-green-900' },
    [SiteVisitStatus.FAILED]: { text: 'dark:text-red-300', bg: 'dark:bg-red-900' },
};

const SiteVisitListItemAdmin: React.FC<SiteVisitListItemAdminProps> = ({ visit }) => {
    return (
        <Link to={`/admin/site-visits/${visit.id}`} className="block p-4 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div>
                    <h4 className="font-bold text-lg text-primary dark:text-primary-light">{visit.shopName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Requested for: <span className="font-medium text-gray-800 dark:text-gray-200">{new Date(visit.requestedDateTime).toLocaleString()}</span>
                    </p>
                </div>
                <div className="mt-3 sm:mt-0">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[visit.status].bg} ${statusColors[visit.status].text} ${statusDarkColors[visit.status].bg} ${statusDarkColors[visit.status].text}`}>
                        {visit.status}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default SiteVisitListItemAdmin;