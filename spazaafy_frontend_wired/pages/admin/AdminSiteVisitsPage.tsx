import React, { useState, useMemo } from 'react';
import { SiteVisit, SiteVisitStatus } from '../../types';
import { MOCK_DB } from '../../data/mockData';
import Card from '../../components/Card';
import SiteVisitListItemAdmin from '../../components/SiteVisitListItemAdmin';

type FilterStatus = SiteVisitStatus | 'All';

const AdminSiteVisitsPage: React.FC = () => {
    const allVisits = useMemo(() => MOCK_DB.siteVisits.findAll().sort((a,b) => new Date(b.requestedDateTime).getTime() - new Date(a.requestedDateTime).getTime()), []);
    // FIX: Used SiteVisitStatus enum member for type safety.
    const [filter, setFilter] = useState<FilterStatus>(SiteVisitStatus.PENDING);

    const filteredVisits = useMemo(() => {
        if (filter === 'All') {
            return allVisits;
        }
        return allVisits.filter(visit => visit.status === filter);
    }, [allVisits, filter]);
    
    // FIX: Used SiteVisitStatus enum members instead of string literals for type safety.
    const filterOptions: FilterStatus[] = [SiteVisitStatus.PENDING, SiteVisitStatus.APPROVED, SiteVisitStatus.FAILED, 'All'];

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Site Visits</h1>
            <Card>
                <div className="flex items-center space-x-2 p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by status:</span>
                     {filterOptions.map(option => (
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
                    {filteredVisits.length > 0 ? (
                        filteredVisits.map(visit => (
                            <SiteVisitListItemAdmin key={visit.id} visit={visit} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No site visits match the current filter.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AdminSiteVisitsPage;