// src/pages/WelcomePage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Asset Paths
const WELCOME_BG = '/media/welcome gradient.png';
const PHONE_MOCKUP = '/media/phone-mockup.png';
const APP_DOWNLOAD_URL = 'https://spazaafy.co.za/download';

const WelcomePage: React.FC = () => {
  // State for the initial splash screen animation
  const [showSplash, setShowSplash] = useState(true);
  const [fadeSplash, setFadeSplash] = useState(false);

  // State for the popup
  const [showPopup, setShowPopup] = useState(false);
  const [animatePopup, setAnimatePopup] = useState(false);

  useEffect(() => {
    // 1. Initial Splash Screen Timeline
    // Allow the pan/blur animation to run for ~2.5 seconds, then fade out
    const splashTimer = setTimeout(() => {
      setFadeSplash(true); // Start fading out the overlay
      setTimeout(() => {
        setShowSplash(false); // Remove overlay from DOM
      }, 800); // Wait for CSS transition to finish
    }, 3000);

    // 2. Popup Timeline
    // Show popup shortly after the splash screen finishes
    const popupTimer = setTimeout(() => {
      setShowPopup(true);
      setTimeout(() => setAnimatePopup(true), 100);
    }, 4500);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(popupTimer);
    };
  }, []);

  const handleClosePopup = () => {
    setAnimatePopup(false);
    setTimeout(() => setShowPopup(false), 300);
  };

  return (
    <>
      {/* 
        ------------------------------------------------------------
        CSS STYLES FOR ANIMATIONS 
        (In a real app, you might put this in a CSS file or Tailwind config)
        ------------------------------------------------------------
      */}
      <style>{`
        @keyframes panImage {
          0% { object-position: 50% 0%; }
          100% { object-position: 50% 100%; }
        }
        @keyframes blurFadeIn {
          0% { opacity: 0; filter: blur(20px); transform: scale(0.95); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
        .animate-pan {
          animation: panImage 4s ease-out forwards;
        }
        .animate-blur-fade {
          animation: blurFadeIn 1.5s ease-out forwards;
        }
      `}</style>

      <div className="relative min-h-screen w-full bg-white dark:bg-dark-bg flex flex-col md:flex-row overflow-hidden font-sans">
        
        {/* 
          ------------------------------------------------------------
          1. SPLASH OVERLAY (Mobile & Desktop Initial State)
          ------------------------------------------------------------
        */}
        {showSplash && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-700 ease-in-out ${
              fadeSplash ? 'opacity-0' : 'opacity-100'
            }`}
          >
            {/* Background Image with Pan Animation */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
               <img 
                 src={WELCOME_BG} 
                 alt="Background" 
                 className="w-full h-full object-cover animate-pan"
               />
            </div>
            {/* Centered Text with Blur Fade In */}
            <h1 className="relative z-10 text-6xl md:text-8xl font-bold text-white animate-blur-fade tracking-wide">
              Welcome
            </h1>
          </div>
        )}


        {/* 
          ------------------------------------------------------------
          2. LEFT PANEL (Desktop Only Visuals)
          This stays visible on desktop after splash fades
          ------------------------------------------------------------
        */}
        <div className="hidden md:block w-1/2 relative h-screen">
          <img 
            src={WELCOME_BG} 
            alt="Welcome Gradient" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-7xl font-bold text-white tracking-wide">
              Welcome
            </h1>
          </div>
        </div>

        {/* 
          ------------------------------------------------------------
          3. RIGHT PANEL (Content Area)
          Contains Navigation, Form, and Footer
          ------------------------------------------------------------
        */}
        <div className="w-full md:w-1/2 flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900 relative">
          
          {/* Header Links */}
          <header className="flex justify-end items-center p-6 space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link to="/about" className="hover:text-primary transition-colors">About us</Link>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <a 
              href={APP_DOWNLOAD_URL} 
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow transition-transform hover:scale-105"
            >
              App Download
            </a>
          </header>

          {/* Main Content Centered Vertically */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 w-full max-w-lg mx-auto">
            
            {/* Logo / Heading */}
            <div className="text-center mb-10">
              <h1 className="text-5xl font-extrabold text-green-500 mb-2">
                Spazaafy
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Trust your spaza. Spazaafy it!
              </p>
            </div>

            {/* Action Card */}
            <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center mb-8">
                Create an Account
              </h2>
              
              <div className="space-y-4">
                {/* Consumer Button (Outline Style) */}
                <Link
                  to="/register"
                  state={{ role: 'consumer' }}
                  className="group flex items-center justify-center w-full py-3 px-4 border-2 border-green-500 text-lg font-medium rounded-lg text-gray-700 dark:text-white hover:bg-green-50 dark:hover:bg-gray-700 transition-all"
                >
                  I'm a consumer
                </Link>

                {/* Shop Owner Button (Outline Style - Red/Orange) */}
                <Link
                  to="/register"
                  state={{ role: 'shop_owner' }}
                  className="group flex items-center justify-center w-full py-3 px-4 border-2 border-red-500 text-lg font-medium rounded-lg text-gray-700 dark:text-white hover:bg-red-50 dark:hover:bg-gray-700 transition-all"
                >
                  I'm a Spaza shop owner
                </Link>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-green-600 font-semibold hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="py-6 flex flex-col items-center space-y-4 border-t border-gray-100 dark:border-gray-800 mt-auto">
            <div className="flex space-x-6 text-gray-400">
              <a href="https://www.instagram.com/spazaafy/" target="_blank" rel="noreferrer" className="hover:text-green-500 transition-colors">Instagram</a>
              <a href="https://www.tiktok.com/@spazaafy" target="_blank" rel="noreferrer" className="hover:text-green-500 transition-colors">TikTok</a>
              <a href="https://x.com/spazaafy" target="_blank" rel="noreferrer" className="hover:text-green-500 transition-colors">Twitter</a>
            </div>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} Spazaafy. All rights reserved.
            </p>
          </footer>
        </div>

        {/* 
          ------------------------------------------------------------
          4. DOWNLOAD POPUP (Modal)
          ------------------------------------------------------------
        */}
        {showPopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-500 px-4 ${
              animatePopup ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 transform transition-transform duration-500 scale-100">
              
              {/* Close Button */}
              <button 
                onClick={handleClosePopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                
                {/* Left: Phone Image */}
                <div className="flex-shrink-0 w-32 md:w-48">
                  <img 
                    src={PHONE_MOCKUP} 
                    alt="App Preview" 
                    className="w-full h-auto drop-shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300"
                  />
                </div>

                {/* Right: Text & Action */}
                <div className="flex-1 flex flex-col justify-center text-center md:text-left pt-4">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Download the app!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm md:text-base leading-relaxed">
                    Click on the link below to download the mobile app and start your journey.
                  </p>
                  
                  <a 
                    href={APP_DOWNLOAD_URL}
                    className="inline-block w-full md:w-auto text-center bg-transparent border-2 border-green-500 text-green-600 font-bold py-3 px-8 rounded-lg hover:bg-green-500 hover:text-white transition-all duration-300 shadow-sm"
                  >
                    Download App
                  </a>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default WelcomePage;