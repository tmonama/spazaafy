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
              href="/spazaafy.apk"
              download="Spazaafy.apk"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow-md hover:shadow-lg hover:opacity-95 transition"
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

        {/* RIGHT: Phone mock / image */}
        <div className="w-full md:w-1/2 flex justify-center">
          <Card className="relative overflow-hidden w-full max-w-md bg-white dark:bg-gray-900">
            {/* Green gradient background blob */}
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-gradient-to-br from-primary to-secondary rounded-full opacity-70" />

            <div className="relative z-10 flex flex-col items-center px-6 py-10">
              {/* Mock phone frame */}
              <div className="w-56 sm:w-64 rounded-3xl bg-black p-3 shadow-2xl">
                <div className="bg-gray-100 rounded-2xl h-full flex flex-col items-center justify-center px-4 py-6">
                  <h2 className="text-xl font-extrabold text-gray-900 mb-1">
                    Spazaafy
                  </h2>
                  <p className="text-xs text-gray-500 mb-4 text-center">
                    Trust your spaza. Spazaafy it!
                  </p>

                  <div className="w-full space-y-3">
                    <div className="w-full rounded-xl bg-primary text-white text-center py-2 text-sm font-semibold">
                      I&apos;m a Consumer
                    </div>
                    <div className="w-full rounded-xl bg-secondary text-white text-center py-2 text-sm font-semibold">
                      I&apos;m a Spaza Shop Owner
                    </div>
                  </div>

                  <p className="mt-4 text-[10px] text-gray-500 text-center">
                    Already have an account?{" "}
                    <span className="font-semibold text-primary">Log in</span>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppPage;
