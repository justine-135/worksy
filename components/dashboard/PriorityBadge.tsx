import { cn } from "@heroui/react";

import { PRIORITY_CONFIG } from "@/constant/taskPriority";
import { ETaskPriority } from "@/enum/taskPriority.enum";

export default function PriorityBadge({
  priority,
}: {
  priority?: string | null;
}) {
  const key = (priority ?? "").toLowerCase() as ETaskPriority;
  const cfg = PRIORITY_CONFIG[key] ?? {
    label: priority || "None",
    badgeClassName: "bg-surface-muted text-muted",
  };

  return (
    <span
      className={cn(
        "rounded-pill px-2 py-0.5 text-xs font-semibold capitalize",
        cfg.badgeClassName,
      )}
    >
      {cfg.label}
    </span>
  );
}
