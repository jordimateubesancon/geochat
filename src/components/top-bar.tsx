interface TopBarProps {
  displayName: string;
  onSearchToggle?: () => void;
  searchOpen?: boolean;
}

export default function TopBar({ displayName, onSearchToggle, searchOpen }: TopBarProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-0 z-[1600] flex flex-col items-start gap-2 p-3"
      role="banner"
      aria-label="Application header"
    >
      <span className="pointer-events-auto rounded-md bg-white/80 px-3 py-1 text-sm font-bold text-neutral-900 shadow-sm backdrop-blur-sm">
        GeoChat
      </span>
      {displayName && (
        <span className="pointer-events-auto rounded-md bg-white/80 px-3 py-1 text-sm text-neutral-500 shadow-sm backdrop-blur-sm">
          {displayName}
        </span>
      )}
      {onSearchToggle && !searchOpen && (
        <button
          onClick={(e) => { e.stopPropagation(); onSearchToggle?.(); }}
          aria-label="Open map tools"
          aria-expanded={false}
          className="pointer-events-auto rounded-md bg-white/80 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neutral-600"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}
    </div>
  );
}
