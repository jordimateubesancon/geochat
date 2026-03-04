export interface TextSegment {
  type: "text" | "link";
  value: string;
}

const URL_REGEX = /https?:\/\/[^\s<>"'\]]+/g;
const TRAILING_PUNCT = /[.,!?;:)]+$/;

function isValidHttpUrl(candidate: string): boolean {
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function parseLinks(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(URL_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    let url = match[0];

    // Strip trailing sentence punctuation
    const trailingMatch = TRAILING_PUNCT.exec(url);
    if (trailingMatch) {
      url = url.slice(0, -trailingMatch[0].length);
    }

    // Defense-in-depth: validate with URL constructor
    if (!isValidHttpUrl(url)) {
      continue;
    }

    // Add preceding text segment
    if (matchStart > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, matchStart) });
    }

    segments.push({ type: "link", value: url });

    // Account for stripped punctuation staying as text
    const consumedLength = url.length + (trailingMatch ? trailingMatch[0].length : 0);
    lastIndex = matchStart + consumedLength;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}
