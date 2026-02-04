// src/pages/WelcomePage.tsx

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const APP_DOWNLOAD_URL = 'https://spazaafy.co.za/download';
const WELCOME_GRADIENT_SRC = '/media/welcome gradient.png';
const PHONE_MOCKUP_SRC = '/media/phone-mockup.png';

type IntroPhase = 'intro' | 'main';

const WelcomePage: React.FC = () => {
  const [phase, setPhase] = useState<IntroPhase>('intro');

  // Intro animation flags
  const [introWelcomeVisible, setIntroWelcomeVisible] = useState(false);
  const [introFadeOut, setIntroFadeOut] = useState(false);

  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [animatePopup, setAnimatePopup] = useState(false);

  const canShowMain = useMemo(() => phase === 'main', [phase]);

  useEffect(() => {
    // --- INTRO TIMELINE ---
    // 0ms: background pan starts via CSS keyframes
    // 250ms: "Welcome" blur-fade in
    // 1750ms: fade out intro overlay
    // 2100ms: switch to main
    const t1 = setTimeout(() => setIntroWelcomeVisible(true), 250);
    const t2 = setTimeout(() => setIntroFadeOut(true), 1750);
    const t3 = setTimeout(() => setPhase('main'), 2100);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    // Show popup shortly after main appears
    if (!canShowMain) return;

    const timer = setTimeout(() => {
      openDownloadPopup();
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canShowMain]);

  const openDownloadPopup = () => {
    setShowPopup(true);
    setTimeout(() => setAnimatePopup(true), 50);
  };

  const handleClosePopup = () => {
    setAnimatePopup(false);
    setTimeout(() => setShowPopup(false), 250);
  };

  return (
    <div className="relative min-h-screen bg-gray-100 dark:bg-dark-bg">
      {/* Local keyframes (kept inside file so you don't need extra CSS files) */}
      <style>{`
        @keyframes spz-bg-pan {
          0% { background-position: 50% 0%; }
          100% { background-position: 50% 100%; }
        }
        .spz-animate-bg-pan {
          animation: spz-bg-pan 1.8s ease-in-out forwards;
          background-size: cover;
          background-repeat: no-repeat;
        }

        @keyframes spz-welcome-in {
          0% { opacity: 0; filter: blur(14px); transform: translateY(10px); }
          100% { opacity: 1; filter: blur(0px); transform: translateY(0px); }
        }
        .spz-welcome-in {
          animation: spz-welcome-in 900ms ease-out forwards;
        }
      `}</style>

      {/* INTRO OVERLAY */}
      <div
        className={[
          'fixed inset-0 z-[60] flex items-center justify-center',
          'transition-opacity duration-500',
          introFadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100',
        ].join(' ')}
        style={{
          backgroundImage: `url(${WELCOME_GRADIENT_SRC})`,
        }}
      >
        <div
          className="absolute inset-0 spz-animate-bg-pan"
          style={{
            backgroundImage: `url(${WELCOME_GRADIENT_SRC})`,
          }}
        />
        <div className="relative z-10 px-6 text-center">
          <h1
            className={[
              'text-white font-extrabold tracking-tight',
              'text-5xl sm:text-6xl md:text-7xl',
              introWelcomeVisible ? 'spz-welcome-in' : 'opacity-0',
            ].join(' ')}
          >
            Welcome
          </h1>
        </div>
      </div>

      {/* POPUP OVERLAY (DOWNLOAD) */}
      {showPopup && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-300 ${
            animatePopup ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-full max-w-3xl px-4">
            <div className="relative rounded-3xl bg-white dark:bg-dark-card shadow-xl overflow-hidden">
              {/* Close */}
              <button
                type="button"
                onClick={handleClosePopup}
                className="absolute right-4 top-4 h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 flex items-center justify-center text-gray-700 dark:text-gray-200"
                aria-label="Close download popup"
              >
                ✕
              </button>

              <div className="p-8 sm:p-10">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 dark:text-white text-center">
                  Download the app!
                </h2>

                <div className="mt-8 flex flex-col md:flex-row items-center md:items-stretch gap-8">
                  {/* Phone mockup */}
                  <div className="w-full md:w-[42%] flex items-center justify-center">
                    <img
                      src={PHONE_MOCKUP_SRC}
                      alt="Spazaafy app phone mockup"
                      className="w-[210px] sm:w-[240px] md:w-[260px] h-auto select-none"
                      draggable={false}
                    />
                  </div>

                  {/* Copy + CTA */}
                  <div className="w-full md:w-[58%] flex flex-col justify-center items-center md:items-start text-center md:text-left">
                    <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 leading-snug">
                      Click on the link below to
                      <br />
                      download the mobile app
                    </p>

                    <a
                      href={APP_DOWNLOAD_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center justify-center px-10 py-3 rounded-xl border-2 border-primary text-primary font-semibold text-lg hover:bg-primary hover:text-white transition-colors"
                    >
                      Download App
                    </a>

                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Or visit{' '}
                      <a
                        href={APP_DOWNLOAD_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-primary"
                      >
                        spazaafy.co.za/download
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN PAGE */}
      <div className="min-h-screen flex flex-col">
        {/* Top nav */}
        <header className="w-full bg-transparent">
          <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-end gap-8">
            <Link
              to="/about"
              className="text-base text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light"
            >
              About us
            </Link>
            <Link
              to="/privacy-policy"
              className="text-base text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light"
            >
              Privacy Policy
            </Link>

            <button
              type="button"
              onClick={openDownloadPopup}
              className="px-4 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
            >
              App Download
            </button>
          </div>
        </header>

        {/* Body split */}
        <main className="flex-1 w-full">
          <div className="h-full flex flex-col md:flex-row">
            {/* LEFT IMAGE PANEL (desktop) */}
            <section
              className="hidden md:block md:w-1/2"
              style={{
                backgroundImage: `url(${WELCOME_GRADIENT_SRC})`,
                backgroundSize: 'cover',
                backgroundPosition: '50% 50%',
                backgroundRepeat: 'no-repeat',
              }}
            >
              <div className="h-full flex items-center justify-center px-10">
                <h1 className="text-white text-7xl font-extrabold tracking-tight">
                  Welcome
                </h1>
              </div>
            </section>

            {/* RIGHT CONTENT */}
            <section className="w-full md:w-1/2 bg-gray-50 dark:bg-dark-bg flex flex-col items-center justify-center px-4 py-10">
              <div className="w-full max-w-md flex flex-col items-center">
                <div className="text-center mb-10">
                  <h1 className="text-5xl font-extrabold text-primary">Spazaafy</h1>
                  <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                    Trust your spaza. Spazaafy it!
                  </p>
                </div>

                <Card className="w-full text-center rounded-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                    Create an Account
                  </h2>

                  <div className="space-y-4">
                    <Link
                      to="/register"
                      state={{ role: 'consumer' }}
                      className="block w-full text-center py-3 px-4 text-lg font-semibold rounded-xl border-2 border-primary text-gray-800 dark:text-white hover:bg-primary hover:text-white transition-colors"
                    >
                      I’m a consumer
                    </Link>

                    <Link
                      to="/register"
                      state={{ role: 'shop_owner' }}
                      className="block w-full text-center py-3 px-4 text-lg font-semibold rounded-xl border-2 border-red-500 text-gray-800 dark:text-white hover:bg-red-500 hover:text-white transition-colors"
                    >
                      I’m a Spaza shop owner
                    </Link>
                  </div>

                  <p className="mt-6 text-center text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                      Log in
                    </Link>
                  </p>
                </Card>

                {/* Footer row like screenshot */}
                <div className="mt-14 w-full flex items-center justify-center gap-14 text-gray-600 dark:text-gray-400">
                  <a
                    href="https://www.instagram.com/spazaafy/"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://www.tiktok.com/@spazaafy"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary"
                  >
                    TikTok
                  </a>
                  <a
                    href="https://x.com/spazaafy"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary"
                  >
                    Twitter
                  </a>
                </div>

                <p className="mt-5 text-xs text-gray-500 dark:text-gray-500 text-center">
                  © {new Date().getFullYear()} Spazaafy. All rights reserved.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default WelcomePage;
