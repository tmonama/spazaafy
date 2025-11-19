// src/pages/DownloadAppPage.tsx

import React from "react";
import { Link } from "react-router-dom";
import Card from "../components/Card";

const DownloadAppPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
        {/* LEFT: Text + CTA */}
        <div className="w-full md:w-1/2">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 mb-2">
            Spazaafy Mobile
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
            Download
            <br />
            Our App
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 max-w-md">
            Download the latest version of the Spazaafy app and get started as a
            consumer or a spaza shop owner — all from your phone.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Download button – links directly to your APK */}
            <a
              // Note: Adjusted the appearance to better match the PNG's button gradient.
              href="/spazaafy.apk"
              download="Spazaafy.apk"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-semibold text-white bg-gradient-to-r from-green-500 to-lime-400 shadow-lg hover:shadow-xl hover:opacity-95 transition"
            >
              Download Now
            </a>

            {/* Optional: link back to the web login */}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Prefer the web app?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:text-primary-dark dark:text-primary-light"
              >
                Log in here
              </Link>
            </p>
          </div>

          <p className="mt-6 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            Note: On Android, you may need to allow installs from{" "}
            <span className="font-semibold">unknown sources</span> in your phone
            settings to install the APK.
          </p>
        </div>

        {/* RIGHT: Phone mock / image (UPDATED STRUCTURE) */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Card className="relative overflow-hidden w-full max-w-md bg-white dark:bg-gray-900">
            {/* Green gradient background blob - Adjusted position and opacity slightly */}
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-primary to-secondary rounded-full opacity-70" />

            <div className="relative z-10 flex flex-col items-center px-6 py-10">
              
              {/* --- START OF NEW PHONE MOCKUP STRUCTURE --- */}
              <div className="relative w-64 h-[500px] rounded-[3rem] bg-black p-1 shadow-2xl">
                
                {/* Status Bar (Time) */}
                <div className="absolute top-4 left-6 text-white text-xs z-20 font-semibold">
                    15:57
                </div>
                <div className="absolute top-4 right-6 flex items-center space-x-1 z-20">
                    <div className="w-2 h-2 rounded-full bg-white opacity-80"></div>
                    <div className="w-3 h-3 rounded-full bg-white opacity-80"></div>
                    <div className="w-4 h-2 border border-white rounded-sm"></div>
                </div>

                {/* The Screen Display */}
                <div className="bg-white dark:bg-gray-100 rounded-[2.8rem] h-full flex flex-col items-center justify-center px-6 py-10">
                  
                  {/* Phone Notch */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-b-xl z-20"></div>

                  <h2 className="text-2xl font-extrabold text-gray-900 mb-1 mt-10">
                    Spazaafy
                  </h2>
                  <p className="text-xs text-gray-500 mb-8 text-center">
                    Trust your spaza. Spazaafy it!
                  </p>

                  <div className="w-full space-y-4 px-4">
                    {/* Buttons updated to match the colors and rounded corners in the PNG */}
                    <div className="w-full rounded-full bg-green-500 hover:bg-green-600 text-white text-center py-3 text-sm font-semibold cursor-pointer transition">
                      I&apos;m a Consumer
                    </div>
                    <div className="w-full rounded-full bg-red-500 hover:bg-red-600 text-white text-center py-3 text-sm font-semibold cursor-pointer transition">
                      I&apos;m a Spaza Shop Owner
                    </div>
                  </div>

                  <p className="mt-8 text-xs text-gray-500 text-center">
                    Already have an account?{" "}
                    <span className="font-semibold text-primary cursor-pointer">Log in here</span>
                  </p>
                </div>
              </div>
              {/* --- END OF NEW PHONE MOCKUP STRUCTURE --- */}
              
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppPage;