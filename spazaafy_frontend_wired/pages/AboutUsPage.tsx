// src/pages/AboutUsPage.tsx

import React from "react";

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex flex-col">
      {/* Banner */}
      <div className="relative h-64 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/media/about-us.png')",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-wide">
            About us
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-10 space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Who we are
          </h2>
          <p className="text-sm sm:text-base leading-6 text-gray-700 dark:text-gray-300">
            Spazaafy is a digital trust and compliance platform built for South
            Africa’s informal retail sector. We help consumers, spaza shop
            owners, and municipalities to connect in a safer, more transparent
            way by making shop verification and compliance visible and easy to
            understand.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            What we do
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <li>
              Help consumers find verified and compliant spaza shops in their
              area.
            </li>
            <li>
              Support shop owners on their journey to becoming registered,
              compliant and trusted in their communities.
            </li>
            <li>
              Provide municipalities and partners with tools and data to monitor
              compliance and support public health and safety.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Our vision
          </h2>
          <p className="text-sm sm:text-base leading-6 text-gray-700 dark:text-gray-300">
            Our vision is a South Africa where every household can trust the
            spaza shops they use every day — where small businesses are
            supported, not marginalised, and where compliance is a bridge to
            growth rather than a barrier.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Connect with us
          </h2>
          <p className="text-sm sm:text-base leading-6 text-gray-700 dark:text-gray-300 mb-4">
            Follow Spazaafy on social media to stay updated on new features,
            rollouts and community impact stories:
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="https://www.instagram.com/spazaafy/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
            >
              <SocialDot label="Instagram" />
              <span className="text-sm">@spazaafy</span>
            </a>
            <a
              href="https://x.com/spazaafy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
            >
              <SocialDot label="X" />
              <span className="text-sm">@spazaafy</span>
            </a>
            <a
              href="https://www.tiktok.com/@spazaafy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center space-x-2 text-gray-800 dark:text-gray-100 hover:text-primary dark:hover:text-primary-light"
            >
              <SocialDot label="TikTok" />
              <span className="text-sm">@spazaafy</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

const SocialDot: React.FC<{ label: string }> = ({ label }) => (
  <div className="h-8 w-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-xs font-bold text-white dark:text-gray-900">
    {label[0]}
  </div>
);

export default AboutUsPage;
