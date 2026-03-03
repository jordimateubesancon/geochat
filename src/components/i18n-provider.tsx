"use client";

import { NextIntlClientProvider } from "next-intl";
import { useEffect, useState } from "react";
import { detectLocale, loadMessages, DEFAULT_LOCALE } from "@/lib/i18n";
import type { SupportedLocale } from "@/lib/i18n";

/**
 * Convert flat dot-notation keys to nested objects for next-intl.
 * e.g. { "channelCard.conversations": "..." } → { channelCard: { conversations: "..." } }
 */
function nestMessages(
  flat: Record<string, string>
): Record<string, unknown> {
  const nested: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let current = nested as Record<string, unknown>;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || typeof current[parts[i]] !== "object") {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;
  }
  return nested;
}

export default function I18nProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const detected = detectLocale();
    setLocale(detected);
    document.documentElement.lang = detected;

    const loadAll = async () => {
      const [detectedMsgs, englishMsgs] = await Promise.all([
        loadMessages(detected),
        detected !== DEFAULT_LOCALE ? loadMessages(DEFAULT_LOCALE) : Promise.resolve(null),
      ]);
      // Merge: English defaults overridden by detected locale, then nest for next-intl
      const merged = englishMsgs ? { ...englishMsgs, ...detectedMsgs } : detectedMsgs;
      setMessages(nestMessages(merged));
    };

    loadAll();
  }, []);

  if (!messages) return null;

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      onError={() => {}}
    >
      {children}
    </NextIntlClientProvider>
  );
}
