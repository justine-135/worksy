"use client";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { TASK_STATUS_LABELS } from "@/enum/taskStatus.enum";
import { TaskResponseDTO } from "@/types/task.dto";

/**
 * A simple avatar + name row, reused for the Assignees and Participants lists
 * in the right-hand sidebar.
 */
export const PersonRow = ({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) => (
  <div className="flex items-center gap-2">
    <CustomAvatar
      avatarProps={{ className: "size-7 shrink-0" }}
      avatarImageProps={{ src: image || "", alt: name }}
      avatarFallbackProps={{ className: "text-xs" }}
      fallback={name}
    />
    <span className="truncate text-sm text-foreground">{name}</span>
  </div>
);

export const SidebarSection = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h4>
      {action}
    </div>
    {children}
  </div>
);

/**
 * Read-only assignee display: a single assignee shows avatar + name, while
 * multiple assignees collapse into the overlapping-avatar stack used on the
 * board's task cards (no names).
 */
export const AssigneeDisplay = ({
  assignees,
}: {
  assignees: { name: string; image?: string | null }[];
}) => {
  if (assignees.length === 0) {
    return <p className="text-sm text-subtle">No one assigned</p>;
  }

  if (assignees.length === 1) {
    return <PersonRow name={assignees[0].name} image={assignees[0].image} />;
  }

  return (
    <div className="flex -space-x-1">
      {assignees.map((assignee) => (
        <CustomAvatar
          key={assignee.name}
          avatarProps={{ className: "size-6 shrink-0" }}
          avatarImageProps={{ src: assignee.image || "", alt: assignee.name }}
          avatarFallbackProps={{ className: "text-xs" }}
          fallback={assignee.name}
        />
      ))}
    </div>
  );
};

/**
 * Subtasks (child tasks) shown below the description. Each row deep-links to the
 * child's own drawer.
 */
export const SubtaskList = ({
  subtasks,
  onNavigate,
}: {
  subtasks: NonNullable<TaskResponseDTO["children"]>;
  onNavigate: (taskId: string) => void;
}) => (
  <div className="mt-6 space-y-2">
    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
      Subtasks
    </h4>
    <div className="divide-y divide-default-100 rounded-lg border border-default-200">
      {subtasks.map((child) => (
        <button
          key={child.id}
          type="button"
          onClick={() => onNavigate(child.id)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-surface-muted"
        >
          <span className="min-w-0 truncate text-sm">
            <span className="mr-1 text-xs font-medium text-subtle">
              #{child.ticketNumber}
            </span>
            {child.title}
          </span>
          <span className="shrink-0 text-xs text-muted">
            {TASK_STATUS_LABELS[child.status]}
          </span>
        </button>
      ))}
    </div>
  </div>
);
