import React, { useState, useEffect, useMemo } from 'react';
import { SpazaShop } from '../../types';
import mockApi from '../../api/mockApi';
import ShopListItemAdmin from '../../components/ShopListItemAdmin';
import Card from '../../components/Card';
import Button from '../../components/Button';

type FilterStatus = 'All' | 'Verified' | 'Unverified';

const SpazaShopsPage: React.FC = () => {
    const [allShops, setAllShops] = useState<SpazaShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<FilterStatus>('All');

    useEffect(() => {
        const fetchShops = async () => {
            try {
                setLoading(true);
                const shops = await mockApi.shops.getAll();
                setAllShops(shops);
            } catch (error) {
                console.error("Failed to fetch shops:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShops();
    }, []);

    const filteredShops = useMemo(() => {
        return allShops
            .filter(shop => {
                if (filter === 'Verified') return shop.isVerified;
                if (filter === 'Unverified') return !shop.isVerified;
                return true;
            })
            .filter(shop => 
                shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                `${shop.firstName} ${shop.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
            );
    }, [allShops, searchTerm, filter]);
    
    if (loading) {
        return <p>Loading shop list...</p>;
    }

    const handleExport = async () => {
        try {
            await mockApi.shops.exportCsv();
        } catch (error) {
            console.error("Failed to export spaza shops:", error);
            alert("Could not export spaza shops.");
        }
    };

    return (
        <div>
            {/* ✅ FIX: Header stacks on small screens */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Spaza Shops</h1>
                <Button onClick={handleExport} className="w-full sm:w-auto">Export to CSV</Button>
            </div>
            
            <Card>
                {/* ✅ FIX: Search and filter stack vertically on small screens */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4 md:space-y-0 md:flex md:justify-between md:items-center">
                    <input
                        type="text"
                        placeholder="Search by name, address, owner..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="block w-full md:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                    />
                    <div className="flex items-center flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                        {(['All', 'Verified', 'Unverified'] as FilterStatus[]).map(option => (
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
                </div>

                <div className="p-4 space-y-4">
                     {filteredShops.length > 0 ? (
                        filteredShops.map(shop => (
                            <ShopListItemAdmin key={shop.id} shop={shop} />
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No shops found matching your criteria.
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default SpazaShopsPage;