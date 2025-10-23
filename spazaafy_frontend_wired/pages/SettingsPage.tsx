
import React from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useAuth();
    
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="max-w-2xl mx-auto">
                    <Card title="Settings">
                        <div className="space-y-6">
                            {/* Theme Toggle */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white">Theme</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode.</p>
                                </div>
                                <button
                                    onClick={toggleTheme}
                                    className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-200 dark:bg-gray-700"
                                >
                                    <span className={`${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'} inline-block w-4 h-4 transform bg-white rounded-full transition-transform`} />
                                </button>
                            </div>
                            
                            {/* Language Selection */}
                            <div className="flex justify-between items-center">
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white">Language</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Choose your preferred language.</p>
                                </div>
                                <select className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-sm focus:border-primary focus:ring-primary">
                                    <option>English</option>
                                    <option disabled>isiZulu (coming soon)</option>
                                    <option disabled>isiXhosa (coming soon)</option>
                                </select>
                            </div>

                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

export default SettingsPage;
