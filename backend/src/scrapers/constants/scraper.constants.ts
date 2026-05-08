export const SCRAPER_STORES = {
  fullH4rd: 'FullH4rd',
  gezatek: 'Gezatek',
} as const;

export const SCRAPER_URLS = {
  fullH4rdBase: 'https://fullh4rd.com.ar',
  gezatekBase: 'https://www.gezatek.com.ar',
} as const;

export const SCRAPER_DEFAULTS = {
  currency: 'ARS',
  timeoutMs: 10000,
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
} as const;
