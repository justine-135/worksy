import { cn } from "@heroui/react";
import { MdGridView } from "react-icons/md";

type StatAccent = "total" | "completed" | "progress" | "todo";

const valueColor: Record<StatAccent, string> = {
  total: "text-stat-total",
  completed: "text-stat-completed",
  progress: "text-stat-progress",
  todo: "text-stat-todo",
};

const chipColor: Record<StatAccent, string> = {
  total: "bg-surface-muted text-muted",
  completed: "bg-success-soft text-stat-completed",
  progress: "bg-warning-soft text-stat-progress",
  todo: "bg-danger-soft text-stat-todo",
};

interface StatCardProps {
  label: string;
  value: number;
  accent: StatAccent;
}

export default function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-subtle">
        {label}
      </p>
      <p className={cn("mt-2 text-3xl font-bold", valueColor[accent])}>
        {value}
      </p>
      <span
        className={cn(
          "mt-3 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium",
          chipColor[accent],
        )}
      >
        <MdGridView size={13} />
        Tasks
      </span>
    </div>
  );
}
