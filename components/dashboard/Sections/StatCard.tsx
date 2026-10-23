import { cn } from "@heroui/react";
import { ReactNode } from "react";
import {
  MdAutorenew,
  MdCheckCircleOutline,
  MdGridView,
  MdRadioButtonUnchecked,
} from "react-icons/md";

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

const accentIcon: Record<StatAccent, ReactNode> = {
  total: <MdGridView size={13} />,
  completed: <MdCheckCircleOutline size={13} />,
  progress: <MdAutorenew size={13} />,
  todo: <MdRadioButtonUnchecked size={13} />,
};

interface StatCardProps {
  label: string;
  value: number;
  accent: StatAccent;
  pct?: number;
}

const CIRCUMFERENCE = 2 * Math.PI * 20;

export default function StatCard({ label, value, accent, pct }: StatCardProps) {
  const showRing = accent === "completed" && typeof pct === "number";

  return (
    <div className="rounded-card border border-border bg-surface p-5 shadow-card">
      <p className="text-xs font-medium text-subtle">{label}</p>

      {showRing ? (
        <div className="mt-2 flex items-center gap-3">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            className="-rotate-90 shrink-0"
          >
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="var(--surface-muted)"
              strokeWidth="5"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="var(--stat-completed)"
              strokeWidth="5"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - (pct ?? 0) / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          </svg>
          <div>
            <p className={cn("text-2xl font-bold leading-none", valueColor[accent])}>
              {value}
            </p>
            <p className="mt-0.5 text-xs text-muted">{pct}% done</p>
          </div>
        </div>
      ) : (
        <>
          <p className={cn("mt-2 text-3xl font-bold", valueColor[accent])}>
            {value}
          </p>
          {typeof pct === "number" && (
            <p className="mt-0.5 text-xs text-muted">{pct}% of total</p>
          )}
        </>
      )}

      <span
        className={cn(
          "mt-3 inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-xs font-medium",
          chipColor[accent],
        )}
      >
        {accentIcon[accent]}
        Tasks
      </span>
    </div>
  );
}
