import React, { useState, useEffect, useMemo } from 'react';
import { SiteVisit, SiteVisitStatus } from '../../types';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import SiteVisitListItemAdmin from '../../components/SiteVisitListItemAdmin';
import Button from '../../components/Button';

type FilterStatus = SiteVisitStatus | 'All';

const AdminSiteVisitsPage: React.FC = () => {
    const [allVisits, setAllVisits] = useState<SiteVisit[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>(SiteVisitStatus.PENDING); 

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                setLoading(true);
                const [visitsRaw, allShops] = await Promise.all([
                    mockApi.visits.list(),
                    mockApi.shops.getAll()
                ]);

                const shopMap = new Map<string, string>();
                allShops.forEach(shop => {
                    shopMap.set(shop.id, shop.shopName);
                });

                const visitsWithNames = visitsRaw.map(visit => ({
                    ...visit,
                    shopName: shopMap.get(visit.shopId) || `Shop ID: ${visit.shopId}`
                }));

                setAllVisits(visitsWithNames.sort((a,b) => new Date(b.requestedDateTime).getTime() - new Date(a.requestedDateTime).getTime()));
            } catch(error) {
                console.error("Failed to fetch site visits:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVisits();
    }, []);
    
    const filteredVisits = useMemo(() => {
        if (filter === 'All') return allVisits;
        return allVisits.filter(visit => visit.status === filter);
    }, [allVisits, filter]);
    
    const filterOptions: FilterStatus[] = [
        SiteVisitStatus.PENDING, 
        SiteVisitStatus.SCHEDULED,
        SiteVisitStatus.APPROVED, 
        SiteVisitStatus.REJECTED, 
        'All'
    ];

    if (loading) {
        return <p>Loading site visits...</p>;
    }

    const handleExport = async () => {
        try {
            await mockApi.visits.exportCsv();
        } catch (error) {
            console.error("Failed to export site visits:", error);
            alert("Could not export site visits.");
        }
    };

    return (
        <div>
            {/* ✅ FIX: Header stacks on small screens */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Site Visits</h1>
                <Button onClick={handleExport} className="w-full sm:w-auto">Export to CSV</Button>
            </div>
            <Card>
                {/* ✅ FIX: Filter buttons wrap on small screens */}
                <div className="flex items-center flex-wrap gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Filter by status:</span>
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