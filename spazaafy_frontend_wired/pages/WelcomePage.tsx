// src/pages/WelcomePage.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const WelcomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex flex-col items-center justify-center p-4">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold text-primary dark:text-primary">
                    Spazaafy
                </h1>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">Trust your spaza. Spazaafy it!</p>
            </div>

            <div className="w-full max-w-md mx-auto">
                <Card className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Join our Network</h2>
                    <div className="space-y-4">
                        <Link to="/register" state={{ role: 'consumer' }} className="block w-full text-center py-3 px-4 text-lg font-semibold rounded-md text-white bg-primary hover:bg-primary-dark transition-colors">
                            I'm a Consumer
                        </Link>
                        <Link to="/register" state={{ role: 'shop_owner' }} className="block w-full text-center py-3 px-4 text-lg font-semibold rounded-md text-white bg-secondary hover:bg-secondary-dark transition-colors">
                            I'm a Spaza Shop Owner
                        </Link>
                    </div>
                </Card>

                <p className="mt-8 text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default WelcomePage;