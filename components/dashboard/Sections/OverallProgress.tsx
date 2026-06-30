interface OverallProgressProps {
  completed: number;
  total: number;
}

export default function OverallProgress({
  completed,
  total,
}: OverallProgressProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Overall Progress
        </h2>
        <span className="text-sm font-semibold text-stat-completed">{pct}%</span>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-pill bg-surface-muted">
        <div
          className="h-full rounded-pill bg-gradient-to-r from-accent-from to-accent-to transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-muted">
        {completed} of {total} tasks completed
      </p>
    </div>
  );
}
