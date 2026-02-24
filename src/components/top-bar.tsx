interface TopBarProps {
  displayName: string;
}

export default function TopBar({ displayName }: TopBarProps) {
  return (
    <div
      className="pointer-events-none absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between px-4 py-2"
      role="banner"
      aria-label="Application header"
    >
      <span className="pointer-events-auto rounded-md bg-neutral-900/80 px-3 py-1 text-sm font-bold text-neutral-100 backdrop-blur-sm">
        GeoChat
      </span>
      {displayName && (
        <span className="pointer-events-auto rounded-md bg-neutral-900/80 px-3 py-1 text-sm text-neutral-400 backdrop-blur-sm">
          {displayName}
        </span>
      )}
    </div>
  );
}
