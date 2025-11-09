import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SpazaShop } from '../types';
import MapView from '../components/MapView';
import SpazaShopListItem from '../components/SpazaShopListItem';
import Modal from '../components/Modal';
import mockApi from '../api/mockApi';
import Button from '../components/Button'; // Import the Button component

const DISTANCE_FILTERS = [0, 5, 10, 15];

const ConsumerView: React.FC = () => {
    const { t } = useTranslation();
    const [shops, setShops] = useState<SpazaShop[]>([]);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingShops, setLoadingShops] = useState(true);
    const [distanceFilter, setDistanceFilter] = useState<number>(0);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        // ... (distance calculation remains the same)
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    // ✅ FIX 1: Encapsulate the entire location logic into a single function
    const requestUserLocation = async () => {
        setLoadingLocation(true);
        setLocationError(null);

        // --- Attempt 1: High-accuracy browser geolocation ---
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000, // 10 second timeout
                    maximumAge: 0
                });
            });
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setLoadingLocation(false);
            return; // Success, exit the function
        } catch (error: any) {
            console.error("Browser geolocation failed:", error.message);
            if (error.code === error.PERMISSION_DENIED) {
                setIsModalOpen(true);
            }
        }
        
        // --- Attempt 2: IP-based geolocation as a fallback ---
        try {
            setLocationError("Couldn't get a precise location, trying a network-based fallback...");
            const response = await fetch('https://ipapi.co/json/');
            if (!response.ok) throw new Error('IP API failed');
            const data = await response.json();
            if (data.latitude && data.longitude) {
                setUserLocation({ lat: data.latitude, lng: data.longitude });
                setLocationError(`Showing approximate results for ${data.city || 'your area'}. For better accuracy, please enable location services.`);
            } else {
                throw new Error('IP API did not return coordinates.');
            }
        } catch (ipError) {
            console.error("IP geolocation also failed:", ipError);
            // --- Final Fallback: Hardcoded location ---
            setUserLocation({ lat: -26.2041, lng: 28.0473 }); // Johannesburg
            setLocationError('Could not get your location. Showing results for Johannesburg. Please enable location services in your browser.');
        } finally {
            setLoadingLocation(false);
        }
    };

    // Initial effect to get location on mount
    useEffect(() => {
        requestUserLocation();
    }, []);

    // Effect to fetch shops whenever location or filters change
    useEffect(() => {
        const fetchShops = async () => {
            if (userLocation) {
                setLoadingShops(true);
                try {
                    const allShops = await mockApi.shops.getAll();
                    const shopsWithDistance = allShops.map(shop => ({
                        ...shop,
                        distance: calculateDistance(userLocation.lat, userLocation.lng, shop.location.lat, shop.location.lng)
                    })).sort((a, b) => a.distance - b.distance);

                    let filteredShops = shopsWithDistance.filter(shop => 
                        (shop.shopName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                        (shop.location?.address?.toLowerCase() || '').includes(searchQuery.toLowerCase())
                    );
                    
                    if (distanceFilter > 0) {
                        filteredShops = filteredShops.filter(shop => shop.distance <= distanceFilter);
                    }
                    setShops(filteredShops);
                } catch (err) {
                    console.error("Failed to fetch or process shops:", err);
                    setLocationError('There was an error loading shops from the server.');
                } finally {
                    setLoadingShops(false);
                }
            }
        }
        fetchShops();
    }, [userLocation, searchQuery, distanceFilter]);

    return (
        <div>
            {/* ... Header and Search/Filter UI remains the same ... */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('consumerDashboard.nearbyShops')}</h1>
                <div className="flex-shrink-0">
                    <div className="inline-flex items-center rounded-lg bg-gray-200 dark:bg-dark-surface p-1">
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-dark-input text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('consumerDashboard.buttons.list')}</button>
                        <button onClick={() => setViewMode('map')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-dark-input text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}>{t('consumerDashboard.buttons.map')}</button>
                    </div>
                </div>
            </div>
            <div className="mb-4">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('consumerDashboard.searchPlaceholder')} className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none sm:text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-dark-input border-gray-300 dark:border-dark-surface focus:border-dark-border focus:ring-dark-border" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{t('consumerDashboard.filterByDistance')}</span>
                {DISTANCE_FILTERS.map(dist => ( <button key={dist} onClick={() => setDistanceFilter(dist)} className={`px-3 py-1 text-sm rounded-full font-semibold ${ distanceFilter === dist ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-opacity-80' }`}> {dist > 0 ? `< ${dist} km` : t('consumerDashboard.all')} </button> ))}
            </div>

            {loadingLocation && <p className="text-center text-gray-600 dark:text-gray-400">{t('consumerDashboard.loadingLocation')}</p>}
            
            {/* ✅ FIX 2: Show the error and the retry button */}
            {locationError && (
                <div className="text-center bg-red-100 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <p className="block sm:inline">{locationError}</p>
                    <div className="mt-2">
                        <Button onClick={requestUserLocation} size="sm" variant="danger" disabled={loadingLocation}>
                            Try Again
                        </Button>
                    </div>
                </div>
            )}
            
            {!loadingLocation && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* ... Rest of the component (list/map views) remains the same ... */}
                 </div>
            )}
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('consumerDashboard.modalTitle')}>
                <p className="text-gray-700 dark:text-gray-300">
                    {t('consumerDashboard.modalBody')}
                </p>
            </Modal>
        </div>
    );
};

export default ConsumerView;