"use client";

import { cn } from "@heroui/react";
import Link from "next/link";
import { MdAdd, MdCheckCircleOutline } from "react-icons/md";

import CustomEmpty from "@/components/common/custom/CustomEmpty";

import PriorityBadge from "../PriorityBadge";
import SectionCard from "./SectionCard";

export interface AssignedTask {
  id: string;
  ticketNumber: number;
  title: string;
  priority?: string | null;
  boardTitle: string;
}

export default function AssignedToMe({
  tasks,
  projectId,
}: {
  tasks: AssignedTask[];
  projectId?: string | null;
}) {
  return (
    <SectionCard
      title="Assigned to me"
      icon={<MdCheckCircleOutline size={18} />}
      count={tasks.length}
    >
      {tasks.length > 0 ? (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="rounded-xl border border-border p-4 transition-colors hover:bg-surface-muted/50"
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
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                <span className="size-2 rounded-full bg-stat-progress" />
                {task.boardTitle}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <CustomEmpty
          icon={MdCheckCircleOutline}
          title="Nothing assigned"
          message="Tasks assigned to you will appear here."
        />
      )}

      <Link
        href={projectId ? `/projects/${projectId}/board` : "#"}
        className={cn(
          "mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border",
          "py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-muted/50",
        )}
      >
        <MdAdd size={16} />
        New task
      </Link>
    </SectionCard>
  );
}
