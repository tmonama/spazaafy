import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Button from './Button';

const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const dashboardPath = user?.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard';

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    
    const navLinkClasses = "px-3 py-2 rounded-md text-sm font-medium transition-colors";
    const activeNavLinkClasses = "bg-primary-light/20 text-primary dark:bg-primary-dark/30 dark:text-primary-light";
    const inactiveNavLinkClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700";
    
    const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
        `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`;

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <NavLink to={dashboardPath} className="flex-shrink-0 flex items-center space-x-2">
                             <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="http://www.w3.org/2000/svg" fill="currentColor">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm-2.25 7.082a.75.75 0 00.22 1.03l3.25 2.5a.75.75 0 001.03-.22l4.5-6.5a.75.75 0 00-1.03-1.03l-3.97 5.75-2.72-2.176a.75.75 0 00-1.03.22z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold text-gray-800 dark:text-white">Spazaafy</span>
                        </NavLink>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <NavLink to={dashboardPath} className={getNavLinkClass}>Dashboard</NavLink>
                            <NavLink to="/support" className={getNavLinkClass}>Support</NavLink>
                            <NavLink to="/settings" className={getNavLinkClass}>Settings</NavLink>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center space-x-4">
                         <span className="text-gray-600 dark:text-gray-300 text-sm">Welcome, {user?.firstName}</span>
                         <NavLink to="/account" className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM12 12a2 2 0 100-4h-4a2 2 0 100 4h4z" clipRule="evenodd" />
                            </svg>
                         </NavLink>
                         <Button onClick={handleLogout} variant="secondary" size="sm">Logout</Button>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button 
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white"
                        >
                            {/* Icon for menu */}
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="http://www.w3.org/2000/svg">
                                {menuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <NavLink to={dashboardPath} className={getNavLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>
                        <NavLink to="/support" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>Support</NavLink>
                        <NavLink to="/settings" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>Settings</NavLink>
                        <NavLink to="/account" className={getNavLinkClass} onClick={() => setMenuOpen(false)}>My Account</NavLink>
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center px-5">
                             <div>
                                <div className="text-base font-medium text-gray-800 dark:text-white">{user?.firstName} {user?.lastName}</div>
                                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user?.email}</div>
                            </div>
                        </div>
                        <div className="mt-3 px-2 space-y-1">
                             <Button onClick={handleLogout} variant="secondary" size="sm" className="w-full text-left px-3 py-2">Logout</Button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;