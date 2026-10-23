import { MdCalendarToday } from "react-icons/md";

import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { UpcomingTaskDTO } from "@/types/dashboard.dto";

import PriorityBadge from "../PriorityBadge";
import SectionCard from "./SectionCard";

function getDateLabel(dueDate: string): string {
  const now = new Date();
  const d = new Date(dueDate);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diff = Math.round(
    (dStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export default function UpcomingTasksCard({
  tasks,
}: {
  tasks: UpcomingTaskDTO[];
  projectId?: string | null;
}) {
  const grouped = tasks.reduce<Record<string, UpcomingTaskDTO[]>>(
    (acc, task) => {
      const label = getDateLabel(task.dueDate);
      if (!acc[label]) acc[label] = [];
      acc[label].push(task);
      return acc;
    },
    {},
  );

  return (
    <SectionCard
      title="Due This Week"
      icon={<MdCalendarToday size={18} />}
      iconColor="text-primary"
      count={tasks.length}
    >
      {tasks.length === 0 ? (
        <CustomEmpty
          icon={MdCalendarToday}
          title="Nothing due soon"
          message="Tasks due in the next 7 days will appear here."
        />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([label, group]) => (
            <div key={label}>
              <p className="mb-2 text-xs font-medium text-subtle">{label}</p>
              <ul className="space-y-2">
                {group.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-surface-muted px-1.5 py-0.5 text-xs font-medium text-muted">
                          TASK-{task.ticketNumber}
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground line-clamp-1">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {task.boardTitle}
                      </p>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
