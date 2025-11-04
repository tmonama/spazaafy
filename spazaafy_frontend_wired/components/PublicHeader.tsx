// src/components/PublicHeader.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const PublicHeader: React.FC = () => {
    return (
        <header className="py-4">
            <div className="container mx-auto px-4 flex justify-center">
                <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm-2.25 7.082a.75.75 0 00.22 1.03l3.25 2.5a.75.75 0 001.03-.22l4.5-6.5a.75.75 0 00-1.03-1.03l-3.97 5.75-2.72-2.176a.75.75 0 00-1.03.22z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">Spazaafy</span>
                </Link>
            </div>
        </header>
    );
};

export default PublicHeader;