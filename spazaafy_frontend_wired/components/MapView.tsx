import React, { useEffect, useRef, useState } from 'react';
import { SpazaShop } from '../types';
import { loadGoogleMapsApi } from '../utils/googleMapsLoader';

interface MapViewProps {
    shops: SpazaShop[];
    userLocation: { lat: number; lng: number } | null;
}

const MapView: React.FC<MapViewProps> = ({ shops, userLocation }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null); // To hold map instance
    const markersRef = useRef<any[]>([]); // To hold shop marker instances
    const userMarkerRef = useRef<any>(null); // To hold user marker instance
    const [isApiLoaded, setApiLoaded] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    useEffect(() => {
        loadGoogleMapsApi()
            .then(() => setApiLoaded(true))
            .catch(error => {
                console.error("Google Maps API failed to load for map view.", error);
                setApiError("Google Maps failed to load. Please check your connection.");
            });
    }, []);

    useEffect(() => {
        if (isApiLoaded && mapContainerRef.current) {
            // Initialize map if it doesn't exist
            if (!mapInstanceRef.current) {
                const initialCenter = userLocation || (shops.length > 0
                    ? shops[0].location
                    : { lat: -26.2041, lng: 28.0473 }); // Default to Johannesburg

                mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
                    center: initialCenter,
                    zoom: 12,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                });
            }

            // Update or create user location marker
            if (userLocation) {
                if (userMarkerRef.current) {
                    userMarkerRef.current.setPosition(userLocation);
                    userMarkerRef.current.setMap(mapInstanceRef.current);
                } else {
                    userMarkerRef.current = new window.google.maps.Marker({
                        position: userLocation,
                        map: mapInstanceRef.current,
                        title: 'Your Location',
                        icon: {
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: '#4285F4',
                            fillOpacity: 1,
                            strokeColor: 'white',
                            strokeWeight: 2,
                        },
                        zIndex: 999
                    });
                }
            }

            // Clear existing shop markers from the map
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];
            
            const infoWindow = new window.google.maps.InfoWindow();
            const bounds = new window.google.maps.LatLngBounds();
            
            if (userLocation) {
                 bounds.extend(userLocation);
            }

            // Add new markers for shops
            shops.forEach(shop => {
                const marker = new window.google.maps.Marker({
                    position: shop.location,
                    map: mapInstanceRef.current,
                    title: shop.shopName,
                    animation: window.google.maps.Animation.DROP,
                });
                
                marker.addListener('click', () => {
                    const content = `
                        <div class="p-1">
                            <h3 class="font-bold text-md text-primary">${shop.shopName}</h3>
                            <p class="text-sm text-gray-600">${shop.location.address}</p>
                            ${shop.isVerified ? '<p class="text-sm font-semibold text-green-600 mt-1">Verified</p>' : ''}
                        </div>
                    `;
                    infoWindow.setContent(content);
                    infoWindow.open(mapInstanceRef.current, marker);
                });

                markersRef.current.push(marker);
                bounds.extend(shop.location);
            });

            // Adjust map to fit all markers if there are any shops or a user location
            if (shops.length > 0 || userLocation) {
                mapInstanceRef.current.fitBounds(bounds);

                const listener = window.google.maps.event.addListener(mapInstanceRef.current, "idle", function() { 
                    if (mapInstanceRef.current.getZoom() > 16) mapInstanceRef.current.setZoom(16); 
                    window.google.maps.event.removeListener(listener); 
                });
            }
        }
    }, [isApiLoaded, shops, userLocation]);

    if (apiError) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-700 text-center p-4">
                <p className="text-red-600 dark:text-red-400">
                    {apiError}
                </p>
            </div>
        );
    }
    
    return <div ref={mapContainerRef} className="w-full h-full" />;
};

export default MapView;
