// src/components/SpazaShopListItem.tsx

import React from 'react';
import { SpazaShop } from '../types';

interface SpazaShopListItemProps {
    shop: SpazaShop;
    userLocation: { lat: number; lng: number } | null;
}

const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 inline-block text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);

const VerifiedIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block text-primary" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm-2.25 7.082a.75.75 0 00.22 1.03l3.25 2.5a.75.75 0 001.03-.22l4.5-6.5a.75.75 0 00-1.03-1.03l-3.97 5.75-2.72-2.176a.75.75 0 00-1.03.22z" clipRule="evenodd" />
    </svg>
)

const DirectionsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
    </svg>
);

const SpazaShopListItem: React.FC<SpazaShopListItemProps> = ({ shop, userLocation }) => {
    
    const handleGetDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (userLocation) {
            const origin = `${userLocation.lat},${userLocation.lng}`;
            const destination = encodeURIComponent(shop.location.address);
            const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };
    
    return (
        <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
                 <div className="flex-1">
                    <h3 className="text-lg font-bold text-primary dark:text-primary-light">{shop.shopName}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"><LocationIcon /> {shop.location.address}</p>
                    {shop.isVerified && (
                        <div className="mt-2 flex items-center text-sm font-semibold text-green-600 dark:text-green-400">
                            <VerifiedIcon />
                            <span className="ml-1">Verified by Spazaafy</span>
                        </div>
                    )}
                </div>
                <div className="text-right ml-4 flex-shrink-0">
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{shop.distance.toFixed(1)} km</p>
                    <p className="text-xs text-gray-500">away</p>
                </div>
            </div>
            {userLocation && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                    <button
                        onClick={handleGetDirections}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary dark:text-primary-light bg-primary/10 dark:bg-primary/40 hover:bg-primary/20 dark:hover:bg-primary/50 transition-colors"
                    >
                        <DirectionsIcon />
                        Get Directions
                    </button>
                </div>
            )}
        </div>
    );
}

export default SpazaShopListItem;