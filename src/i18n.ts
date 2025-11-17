import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import translation files
import enTranslation from './locales/en/translation.json'
import zhTranslation from './locales/zh/translation.json'

// Define the resources for each language
const resources = {
  en: {
    translation: enTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
}

// Initialize i18n
i18n
  // Detect the user's language automatically
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Configure i18n
  .init({
    // Set the default language
    fallbackLng: 'zh',
    // Set the default namespace
    ns: ['translation'],
    defaultNS: 'translation',
    // Define the resources for each language
    resources,
    // Enable debug mode in development
    debug: import.meta.env.MODE === 'development',
    // interpolation configuration
    interpolation: {
      // Enable escaping to prevent XSS attacks
      escapeValue: true,
      // Format the variables in the translation strings
      formatSeparator: ',',
    },
    // React i18next configuration
    react: {
      // Use the Suspense component to handle loading translations
      useSuspense: true,
    },
  })

export default i18n