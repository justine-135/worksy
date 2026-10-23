import { MdOutlineFlag } from "react-icons/md";

import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { ETaskPriority } from "@/enum/taskPriority.enum";
import { DashboardTaskResponse } from "@/types/dashboard.dto";

import SectionCard from "./SectionCard";

const PRIORITY_CONFIG = [
  {
    key: ETaskPriority.URGENT,
    label: "Urgent",
    barClass: "bg-danger",
    textClass: "text-danger",
  },
  {
    key: ETaskPriority.HIGH,
    label: "High",
    barClass: "bg-stat-progress",
    textClass: "text-stat-progress",
  },
  {
    key: ETaskPriority.MEDIUM,
    label: "Medium",
    barClass: "bg-primary",
    textClass: "text-primary",
  },
  {
    key: ETaskPriority.LOW,
    label: "Low",
    barClass: "bg-subtle",
    textClass: "text-muted",
  },
] as const;

export default function PriorityBreakdown({
  tasks,
}: {
  tasks: DashboardTaskResponse[];
}) {
  const counts = PRIORITY_CONFIG.map((p) => ({
    ...p,
    count: tasks.filter((t) => t.priority === p.key).length,
  }));

  const maxCount = Math.max(1, ...counts.map((c) => c.count));
  const hasAny = counts.some((c) => c.count > 0);

  return (
    <SectionCard
      title="By Priority"
      icon={<MdOutlineFlag size={18} />}
      iconColor="text-stat-progress"
    >
      {!hasAny ? (
        <CustomEmpty
          icon={MdOutlineFlag}
          title="No priorities set"
          message="Assign priorities to tasks to see a breakdown."
        />
      ) : (
        <div className="space-y-3">
          {counts.map(({ key, label, barClass, textClass, count }) => (
            <div key={key} className="flex items-center gap-3">
              <span className={`w-14 shrink-0 text-xs font-medium ${textClass}`}>
                {label}
              </span>
              <div className="flex-1 overflow-hidden rounded-pill bg-surface-muted h-2">
                <div
                  className={`h-full rounded-pill transition-[width] duration-500 ${barClass}`}
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">
                {count}
              </span>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
