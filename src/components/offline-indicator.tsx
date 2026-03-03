"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { useTranslations } from "next-intl";

export default function OfflineIndicator() {
  const { isOnline } = useOnlineStatus();
  const t = useTranslations();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1400] bg-amber-500 text-white text-center text-sm py-1 font-medium">
      {t("offline.indicator")}
    </div>
  );
}
