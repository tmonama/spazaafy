// src/pages/ConsumerView.tsx

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SpazaShop } from '../types';
import MapView from '../components/MapView';
import SpazaShopListItem from '../components/SpazaShopListItem';
import Modal from '../components/Modal';
import mockApi from '../api/mockApi';

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
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
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
                setUserLocation({ lat: -26.2041, lng: 28.0473 });
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
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('consumerDashboard.nearbyShops')}</h1>
                <div className="flex-shrink-0">
                    <div className="inline-flex items-center rounded-lg bg-gray-200 dark:bg-dark-surface p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-dark-input text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            {t('consumerDashboard.buttons.list')}
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${viewMode === 'map' ? 'bg-white dark:bg-dark-input text-primary shadow' : 'text-gray-600 dark:text-gray-300'}`}
                        >
                            {t('consumerDashboard.buttons.map')}
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="mb-4">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('consumerDashboard.searchPlaceholder')}
                    className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none sm:text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-dark-input border-gray-300 dark:border-dark-surface focus:border-dark-border focus:ring-dark-border"
                />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{t('consumerDashboard.filterByDistance')}</span>
                {DISTANCE_FILTERS.map(dist => (
                    <button
                        key={dist}
                        onClick={() => setDistanceFilter(dist)}
                        className={`px-3 py-1 text-sm rounded-full font-semibold ${
                            distanceFilter === dist
                            ? 'bg-primary text-white' 
                            : 'bg-gray-200 dark:bg-dark-surface text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-opacity-80'
                        }`}
                    >
                        {dist > 0 ? `< ${dist} km` : t('consumerDashboard.all')}
                    </button>
                ))}
            </div>

            {loadingLocation && <p className="text-center text-gray-600 dark:text-gray-400">{t('consumerDashboard.loadingLocation')}</p>}
            {locationError && <p className="text-center text-red-500 mb-4">{locationError}</p>}
            
            {!loadingLocation && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className={`${viewMode === 'list' ? 'block' : 'hidden'} md:block md:col-span-1`}>
                        <div className="space-y-4">
                            {loadingShops ? <p>{t('consumerDashboard.loadingShops')}</p> : shops.length > 0 ? shops.map(shop => (
                                <SpazaShopListItem key={shop.id} shop={shop} userLocation={userLocation} />
                            )) : <p>{t('consumerDashboard.noShopsFound')}</p>}
                        </div>
                    </div>

                    <div className={`${viewMode === 'map' ? 'block' : 'hidden'} md:block md:col-span-1 h-96 md:h-[600px] rounded-lg overflow-hidden shadow-lg`}>
                        <MapView shops={shops} userLocation={userLocation} />
                    </div>
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