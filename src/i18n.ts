import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './i18n/routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
    onError(error) {
      if (error.code !== 'MISSING_MESSAGE') {
        console.error(error);
      }
    },
    getMessageFallback({ key }) {
      // For dynamically generated subjects or missing translations, return the key itself
      return key;
    }
  };
});
