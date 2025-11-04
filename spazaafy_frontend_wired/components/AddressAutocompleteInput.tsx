import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../utils/googleMapsLoader';
import Input from './Input';

interface AddressAutocompleteInputProps {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    // ✅ 1. Add a new prop to handle the selected place data
    onPlaceSelect: (address: string, lat: number, lng: number) => void;
    required?: boolean;
}

const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({ label, id, value, onChange, onPlaceSelect, ...props }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isApiLoaded, setIsApiLoaded] = useState(false);
    
    useEffect(() => {
        loadGoogleMapsApi()
            .then(() => setIsApiLoaded(true))
            .catch(error => console.error("Could not load Google Maps API for autocomplete.", error));
    }, []);

    useEffect(() => {
        if (isApiLoaded && inputRef.current) {
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                componentRestrictions: { country: 'za' }, // Restrict to South Africa
                // ✅ 2. Ask Google for the geometry (lat/lng) in addition to the address
                fields: ['formatted_address', 'geometry.location'],
                types: ['address'],
            });

            const listener = autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                // ✅ 3. When a place is selected, get the coordinates and call the new prop
                if (place && place.formatted_address && place.geometry?.location) {
                    const lat = place.geometry.location.lat();
                    const lng = place.geometry.location.lng();
                    onPlaceSelect(place.formatted_address, lat, lng);
                }
            });

            return () => {
                // It's good practice to clear listeners to prevent memory leaks
                window.google.maps.event.clearInstanceListeners(autocomplete);
            };
        }
    }, [isApiLoaded, onPlaceSelect]);
    
    return (
        <Input
            ref={inputRef}
            label={label}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            {...props}
        />
    );
};

export default AddressAutocompleteInput;
