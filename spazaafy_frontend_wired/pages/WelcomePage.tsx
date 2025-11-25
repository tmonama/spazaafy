// src/pages/WelcomePage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const APP_DOWNLOAD_URL = 'https://spazaafy.co.za/download';

const WelcomePage: React.FC = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [animatePopup, setAnimatePopup] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds
    const timer = setTimeout(() => {
      setShowPopup(true);
      // Small delay so the opacity transition can kick in
      setTimeout(() => setAnimatePopup(true), 50);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    // Fade out
    setAnimatePopup(false);
    // Remove from DOM after animation
    setTimeout(() => setShowPopup(false), 300);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex flex-col">
      {/* Popup overlay */}
      {showPopup && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-500 ${
            animatePopup ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full max-w-md px-4">
            <Card className="relative text-center">
              {/* Close button */}
              <button
                type="button"
                onClick={handleClose}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Close download popup"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Get the Spazaafy App
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                For the best experience, download our app and manage your spaza
                journey on the go.
              </p>

              <a
                href={APP_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full text-center py-3 px-4 text-lg font-semibold rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                Download the App
              </a>

              <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Or visit{' '}
                <a
                  href={APP_DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-primary dark:text-primary-light"
                >
                  spazaafy.co.za/download
                </a>
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* MAIN AREA (takes available height, footer sits below) */}
      <main className="flex-1 flex flex-col items-center p-4 relative">
        {/* Hero */}
        <div className="text-center mt-16 mb-12">
          <h1 className="text-5xl font-extrabold text-primary dark:text-primary">
            Spazaafy
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Trust your spaza. Spazaafy it!
          </p>
        </div>

        {/* Card + login */}
        <div className="w-full max-w-md mx-auto">
          <Card className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Join our Network
            </h2>
            <div className="space-y-4">
              <Link
                to="/register"
                state={{ role: 'consumer' }}
                className="block w-full text-center py-3 px-4 text-lg font-semibold rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                I'm a Consumer
              </Link>
              <Link
                to="/register"
                state={{ role: 'shop_owner' }}
                className="block w-full text-center py-3 px-4 text-lg font-semibold rounded-md text-white bg-secondary hover:bg-secondary-dark transition-colors"
              >
                I'm a Spaza Shop Owner
              </Link>
            </div>
          </Card>

          <p className="mt-10 text-center text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-primary"
            >
              Log in
            </Link>
          </p>
        </div>
      </main>

      {/* FOOTER (true bottom footer, small bottom gap) */}
      <footer className="pb-6 pt-6 flex flex-col items-center space-y-4">
        <Link
          to="/about"
          className="text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light underline"
        >
          About us
        </Link>

        {/* Social icons */}
        <div className="flex items-center space-x-4">
          <SocialIconLink href="https://www.instagram.com/spazaafy/" label="Instagram">
            I
          </SocialIconLink>
          <SocialIconLink href="https://x.com/spazaafy" label="X (Twitter)">
            X
          </SocialIconLink>
          <SocialIconLink href="https://www.tiktok.com/@spazaafy" label="TikTok">
            T
          </SocialIconLink>
        </div>

        {/* Copyright */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Spazaafy. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

interface SocialIconLinkProps {
  href: string;
  label: string;
  children: React.ReactNode;
}

const SocialIconLink: React.FC<SocialIconLinkProps> = ({
  href,
  label,
  children,
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className="h-9 w-9 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-gray-900 hover:bg-primary dark:hover:bg-primary transition-colors"
  >
    {children}
  </a>
);

export default WelcomePage;
