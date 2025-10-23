import React, { useEffect, useRef, useState } from 'react';
import { loadGoogleMapsApi } from '../utils/googleMapsLoader';
import Input from './Input';

interface AddressAutocompleteInputProps {
    label: string;
    id: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
}

const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({ label, id, value, onChange, ...props }) => {
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
                fields: ['formatted_address'],
                types: ['address'],
            });

            const listener = autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place && place.formatted_address) {
                    onChange(place.formatted_address);
                }
            });

            return () => {
                window.google.maps.event.clearInstanceListeners(autocomplete);
            };
        }
    }, [isApiLoaded, onChange]);
    
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
