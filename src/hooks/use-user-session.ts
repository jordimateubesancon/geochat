import { useEffect, useState } from "react";
import type { UserSession } from "@/types";

const STORAGE_KEY_NAME = "geochat_display_name";
const STORAGE_KEY_SESSION = "geochat_session_id";

const ADJECTIVES = [
  "Blue",
  "Red",
  "Green",
  "Gold",
  "Silver",
  "Swift",
  "Bright",
  "Dark",
  "Wild",
  "Calm",
  "Bold",
  "Warm",
  "Cool",
  "Shy",
  "Keen",
  "Brave",
  "Wise",
  "Quick",
  "Rare",
  "True",
];

const NOUNS = [
  "Fox",
  "Owl",
  "Bear",
  "Wolf",
  "Hawk",
  "Lion",
  "Deer",
  "Lynx",
  "Crow",
  "Hare",
  "Pike",
  "Wren",
  "Seal",
  "Moth",
  "Orca",
  "Puma",
  "Dove",
  "Frog",
  "Newt",
  "Swan",
];

function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adj}${noun}`;
}

export function useUserSession(): UserSession {
  const [session, setSession] = useState<UserSession>({
    displayName: "",
    sessionId: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    let displayName = localStorage.getItem(STORAGE_KEY_NAME);
    let sessionId = localStorage.getItem(STORAGE_KEY_SESSION);

    if (!displayName) {
      displayName = generateDisplayName();
      localStorage.setItem(STORAGE_KEY_NAME, displayName);
    }

    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY_SESSION, sessionId);
    }

    setSession({ displayName, sessionId });
  }, []);

  return session;
}
