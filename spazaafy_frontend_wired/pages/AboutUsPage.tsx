// src/pages/AboutUsPage.tsx
import React from "react";

const AboutUsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-dark-bg flex flex-col">
      {/* Banner */}
      <div className="relative h-72 w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/media/about-us.png')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <h1 className="text-5xl font-extrabold text-white tracking-wide">
            About us
          </h1>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="w-full max-w-6xl mx-auto px-8 lg:px-16 py-20 space-y-24">
        {/* Who we are */}
        <SectionWithImage
          title="Who we are"
          image="/media/about-us2.png"
          reverse={false}
        >
          Spazaafy is a digital trust and compliance platform built for South Africa’s informal
          retail sector. We help consumers, spaza shop owners, and municipalities connect in a safer,
          more transparent way by making shop verification and compliance visible and easy to understand.
        </SectionWithImage>

        {/* What we do */}
        <SectionWithImage
          title="What we do"
          image="/media/about-us3.png"
          reverse={true}
        >
          <ul className="list-disc pl-5 space-y-2">
            <li>Help consumers find verified and compliant spaza shops in their area.</li>
            <li>Support shop owners on their journey to becoming registered and trusted in their communities.</li>
            <li>
              Provide municipalities and partners with tools and data to monitor compliance and support
              public health and safety.
            </li>
          </ul>
        </SectionWithImage>

        {/* Our Vision */}
        <SectionWithImage
          title="Our vision"
          image="/media/about-us4.png"
          reverse={false}
        >
          Our vision is a South Africa where every household can trust the spaza shops they use every
          day — where small businesses are supported, not marginalised, and where compliance is a
          bridge to growth rather than a barrier.
        </SectionWithImage>

        {/* Connect with us */}
        <SectionWithImage
          title="Connect with us"
          image="/media/about-us5.png"
          reverse={true}
        >
          <p className="mb-6">
            Follow Spazaafy on social media to stay updated on new features, rollouts and community
            impact stories.
          </p>

          <div className="flex items-center gap-6">
            <SocialRow />
          </div>
        </SectionWithImage>
      </div>

      {/* Footer */}
      <footer className="mt-20 pb-10 flex flex-col items-center space-y-4">
        <div className="flex items-center space-x-4">
          <SocialIcon href="https://www.instagram.com/spazaafy/" label="Instagram">
            I
          </SocialIcon>
          <SocialIcon href="https://x.com/spazaafy" label="X">
            X
          </SocialIcon>
          <SocialIcon href="https://www.tiktok.com/@spazaafy" label="TikTok">
            T
          </SocialIcon>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Spazaafy. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

/* Reusable Section Component */
const SectionWithImage = ({
  title,
  image,
  reverse,
  children,
}: {
  title: string;
  image: string;
  reverse?: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={`flex flex-col lg:flex-row items-center gap-12 ${
      reverse ? "lg:flex-row-reverse" : ""
    }`}
  >
    <div className="flex-1">
      <h2 className="text-3xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="text-gray-700 dark:text-gray-300 text-lg leading-7">
        {children}
      </div>
    </div>

    <div className="flex-1">
      <img
        src={image}
        alt={title}
        className="rounded-xl shadow-lg w-full object-cover"
      />
    </div>
  </div>
);

/* Social icons row */
const SocialRow = () => (
  <div className="flex items-center space-x-4">
    <SocialIcon href="https://www.instagram.com/spazaafy/" label="Instagram">
      I
    </SocialIcon>
    <SocialIcon href="https://x.com/spazaafy" label="X">
      X
    </SocialIcon>
    <SocialIcon href="https://www.tiktok.com/@spazaafy" label="TikTok">
      T
    </SocialIcon>
  </div>
);

const SocialIcon = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    aria-label={label}
    className="h-10 w-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-sm font-bold text-white dark:text-gray-900 hover:bg-primary dark:hover:bg-primary transition-colors"
  >
    {children}
  </a>
);

export default AboutUsPage;
