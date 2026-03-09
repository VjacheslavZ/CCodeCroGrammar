import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ru from './locales/ru.json';
import uk from './locales/uk.json';

const supportedLngs = ['en', 'ru', 'uk'];

// Get device language code (e.g. "en", "ru", "uk")
const deviceLang = getLocales()[0]?.languageCode ?? 'en';
const detectedLng = supportedLngs.includes(deviceLang) ? deviceLang : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ru: { translation: ru },
    uk: { translation: uk },
  },
  lng: detectedLng,
  fallbackLng: 'en',
  supportedLngs,
  interpolation: { escapeValue: false },
});

export default i18n;
