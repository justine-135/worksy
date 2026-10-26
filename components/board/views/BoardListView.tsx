"use client";

import { Chip, ChipVariants, Skeleton } from "@heroui/react";
import { format } from "date-fns";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { PRIORITY_CHIP, TASK_PRIORITY_LABELS } from "@/enum/taskPriority.enum";
import { TASK_STATUS_CHIP, TASK_STATUS_LABELS } from "@/enum/taskStatus.enum";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";
import { UserResponseDTO } from "@/types/user.dto";

import TaskDetailDrawer from "../drawer/TaskDetailDrawer";
import AddTaskModal from "../modal/AddTaskModal";

/** Indicator dot color per column status — matches the Kanban view. */
const COLUMN_INDICATOR: Record<string, string> = {
  TODO: "bg-default-400",
  IN_PROGRESS: "bg-warning",
  DONE: "bg-success",
};

const ASSIGNEES_LIMIT = 3;

interface BoardListViewProps {
  columns: TaskBoardResponseDTO[];
  isLoading: boolean;
  projectId: string | null;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function BoardListSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {Array.from({ length: 3 }).map((_, colIdx) => (
        <div key={colIdx}>
          <div className="mb-2 flex items-center gap-2 px-1">
            <Skeleton className="size-2.5 rounded-full" />
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-4 w-8 rounded-md" />
          </div>
          <div className="overflow-hidden rounded-xl border border-default-200">
            {Array.from({ length: 3 }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="flex items-center gap-4 border-b border-default-100 px-4 py-3 last:border-0"
              >
                <Skeleton className="h-4 w-12 shrink-0 rounded-md" />
                <Skeleton className="h-4 flex-1 rounded-md" />
                <Skeleton className="h-6 w-20 shrink-0 rounded-full" />
                <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
                <Skeleton className="h-6 w-16 shrink-0 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Assignee Avatars ────────────────────────────────────────────────────────

function AssigneeAvatars({
  assignees,
}: {
  assignees:
    | { projectMember: { id: string; user: UserResponseDTO } }[]
    | undefined;
}) {
  if (!assignees || assignees.length === 0) {
    return <span className="text-xs italic text-default-400">Unassigned</span>;
  }

  return (
    <div className="flex -space-x-1">
      {assignees.slice(0, ASSIGNEES_LIMIT).map((a, idx) => (
        <CustomAvatar
          key={idx}
          avatarProps={{ className: "size-6 shrink-0" }}
          avatarImageProps={{
            src: a.projectMember.user.image || "",
            alt: a.projectMember.user.name,
          }}
          avatarFallbackProps={{ className: "text-xs" }}
          fallback={a.projectMember.user.name}
        />
      ))}
      {assignees.length > ASSIGNEES_LIMIT && (
        <CustomAvatar
          avatarProps={{ className: "size-6 shrink-0" }}
          avatarFallbackProps={{ className: "text-xs" }}
          fallback={`+${assignees.length - ASSIGNEES_LIMIT}`}
        />
      )}
    </div>
  );
}

// ─── Task Row ────────────────────────────────────────────────────────────────

function EmptyRow() {
  return (
    <div className="flex items-center justify-center px-4 py-6 text-sm italic text-default-400">
      No tasks in this column
    </div>
  );
}

function TaskRow({
  task,
  projectTitle,
}: {
  task: TaskResponseDTO;
  projectTitle: string;
}) {
  const dueDateDisplay = task.dueDate
    ? format(new Date(task.dueDate), "MMM d, yyyy")
    : "—";

  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== "DONE";

  return (
    <div className="flex items-center gap-4 border-b border-default-100 px-4 py-3 last:border-0 hover:bg-default-50 transition-colors">
      {/* Ticket number */}
      <span className="w-16 shrink-0 text-xs font-medium text-default-500">
        {projectTitle} #{task.ticketNumber}
      </span>

      {/* Title — opens drawer */}
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        <TaskDetailDrawer id={task.id} title={task.title} />
      </div>

      {/* Status chip */}
      <div className="shrink-0">
        <Chip
          color={TASK_STATUS_CHIP[task.status] as ChipVariants["color"]}
          variant="soft"
          className="text-xs"
        >
          {TASK_STATUS_LABELS[task.status]}
        </Chip>
      </div>

      {/* Priority chip */}
      <div className="shrink-0 w-20">
        {task.priority ? (
          <Chip
            color={PRIORITY_CHIP[task.priority] as ChipVariants["color"]}
            variant="primary"
            className="text-xs"
          >
            {TASK_PRIORITY_LABELS[task.priority]}
          </Chip>
        ) : (
          <span className="text-xs text-default-400">—</span>
        )}
      </div>

      {/* Assignees */}
      <div className="w-20 shrink-0">
        <AssigneeAvatars assignees={task.assignees} />
      </div>

      {/* Due date */}
      <span
        className={[
          "w-28 shrink-0 text-xs",
          isOverdue ? "font-medium text-danger" : "text-default-500",
        ].join(" ")}
      >
        {dueDateDisplay}
        {isOverdue && <span className="ml-1 text-danger">(overdue)</span>}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function BoardListView({ columns, isLoading, projectId }: BoardListViewProps) {
  if (isLoading) return <BoardListSkeleton />;

  const totalTasks = columns.reduce((sum, col) => sum + col.tasks.length, 0);

  if (columns.length === 0 || totalTasks === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-default-400">
        <span className="text-sm">No tasks found</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {columns.map((column) => (
        <div key={column.id}>
          {/* Section header */}
          <div className="mb-2 flex items-center gap-2 px-1 group">
            <div
              className={[
                "size-2.5 rounded-full",
                COLUMN_INDICATOR[column.status] ?? "bg-default-300",
              ].join(" ")}
            />
            <span className="text-sm font-semibold text-foreground">
              {column.title}
            </span>
            <span className="rounded-md bg-default-100 px-1.5 py-0.5 text-xs text-default-600">
              {column.tasks.length}
            </span>
            <span className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <AddTaskModal projectId={projectId} taskBoardID={column.id} />
            </span>
          </div>

          {/* Task table */}
          <div className="overflow-hidden rounded-xl border border-default-200">
            {/* Column header row */}
            <div className="flex items-center gap-4 border-b border-default-200 bg-content2 px-4 py-2">
              <span className="w-16 shrink-0 text-xs font-semibold text-default-500">
                ID
              </span>
              <span className="flex-1 text-xs font-semibold text-default-500">
                Title
              </span>
              <span className="w-24 shrink-0 text-xs font-semibold text-default-500">
                Status
              </span>
              <span className="w-20 shrink-0 text-xs font-semibold text-default-500">
                Priority
              </span>
              <span className="w-20 shrink-0 text-xs font-semibold text-default-500">
                Assignees
              </span>
              <span className="w-28 shrink-0 text-xs font-semibold text-default-500">
                Due Date
              </span>
            </div>

            {column.tasks.length === 0 ? (
              <EmptyRow />
            ) : (
              column.tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  projectTitle={column.project.title}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
