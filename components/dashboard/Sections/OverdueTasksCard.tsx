"use client";

import Link from "next/link";
import { MdOutlineAlarm } from "react-icons/md";

import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { OverdueTaskDTO } from "@/types/dashboard.dto";

import PriorityBadge from "../PriorityBadge";
import SectionCard from "./SectionCard";

function daysOverdue(dueDate: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Due today";
  if (diff === 1) return "1 day overdue";
  return `${diff} days overdue`;
}

export default function OverdueTasksCard({
  tasks,
  projectId,
}: {
  tasks: OverdueTaskDTO[];
  projectId?: string | null;
}) {
  const visible = tasks.slice(0, 3);
  const overflow = tasks.length - visible.length;

  const viewAllAction =
    overflow > 0 && projectId ? (
      <Link
        href={`/projects/${projectId}/board`}
        className="text-xs font-medium text-primary hover:underline"
      >
        View all {tasks.length}
      </Link>
    ) : undefined;

  return (
    <SectionCard
      title="Overdue"
      icon={<MdOutlineAlarm size={18} />}
      iconColor="text-danger"
      count={tasks.length}
      action={viewAllAction}
      className="border-danger/20 bg-danger/[0.015]"
    >
      {tasks.length > 0 ? (
        <ul className="space-y-3">
          {visible.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-danger/20 bg-danger/5 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-surface-muted px-2 py-0.5 text-xs font-medium text-muted">
                  TASK-{task.ticketNumber}
                </span>
                <PriorityBadge priority={task.priority} />
              </div>
              <p className="mt-2 text-sm font-semibold text-foreground">
                {task.title}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-stat-progress" />
                  {task.boardTitle}
                </span>
                <span className="font-medium text-danger">
                  {daysOverdue(task.dueDate)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <CustomEmpty
          icon={MdOutlineAlarm}
          title="No overdue tasks"
          message="Tasks past their due date will appear here."
        />
      )}
    </SectionCard>
  );
}
