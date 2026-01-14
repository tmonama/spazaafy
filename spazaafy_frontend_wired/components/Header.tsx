// Header.tsx
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import Button from './Button';
import AdminMenuToggle from './AdminMenuToggle';

// ✅ Add these:
import { useAlerts } from '../components/AlertsContext';
import NotificationDot from './NotificationDot';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { alerts } = useAlerts();             // ✅ subscribe to alert counts
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath =
    user?.role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard';

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  const navLinkClasses =
    'px-3 py-2 rounded-md text-sm font-medium transition-colors';
  const activeNavLinkClasses =
    'bg-primary-light/20 text-primary dark:bg-primary-dark/30 dark:text-primary-light';
  const inactiveNavLinkClasses =
    'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${navLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`;

  const mobileNavLinkClasses =
    'block px-3 py-2 rounded-md text-base font-medium';
  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${mobileNavLinkClasses} ${isActive ? activeNavLinkClasses : inactiveNavLinkClasses}`;

  return (
    <header className="bg-white dark:bg-dark-surface shadow-md sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* LEFT */}
        <div className="flex items-center">
          {user?.role === UserRole.ADMIN && <AdminMenuToggle />}
          <NavLink
            to={dashboardPath}
            className="flex-shrink-0 flex items-center space-x-2 ml-2 lg:ml-0"
          >
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              {/* logo svg */}
              <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm-2.25 7.082a.75.75 0 00.22 1.03l3.25 2.5a.75.75 0 001.03-.22l4.5-6.5a.75.75 0 00-1.03-1.03l-3.97 5.75-2.72-2.176a.75.75 0 00-1.03.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800 dark:text-white">Spazaafy</span>
          </NavLink>
        </div>

        {/* CENTER/RIGHT (desktop) */}
        <div className="hidden lg:flex items-center space-x-4">
          {user?.role !== UserRole.ADMIN && (
            <div className="flex items-baseline space-x-4">
              <NavLink to={dashboardPath} className={getNavLinkClass}>
                {t('header.dashboard')}
              </NavLink>

              {/* ✅ ADD THIS BLOCK: Assistance Link (Desktop) */}
              {user?.role === UserRole.SHOP_OWNER && (
                <NavLink to="/request-assistance" className={getNavLinkClass}>
                   {t('header.assistance', 'Assistance')}
                </NavLink>
              )}

              {/* ✅ Wrap in relative so the dot can anchor absolutely */}
              <div className="relative inline-block">
                <NavLink to="/support" className={getNavLinkClass}>
                  {t('header.support')}
                </NavLink>
                {/* ✅ Dot in header */}
                <NotificationDot count={alerts.unreadTickets} showCount={false} />
              </div>

              <NavLink to="/settings" className={getNavLinkClass}>
                {t('header.settings')}
              </NavLink>
            </div>
          )}
          <span className="text-gray-600 dark:text-gray-300 text-sm">
            {t('header.welcome', { name: user?.firstName })}
          </span>
          <NavLink
            to="/account"
            className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light p-2 rounded-full"
          >
            <svg className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zM12 12a2 2 0 100-4h-4a2 2 0 100 4h4z"
                clipRule="evenodd"
              />
            </svg>
          </NavLink>
          <Button onClick={handleLogout} variant="secondary" size="sm">
            {t('header.logout')}
          </Button>
        </div>

        {/* RIGHT (mobile hamburger) */}
        <div className="-mr-2 flex lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
          >
            <span className="sr-only">Open main menu</span>
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="lg:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user?.role !== UserRole.ADMIN && (
              <>
                <NavLink
                  to={dashboardPath}
                  className={getMobileNavLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('header.dashboard')}
                </NavLink>

                 {/* ✅ ADD THIS BLOCK: Assistance Link (Mobile) */}
                {user?.role === UserRole.SHOP_OWNER && (
                  <NavLink
                    to="/request-assistance"
                    className={getMobileNavLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('header.assistance', 'Assistance')}
                  </NavLink>
                )}

                {/* ✅ Mobile: show the dot too (count visible is fine on mobile) */}
                <div className="relative inline-block">
                  <NavLink
                    to="/support"
                    className={getMobileNavLinkClass}
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('header.support')}
                  </NavLink>
                  <NotificationDot count={alerts.unreadTickets} showCount />
                </div>

                <NavLink
                  to="/settings"
                  className={getMobileNavLinkClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('header.settings')}
                </NavLink>
              </>
            )}
          </div>
          {/* ✅ ADD THIS SECTION: Mobile Profile & Logout */}
          <div className="pt-4 pb-4 border-t border-gray-200 dark:border-dark-border">
            <div className="flex items-center px-5">
              <div className="flex-shrink-0">
                 {/* Simple Avatar Icon */}
                <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-bold">
                    {user?.firstName?.charAt(0) || "U"}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium leading-none text-gray-800 dark:text-white">
                    {user?.firstName} {user?.lastName}
                </div>
                <div className="text-sm font-medium leading-none text-gray-500 dark:text-gray-400 mt-1">
                    {user?.email}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <NavLink
                to="/account"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setMenuOpen(false)}
              >
                {t('header.account', 'Your Profile')}
              </NavLink>
              
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {t('header.logout')}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
