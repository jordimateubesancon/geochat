interface TopBarProps {
  displayName: string;
}

export default function TopBar({ displayName }: TopBarProps) {
  return (
    <div
      className="pointer-events-auto absolute left-0 right-0 top-0 z-[1000] flex items-center justify-between bg-neutral-900/80 px-4 py-2 backdrop-blur-sm"
      role="banner"
      aria-label="Application header"
    >
      <span className="text-sm font-bold text-neutral-100">GeoChat</span>
      {displayName && (
        <span className="text-sm text-neutral-400">{displayName}</span>
      )}
    </div>
  );
}
