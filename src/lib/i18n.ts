export const SUPPORTED_LOCALES = ["en", "es", "fr", "ca"] as const;
export const DEFAULT_LOCALE = "en" as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Detect the user's preferred locale from browser settings.
 * Iterates navigator.languages, matches base language against supported locales.
 * Falls back to DEFAULT_LOCALE if no match found.
 */
export function detectLocale(): SupportedLocale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;

  const languages = navigator.languages ?? [navigator.language];

  for (const lang of languages) {
    const base = lang.split("-")[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(base as SupportedLocale)) {
      return base as SupportedLocale;
    }
  }

  return DEFAULT_LOCALE;
}

// Explicit imports so webpack can resolve them at build time.
// Template-literal dynamic imports (import(`@/messages/${locale}.json`))
// fail silently in production builds on Vercel.
const MESSAGE_LOADERS: Record<
  SupportedLocale,
  () => Promise<{ default: Record<string, string> }>
> = {
  en: () => import("@/messages/en.json"),
  es: () => import("@/messages/es.json"),
  fr: () => import("@/messages/fr.json"),
  ca: () => import("@/messages/ca.json"),
};

export async function loadMessages(
  locale: SupportedLocale
): Promise<Record<string, string>> {
  try {
    return (await MESSAGE_LOADERS[locale]()).default;
  } catch {
    return (await MESSAGE_LOADERS[DEFAULT_LOCALE]()).default;
  }
}
