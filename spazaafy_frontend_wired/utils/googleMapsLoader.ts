import { SpazaShop } from '../types';

const SCRIPT_ID = 'googleMapsApi';
const API_KEY = 'AIzaSyCgopEvYZT1tPM7P2TC6l_figAkmLp-k6c';
const SCRIPT_URL = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`;

let promise: Promise<void> | null = null;

export const loadGoogleMapsApi = (): Promise<void> => {
    if (promise) {
        return promise;
    }
    
    promise = new Promise((resolve, reject) => {
        if (typeof window.google !== 'undefined' && typeof window.google.maps !== 'undefined') {
            resolve();
            return;
        }

        const existingScript = document.getElementById(SCRIPT_ID);
        if (existingScript) {
             existingScript.addEventListener('load', () => resolve());
             existingScript.addEventListener('error', (e) => reject(e));
             return;
        }

        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.id = SCRIPT_ID;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
            resolve();
        };
        script.onerror = (error) => {
            promise = null; // Allow retrying
            reject(new Error(`Google Maps script failed to load: ${error}`));
        };

        document.head.appendChild(script);
    });
    
    return promise;
};
