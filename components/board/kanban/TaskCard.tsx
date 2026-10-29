"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Chip,
  ChipVariants,
  CircleDashedIcon,
  Typography,
} from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { PRIORITY_CHIP, TASK_PRIORITY_LABELS } from "@/enum/taskPriority.enum";
import { TASK_STATUS_CHIP, TASK_STATUS_LABELS } from "@/enum/taskStatus.enum";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";
import { UserResponseDTO } from "@/types/user.dto";
import { notificationTimeAgo } from "@/utils/timeAgo";

import TaskDetailDrawer from "../drawer/TaskDetailDrawer";
import { getTaskId } from "../useDragState";

const transition = {
  duration: 220,
  easing: "cubic-bezier(0.2, 1, 0.36, 1)",
};

const ASSIGNEES_LIMIT = 4;

export const AssigneesIcons = ({
  assignees,
}: {
  assignees:
    | {
        projectMember: {
          id: string;
          user: UserResponseDTO;
        };
      }[]
    | undefined;
}) => {
  if (assignees && assignees.length > 0)
    return (
      <div className="flex -space-x-1 pt-1">
        {assignees?.slice(0, ASSIGNEES_LIMIT).map((assignee, idx) => {
          const imageUrl = assignee.projectMember.user.image;
          const name = assignee.projectMember.user.name;

          return (
            <CustomAvatar
              key={idx}
              avatarProps={{ className: "size-6 shrink-0" }}
              avatarImageProps={{ src: imageUrl || "", alt: name }}
              avatarFallbackProps={{ className: "text-xs" }}
              fallback={name}
            />
          );
        })}
        {assignees?.length - ASSIGNEES_LIMIT > 0 && (
          <CustomAvatar
            avatarProps={{ className: "size-6 shrink-0" }}
            avatarFallbackProps={{ className: "text-xs" }}
            fallback={`+ ${assignees?.length - ASSIGNEES_LIMIT}`}
          />
        )}
      </div>
    );

  return (
    <Typography type="body-xs" color="muted">
      <i> Unassigned</i>
    </Typography>
  );
};

export const TaskCardContent = ({
  data,
  dragging = false,
  projectTitle,
}: {
  data: TaskResponseDTO;
  dragging?: boolean;
  projectTitle?: string;
}) => {
  const { id, title, ticketNumber, assignees, status, priority, createdAt } =
    data;

  const fullTicketId = `${projectTitle} #${String(ticketNumber)}`;

  return (
    <div
      className={[
        "w-full min-w-0 rounded-xl bg-content1 p-3",
        "transition-[box-shadow,opacity] duration-200 ease-out",
        dragging
          ? "cursor-grabbing shadow-lg ring-2 ring-primary/20"
          : "cursor-grab shadow-sm hover:shadow-md active:cursor-grabbing",
      ].join(" ")}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-xs text-default-500">{fullTicketId}</span>
        <AssigneesIcons assignees={assignees} />
      </div>

      <div className="mb-3">
        <TaskDetailDrawer id={id} title={title} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Chip
          color={TASK_STATUS_CHIP[status] as ChipVariants["color"]}
          variant="soft"
        >
          <CircleDashedIcon /> {TASK_STATUS_LABELS[status]}
        </Chip>
        {priority && (
          <Chip
            color={PRIORITY_CHIP[priority] as ChipVariants["color"]}
            variant="primary"
          >
            {TASK_PRIORITY_LABELS[priority]}
          </Chip>
        )}
        <Chip>{notificationTimeAgo(createdAt)}</Chip>
      </div>
    </div>
  );
};

export const TaskCard = ({
  data,
  columnId,
  title,
}: {
  data: TaskResponseDTO;
  columnId: string;
  title: string;
}) => {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition: sortableTransition,
  } = useSortable({
    id: getTaskId(data.id),
    data: {
      type: "task",
      task: data,
      columnId,
    },
    transition,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: sortableTransition,
  };

  return (
    <motion.div
      layout
      layoutId={`task-${data.id}`}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      animate={{ opacity: isDragging ? 0.5 : 1 }}
      transition={
        isDragging
          ? { duration: 0 }
          : { layout: { type: "spring", damping: 25, stiffness: 300 } }
      }
      className="touch-none"
    >
      <TaskCardContent data={data} dragging={isDragging} projectTitle={title} />
    </motion.div>
  );
};

export const StaticTaskCard = ({
  data,
  title,
}: {
  data: TaskResponseDTO;
  title: string;
}) => {
  return (
    <div className="touch-none">
      <TaskCardContent data={data} projectTitle={title} />
    </div>
  );
};

const EmptyColumnDropZone = ({ columnId }: { columnId: string }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `column-drop-${columnId}`,
    data: {
      type: "column",
      columnId,
    },
  });

  return (
    <motion.div
      ref={setNodeRef}
      animate={{ height: isOver ? 80 : 56 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className={[
        "flex items-center justify-center rounded-lg border border-dashed text-xs transition-colors",
        isOver
          ? "border-primary/50 bg-primary/5 text-primary-500"
          : "border-default-200 text-default-400",
      ].join(" ")}
    >
      {isOver ? "Release to drop" : "Drop a task here"}
    </motion.div>
  );
};

export const TaskList = ({
  column,
  sortable = true,
}: {
  column: TaskBoardResponseDTO;
  sortable?: boolean;
}) => {
  return (
    <div className="flex max-h-[calc(100vh-18rem)] min-h-24 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto p-1">
      <AnimatePresence initial={false}>
        {sortable
          ? column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                data={task}
                title={column.project.title}
                columnId={column.id}
              />
            ))
          : column.tasks.map((task) => (
              <StaticTaskCard
                key={task.id}
                data={task}
                title={column.project.title}
              />
            ))}
      </AnimatePresence>
      {column.tasks.length === 0 ? (
        <EmptyColumnDropZone columnId={column.id} />
      ) : null}
    </div>
  );
};

export { transition };
