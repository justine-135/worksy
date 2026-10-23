interface OverallProgressProps {
  completed: number;
  inProgress: number;
  todo: number;
  total: number;
}

export default function OverallProgress({
  completed,
  inProgress,
  todo,
  total,
}: OverallProgressProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const donePct = total > 0 ? (completed / total) * 100 : 0;
  const progressPct = total > 0 ? (inProgress / total) * 100 : 0;
  const todoPct = total > 0 ? (todo / total) * 100 : 0;

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Overall Progress
        </h2>
        <span className="text-sm font-semibold text-stat-completed">{pct}%</span>
      </div>

      <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-pill bg-surface-muted">
        <div
          className="h-full bg-stat-completed transition-[width] duration-500"
          style={{ width: `${donePct}%` }}
        />
        <div
          className="h-full bg-stat-progress transition-[width] duration-500"
          style={{ width: `${progressPct}%` }}
        />
        <div
          className="h-full bg-stat-todo transition-[width] duration-500"
          style={{ width: `${todoPct}%` }}
        />
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-xs text-muted">
          {completed} of {total} tasks completed
        </p>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-stat-completed" />
            Done
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-stat-progress" />
            In Progress
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-stat-todo" />
            Todo
          </span>
        </div>
      </div>
    </div>
  );
}
