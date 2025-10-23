import React, { useState, useEffect } from 'react';
import { SpazaShop } from '../types';
import MapView from '../components/MapView';
import SpazaShopListItem from '../components/SpazaShopListItem';
import Modal from '../components/Modal';
import mockApi from '../api/mockApi';

const ConsumerView: React.FC = () => {
    const [shops, setShops] = useState<SpazaShop[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingShops, setLoadingShops] = useState(true);


    // Haversine formula to calculate distance
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
                setLoadingLocation(false);
            },
            (error) => {
                console.error("Error getting user location:", error.message);
                // Default to a central location if permission is denied
                setUserLocation({ lat: -26.2041, lng: 28.0473 }); // Johannesburg
                setLocationError('Could not get your location. Showing results for Johannesburg. Please enable location services in your browser.');
                if (error.code === error.PERMISSION_DENIED) {
                    setIsModalOpen(true);
                }
                setLoadingLocation(false);
            }
        );
    }, []);

    useEffect(() => {
        const fetchShops = async () => {
            if (userLocation) {
                setLoadingShops(true);
                const allShops = await mockApi.shops.getAll();
                const shopsWithDistance: SpazaShop[] = allShops.map(shop => ({
                    ...shop,
                    distance: calculateDistance(userLocation.lat, userLocation.lng, shop.location.lat, shop.location.lng)
                })).sort((a, b) => a.distance - b.distance); // Sort by distance

                const filteredShops = shopsWithDistance.filter(shop => 
                    shop.shopName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    shop.location.address.toLowerCase().includes(searchQuery.toLowerCase())
                );

                setShops(filteredShops);
                setLoadingShops(false);
            }
        }
        fetchShops();
    }, [userLocation, searchQuery]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nearby Spaza Shops</h1>
                <div className="hidden sm:flex items-center rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        List
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-gray-800 text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                        Map
                    </button>
                </div>
            </div>
            
            <div className="mb-6">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Spaza name or address..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary focus:border-primary bg-white text-gray-900 dark:bg-gray-800 dark:text-white"
                />
            </div>


            {loadingLocation && <p className="text-center text-gray-600 dark:text-gray-400">Getting your location...</p>}
            {locationError && <p className="text-center text-red-500 mb-4">{locationError}</p>}
            
            {!loadingLocation && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* List View */}
                    <div className={`${viewMode === 'list' ? 'block' : 'hidden'} md:block md:col-span-1`}>
                        <div className="space-y-4">
                            {loadingShops ? <p>Loading shops...</p> : shops.length > 0 ? shops.map(shop => (
                                <SpazaShopListItem key={shop.id} shop={shop} userLocation={userLocation} />
                            )) : <p>No shops found.</p>}
                        </div>
                    </div>

                    {/* Map View */}
                    <div className={`${viewMode === 'map' ? 'block' : 'hidden'} md:block md:col-span-1 h-96 md:h-[600px] rounded-lg overflow-hidden shadow-lg`}>
                        <MapView shops={shops} userLocation={userLocation} />
                    </div>
                </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Location Services Required">
                <p className="text-gray-700 dark:text-gray-300">
                    Spazaafy needs your location to find nearby shops for you. Please enable location services in your browser or system settings to continue.
                </p>
            </Modal>
        </div>
    );
};

export default ConsumerView;