
import React, { useState, useEffect, useMemo } from 'react';
import { SiteVisit, SiteVisitStatus, SpazaShop } from '../../types';
import mockApi from '../../api/mockApi';
import Card from '../../components/Card';
import SiteVisitListItemAdmin from '../../components/SiteVisitListItemAdmin';
import Button from '../../components/Button'; // <-- Import Button


type FilterStatus = SiteVisitStatus | 'All';

const AdminSiteVisitsPage: React.FC = () => {
    const [allVisits, setAllVisits] = useState<SiteVisit[]>([]);
    const [loading, setLoading] = useState(true);
    // ✅ FIX: Set default filter to SCHEDULED
    const [filter, setFilter] = useState<FilterStatus>(SiteVisitStatus.PENDING); 

    useEffect(() => {
        const fetchVisits = async () => {
            try {
                setLoading(true);
                // ✅ FIX 2: Fetch both visits and shops concurrently
                const [visitsRaw, allShops] = await Promise.all([
                    mockApi.visits.list(),
                    mockApi.shops.getAll()
                ]);

                // Create a map for quick shop name lookup: { 'shopId': 'shopName' }
                const shopMap = new Map<string, string>();
                allShops.forEach(shop => {
                    shopMap.set(shop.id, shop.shopName);
                });

                // ✅ FIX 3: Stitch the shopName onto each visit object
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
    }, []); // Runs once on mount
    
    const filteredVisits = useMemo(() => {
        if (filter === 'All') return allVisits;
        // This filter is correct. It uses the converted status from mockApi.ts
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

    // ✅ THIS IS THE FIX
    const handleExport = async () => {
        try {
            // It now calls the correct export function for visits
            await mockApi.visits.exportCsv();
        } catch (error) {
            console.error("Failed to export site visits:", error);
            alert("Could not export site visits.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <Button onClick={handleExport}>Export to CSV</Button>
            </div>
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