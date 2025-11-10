// src/i18n.ts

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import your translation files
import translationEN from './src/locales/en/translation.json';
import translationZU from './src/locales/zu/translation.json';
import translationXH from './src/locales/xh/translation.json';
import translationST from './src/locales/st/translation.json'; // ✅ 1. Import the new Sesotho file

// Define the resources (the translations)
const resources = {
  en: {
    translation: translationEN
  },
  zu: {
    translation: translationZU
  },
  xh: {
    translation: translationXH
  },
  // ✅ 2. Add the Sesotho resource with the 'st' language code
  st: {
    translation: translationST
  }
};

i18n
  .use(LanguageDetector) // Plugin to detect user's language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if a translation is missing or language is unavailable
    debug: true,       // Logs info to the console. Set to false for production.

    interpolation: {
      escapeValue: false // React already protects from XSS
    }
  });

export default i18n;