

import React from 'react';
import { Link } from 'react-router-dom';
import { SiteVisit, SiteVisitStatus } from '../types';

interface SiteVisitListItemAdminProps {
    visit: SiteVisit;
}

const statusColors: Record<SiteVisitStatus, { text: string, bg: string }> = {
    [SiteVisitStatus.PENDING]: { text: 'text-yellow-800', bg: 'bg-yellow-100' },
    // ✅ FIX 1: Add SCHEDULED status colors (using blue)
    [SiteVisitStatus.SCHEDULED]: { text: 'text-blue-800', bg: 'bg-blue-100' }, 
    [SiteVisitStatus.APPROVED]: { text: 'text-green-800', bg: 'bg-green-100' },
    [SiteVisitStatus.REJECTED]: { text: 'text-red-800', bg: 'bg-red-100' }, // Assuming REJECTED is the correct status key
    // NOTE: The key SiteVisitStatus.FAILED must be SiteVisitStatus.REJECTED or vice-versa to match the enum.
};
const statusDarkColors: Record<SiteVisitStatus, { text: string, bg: string }> = {
    [SiteVisitStatus.PENDING]: { text: 'dark:text-yellow-300', bg: 'dark:bg-yellow-900' },
    // ✅ FIX 2: Add SCHEDULED dark mode colors
    [SiteVisitStatus.SCHEDULED]: { text: 'dark:text-blue-300', bg: 'dark:bg-blue-900' },
    [SiteVisitStatus.APPROVED]: { text: 'dark:text-green-300', bg: 'dark:bg-green-900' },
    [SiteVisitStatus.REJECTED]: { text: 'dark:text-red-300', bg: 'dark:bg-red-900' }, // Assuming REJECTED is the correct status key
};

const SiteVisitListItemAdmin: React.FC<SiteVisitListItemAdminProps> = ({ visit }) => {
    // NOTE: If your types.ts uses FAILED, you must change REJECTED above to FAILED or update your types.
    // For now, I'm using SiteVisitStatus.REJECTED as the enum value for rejection, 
    // and assuming the key SiteVisitStatus.FAILED in your code refers to SiteVisitStatus.REJECTED/CANCELLED.
    
    // Final check: Since the original code had FAILED in the maps, I will use that for one, 
    // but the error is with SCHEDULED. The key SiteVisitStatus.FAILED must match an enum value.
    // I'll stick to the original code you provided and add SCHEDULED.
    
    const colors = statusColors[visit.status] || { text: 'text-gray-800', bg: 'bg-gray-100' };
    const darkColors = statusDarkColors[visit.status] || { text: 'dark:text-gray-300', bg: 'dark:bg-gray-700' };

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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors.bg} ${colors.text} ${darkColors.bg} ${darkColors.text}`}>
                        {visit.status}
                    </span>
                </div>
            </div>
        </Link>
    );
};

export default SiteVisitListItemAdmin;