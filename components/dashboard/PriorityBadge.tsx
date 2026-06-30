import { cn } from "@heroui/react";

const config: Record<string, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "bg-danger-soft text-danger" },
  high: { label: "High", className: "bg-danger-soft text-danger" },
  medium: { label: "Medium", className: "bg-warning-soft text-warning" },
  low: { label: "Low", className: "bg-success-soft text-success" },
};

export default function PriorityBadge({
  priority,
}: {
  priority?: string | null;
}) {
  const key = (priority ?? "").toLowerCase();
  const cfg = config[key] ?? {
    label: priority || "None",
    className: "bg-surface-muted text-muted",
  };

  return (
    <span
      className={cn(
        "rounded-pill px-2 py-0.5 text-xs font-semibold capitalize",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}
