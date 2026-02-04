// src/pages/WelcomePage.tsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// Asset Paths
const WELCOME_BG = '/media/welcome gradient.png';
const PHONE_MOCKUP = '/media/phone-mockup.png';
const APP_DOWNLOAD_URL = 'https://spazaafy.co.za/download';
const APK_DOWNLOAD_URL = '/spazaafy.apk';

const WelcomePage: React.FC = () => {
  // -------------------------------------------------------
  // STATE MANAGEMENT
  // -------------------------------------------------------
  
  // We check sessionStorage to see if the user has already seen the intro in this session.
  // If 'true', we skip the full-screen animation.
  const hasSeenIntro = sessionStorage.getItem('spazaafy_intro_seen');
  
  // 'isAnimating' controls the layout state (Full screen vs Split screen)
  const [isAnimating, setIsAnimating] = useState(!hasSeenIntro);
  
  // 'showContent' controls the visibility of the text inside the layout
  const [showContent, setShowContent] = useState(!hasSeenIntro);
  
  // Popup states
  const [showPopup, setShowPopup] = useState(false);
  const [animatePopup, setAnimatePopup] = useState(false);

  useEffect(() => {
    if (!hasSeenIntro) {
      // --- ANIMATION SEQUENCE FOR FRESH LOAD ---

      // 1. After 2.5 seconds, start sliding the panel to the left
      const slideTimer = setTimeout(() => {
        setIsAnimating(false); // This triggers the CSS width transition
        sessionStorage.setItem('spazaafy_intro_seen', 'true');
      }, 2500);

      // 2. Shortly after slide starts, show the right-side form content
      const contentTimer = setTimeout(() => {
        setShowContent(false); 
      }, 2500);

      // 3. Show popup after everything settles (approx 4.5s total)
      const popupTimer = setTimeout(() => {
        setShowPopup(true);
        setTimeout(() => setAnimatePopup(true), 100);
      }, 4500);

      return () => {
        clearTimeout(slideTimer);
        clearTimeout(contentTimer);
        clearTimeout(popupTimer);
      };
    } else {
      // --- NO ANIMATION (Already seen) ---
      // Show popup after a short delay if coming back
      const popupTimer = setTimeout(() => {
        setShowPopup(true);
        setTimeout(() => setAnimatePopup(true), 100);
      }, 1000);
      return () => clearTimeout(popupTimer);
    }
  }, [hasSeenIntro]);

  const handleClosePopup = () => {
    setAnimatePopup(false);
    setTimeout(() => setShowPopup(false), 300);
  };

  return (
    <>
      {/* 
        ------------------------------------------------------------
        CSS STYLES
        ------------------------------------------------------------
      */}
      <style>{`
        /* Slower Pan Animation (30s) */
        @keyframes panImage {
          0% { object-position: 50% 0%; }
          100% { object-position: 50% 100%; }
        }
        
        /* Blur Fade In for the word "Welcome" */
        @keyframes blurFadeIn {
          0% { opacity: 0; filter: blur(20px); transform: scale(0.95); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }

        .animate-pan-slow {
          animation: panImage 30s ease-out forwards;
        }

        .animate-blur-fade {
          animation: blurFadeIn 1.5s ease-out forwards;
        }
      `}</style>

      <div className="relative min-h-screen w-full bg-white dark:bg-dark-bg flex overflow-hidden font-sans">
        
        {/* 
          ------------------------------------------------------------
          LEFT PANEL (Background & Welcome Text)
          ------------------------------------------------------------
          Logic: 
          - If isAnimating is true: Width is 100vw (Full Screen)
          - If isAnimating is false: Width is 50% (Split Screen on Desktop)
          - Transition duration handles the "Slide to Left" effect
        */}
        <div 
          className={`
            relative flex-shrink-0 h-screen overflow-hidden bg-green-500
            transition-all duration-[1200ms] ease-in-out
            ${isAnimating ? 'w-[100vw]' : 'w-full md:w-1/2 hidden md:block'}
          `}
        >
          {/* Background Image */}
          <div className="absolute inset-0 w-full h-full">
            <img 
              src={WELCOME_BG} 
              alt="Welcome Gradient" 
              className="w-full h-full object-cover animate-pan-slow"
            />
          </div>

          {/* Centered Welcome Text */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <h1 className="text-6xl md:text-8xl font-bold text-white tracking-wide animate-blur-fade">
              Welcome
            </h1>
          </div>
        </div>

        {/* 
          ------------------------------------------------------------
          RIGHT PANEL (Form Content)
          ------------------------------------------------------------
          Logic:
          - Hidden/Zero width during initial animation
          - Expands/Fades in when animation finishes
        */}
        <div 
          className={`
            flex-1 flex flex-col h-screen overflow-y-auto bg-white dark:bg-gray-900 relative
            transition-all duration-[1200ms] ease-in-out
            ${isAnimating ? 'opacity-0 translate-x-20 w-0' : 'opacity-100 translate-x-0 w-full md:w-1/2'}
          `}
        >
          
          {/* Header Links */}
          <header className="flex justify-end items-center p-6 space-x-6 text-sm font-medium text-gray-600 dark:text-gray-300">
            <Link to="/about" className="hover:text-primary transition-colors">About us</Link>
            {/* Updated Privacy Link */}
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <a 
              href={APP_DOWNLOAD_URL} 
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded shadow transition-transform hover:scale-105"
            >
              App Download
            </a>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex flex-col items-center justify-center px-6 md:px-12 w-full max-w-lg mx-auto">
            
            <div className="text-center mb-10">
              <h1 className="text-5xl font-extrabold text-green-500 mb-2">
                Spazaafy
              </h1>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                Trust your spaza. Spazaafy it!
              </p>
            </div>

            <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white text-center mb-8">
                Create an Account
              </h2>
              
              <div className="space-y-4">
                <Link
                  to="/register"
                  state={{ role: 'consumer' }}
                  className="group flex items-center justify-center w-full py-3 px-4 border-2 border-green-500 text-lg font-medium rounded-lg text-gray-700 dark:text-white hover:bg-green-50 dark:hover:bg-gray-700 transition-all"
                >
                  I'm a consumer
                </Link>

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
          DOWNLOAD POPUP (Modal)
          ------------------------------------------------------------
        */}
        {showPopup && (
          <div 
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-500 px-4 ${
              animatePopup ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6 md:p-8 transform transition-transform duration-500 scale-100">
              
              <button 
                onClick={handleClosePopup}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label="Close popup"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>

              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                
                {/* Phone Image */}
                <div className="flex-shrink-0 w-32 md:w-44">
                  <img 
                    src={PHONE_MOCKUP} 
                    alt="App Preview" 
                    className="w-full h-auto drop-shadow-xl transform -rotate-2 hover:rotate-0 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center text-center md:text-left pt-2">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    Download the app!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
                    Click on the link below to download the mobile app and start your journey.
                  </p>
                  
                  <div className="flex flex-col space-y-4 items-center md:items-start">
                    {/* Option 1: APK Download Button */}
                    <a
                      href={APK_DOWNLOAD_URL}
                      download="Spazaafy.apk"
                      className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-semibold text-white bg-gradient-to-r from-green-500 to-green-600 shadow-md hover:shadow-lg hover:opacity-95 transition-all transform hover:-translate-y-0.5"
                    >
                      Download App
                    </a>

                    {/* Option 2: Website Link */}
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Or visit{' '}
                      <a 
                        href={APP_DOWNLOAD_URL}
                        target="_blank"
                        rel="noreferrer" 
                        className="text-green-600 underline hover:text-green-700"
                      >
                        spazaafy.co.za/download
                      </a>
                    </p>
                  </div>
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