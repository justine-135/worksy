// Page-shaped loading state for the Settings tab (matches the card stack).
export default function SettingsSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="h-7 w-40 animate-pulse rounded-md bg-surface-muted" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-card border border-border bg-surface p-5 shadow-card"
        >
          <div className="mb-4 h-5 w-32 animate-pulse rounded-md bg-surface-muted" />
          <div className="space-y-3">
            <div className="h-4 w-full animate-pulse rounded-md bg-surface-muted" />
            <div className="h-9 w-full animate-pulse rounded-md bg-surface-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}
