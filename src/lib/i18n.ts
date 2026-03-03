export const SUPPORTED_LOCALES = ["en", "es", "fr"] as const;
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

export async function loadMessages(
  locale: SupportedLocale
): Promise<Record<string, string>> {
  try {
    return (await import(`@/messages/${locale}.json`)).default;
  } catch {
    return (await import(`@/messages/${DEFAULT_LOCALE}.json`)).default;
  }
}
