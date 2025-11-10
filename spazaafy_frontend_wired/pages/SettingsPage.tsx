// src/pages/SettingsPage.tsx

import React from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../components/Header';
import Card from '../components/Card';
import { useAuth } from '../hooks/useAuth';

const SettingsPage: React.FC = () => {
    const { theme, toggleTheme } = useAuth();
    const { t, i18n } = useTranslation();

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const lang = event.target.value;
        i18n.changeLanguage(lang);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-dark-bg">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="max-w-2xl mx-auto">
                    <Card title={t('settings.title')}>
                        <div className="space-y-6">
                            {/* Theme Toggle */}
                            <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-input/70">
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white">{t('settings.theme.title')}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.theme.description')}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={toggleTheme}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                                        theme === 'dark' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                            theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            
                            {/* Language Selection */}
                            <div className="flex justify-between items-center p-4 rounded-lg bg-gray-50 dark:bg-dark-input/70">
                                <div>
                                    <h4 className="font-semibold text-gray-800 dark:text-white">{t('settings.language.title')}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('settings.language.description')}</p>
                                </div>
                                <select 
                                    className="rounded-md border-gray-300 dark:border-dark-surface bg-white dark:bg-dark-input text-gray-800 dark:text-gray-200 shadow-sm focus:border-dark-border focus:ring-dark-border"
                                    value={i18n.language}
                                    onChange={handleLanguageChange}
                                >
                                    <option value="en">English</option>
                                    <option value="zu">isiZulu</option>
                                    <option value="xh">isiXhosa</option>
                                    <option value="st">Sesotho</option>
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