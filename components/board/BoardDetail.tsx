"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Chip,
  ChipVariants,
  CircleDashedIcon,
  Typography,
} from "@heroui/react";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState, useSyncExternalStore } from "react";

import { PRIORITY_CHIP, TASK_PRIORITY_LABELS } from "@/enum/taskPriority.enum";
import { TASK_STATUS_CHIP, TASK_STATUS_LABELS } from "@/enum/taskStatus.enum";
import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import useSaveTaskBoardPositionMutation from "@/hooks/taskboard/useSaveTaskBoardPositionMutation";
import useSaveTaskPositionMutation from "@/hooks/taskboard/useSaveTaskPositionMutation";
import { useSessionStore } from "@/store/session.store";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";
import { UserResponseDTO } from "@/types/user.dto";
import { notificationTimeAgo } from "@/utils/timeAgo";

import CustomAvatar from "../common/custom/CustomAvatar";
import BoardSkeleton from "./BoardSkeleton";
import TaskDetailDrawer from "./drawer/TaskDetailDrawer";
import AddTaskBoardModal from "./modal/AddTaskBoardModal";
import AddTaskModal from "./modal/AddTaskModal";
import EditTaskBoardModal from "./modal/EditTaskBoardModal";
import useDragState, { getColumnId, getTaskId } from "./useDragState";

const transition = {
  duration: 220,
  easing: "cubic-bezier(0.2, 1, 0.36, 1)",
};

/** Matches HeroUI Pro Kanban column indicator dot colors by task status. */
const COLUMN_INDICATOR: Record<string, string> = {
  TODO: "bg-default-400",
  IN_PROGRESS: "bg-warning",
  DONE: "bg-success",
};

const ASSIGNEES_LIMIT = 4;

const AssigneesIcons = ({
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

const TaskCardContent = ({
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

const TaskCard = ({
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

const StaticTaskCard = ({
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

const TaskList = ({
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

const TaskBoardContent = ({
  column,
  dragging = false,
  dragDisabled = false,
  dragHandleAttributes,
  dragHandleListeners,
  setDragHandleRef,
  onTaskDetailEnter,
  onTaskDetailLeave,
  sortable = true,
  projectId,
}: {
  column: TaskBoardResponseDTO;
  dragging?: boolean;
  dragDisabled?: boolean;
  dragHandleAttributes?: object;
  dragHandleListeners?: object;
  setDragHandleRef?: (element: HTMLElement | null) => void;
  onTaskDetailEnter?: () => void;
  onTaskDetailLeave?: () => void;
  sortable?: boolean;
  projectId?: string | null;
}) => {
  return (
    <div
      ref={setDragHandleRef}
      {...(!dragDisabled ? dragHandleAttributes : {})}
      {...(!dragDisabled ? dragHandleListeners : {})}
      className={[
        "group flex shrink-0 flex-col gap-2",
        dragDisabled ? "cursor-default" : "cursor-grab active:cursor-grabbing",
        dragging ? "opacity-50" : "",
      ].join(" ")}
      style={{ width: "var(--kanban-column-min-width, 280px)" }}
    >
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <div
          className={[
            "size-2.5 shrink-0 rounded-full",
            COLUMN_INDICATOR[column.status] ?? "bg-default-300",
          ].join(" ")}
        />
        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
          {column.title}
        </div>
        <div className="shrink-0 rounded-md bg-default-100 px-1.5 py-0.5 text-xs font-medium text-default-600">
          {column.tasks.length}
        </div>
        {/* Stop pointer-downs from reaching the dnd-kit drag handle so
            react-aria overlays (Dropdown) still open. Fade in on hover. */}
        <div
          className="ml-1 flex shrink-0 items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <EditTaskBoardModal column={column} />
          <AddTaskModal projectId={projectId} taskBoardID={column.id} />
        </div>
      </div>

      {/* Column body — rounded background panel */}
      <div
        className="flex flex-1 flex-col rounded-xl border border-default-200 bg-content2 p-2 dark:bg-default-100/30"
        style={{ minHeight: "var(--kanban-column-height, 480px)" }}
        onMouseEnter={onTaskDetailEnter}
        onMouseLeave={onTaskDetailLeave}
      >
        {sortable ? (
          <SortableContext
            id={getColumnId(column.id)}
            items={column.tasks.map((task) => getTaskId(task.id))}
            strategy={verticalListSortingStrategy}
          >
            <TaskList column={column} />
          </SortableContext>
        ) : (
          <TaskList column={column} sortable={false} />
        )}
      </div>
    </div>
  );
};

const TaskBoard = ({
  column,
  projectId,
}: {
  column: TaskBoardResponseDTO;
  projectId?: string | null;
}) => {
  const [isTaskDetailHovered, setIsTaskDetailHovered] = useState(false);
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition: sortableTransition,
  } = useSortable({
    id: getColumnId(column.id),
    data: {
      type: "column",
      columnId: column.id,
      column,
    },
    disabled: isTaskDetailHovered,
    transition,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: sortableTransition,
  };

  return (
    <div ref={setNodeRef} style={style} className="shrink-0">
      <TaskBoardContent
        column={column}
        dragging={isDragging}
        dragDisabled={isTaskDetailHovered}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
        setDragHandleRef={setActivatorNodeRef}
        onTaskDetailEnter={() => setIsTaskDetailHovered(true)}
        onTaskDetailLeave={() => setIsTaskDetailHovered(false)}
        projectId={projectId}
      />
    </div>
  );
};

export default function BoardDetail() {
  const queryClient = useQueryClient();
  const projectId = useSessionStore((s) => s.projectId);

  const { taskBoardQueryKey, invalidateTaskBoards } = useInvalidateQuery(
    projectId,
    queryClient,
  );

  const { data, isLoading } = useGetTaskBoard({
    projectId: projectId || "",
  });

  const columns: TaskBoardResponseDTO[] = data ?? [];

  const handleColumnsChange = useCallback(
    (nextColumns: TaskBoardResponseDTO[]) => {
      queryClient.setQueryData(taskBoardQueryKey, nextColumns);
    },
    [queryClient, taskBoardQueryKey],
  );

  const { mutation: saveTaskBoardOrderMutation } =
    useSaveTaskBoardPositionMutation({
      projectId: projectId || "",
      invalidateTaskBoards,
    });

  const { mutation: saveTaskPosition } = useSaveTaskPositionMutation({
    projectId: projectId || "",
    invalidateTaskBoards,
  });

  const {
    activeTask,
    activeTaskColumnId,
    activeColumn,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragState({
    columns,
    onColumnsChange: handleColumnsChange,
    onColumnDrop: ({ columns }) => {
      saveTaskBoardOrderMutation.mutate({
        orderedTaskBoardIds: columns.map((column) => column.id),
      });
    },
    onTaskDrop: ({ task, taskBoardId, columns }) => {
      saveTaskPosition.mutate({
        taskId: task.id,
        taskBoardId,
        orderedTaskIdsByBoard: columns.map((column) => ({
          taskBoardId: column.id,
          taskIds: column.tasks.map((columnTask) => columnTask.id),
        })),
      });
    },
  });

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const isLoadingView = isLoading;
  const isDragDropView = !isLoading && isMounted;
  const isStaticView = !isLoading && !isMounted;

  return (
    <div className="BoardDetail flex min-h-0 flex-col space-y-6 overflow-hidden">
      <ScrollShadow
        className="TaskBoardContainer flex min-h-[calc(100vh-5.5rem)] w-full gap-4"
        orientation="horizontal"
      >
        {isLoadingView && <BoardSkeleton />}
        {isDragDropView && (
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            sensors={sensors}
          >
            <SortableContext
              items={columns.map((column) => getColumnId(column.id))}
              strategy={horizontalListSortingStrategy}
            >
              {columns.map((column) => (
                <TaskBoard
                  key={column.id}
                  column={column}
                  projectId={projectId}
                />
              ))}
            </SortableContext>
            <AddTaskBoardModal
              invalidateTaskBoards={invalidateTaskBoards}
              projectId={projectId || ""}
            />
            <DragOverlay adjustScale={false}>
              {activeTask && (
                <TaskCardContent
                  data={activeTask}
                  dragging
                  projectTitle={
                    columns.find((c) => c.id === activeTaskColumnId)?.project
                      .title
                  }
                />
              )}

              {!activeTask && activeColumn && (
                <div style={{ width: "var(--kanban-column-min-width, 280px)" }}>
                  <TaskBoardContent column={activeColumn} dragging />
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
        {isStaticView && (
          <>
            {columns.map((column) => (
              <div key={column.id} className="shrink-0">
                <TaskBoardContent column={column} sortable={false} />
              </div>
            ))}
          </>
        )}
      </ScrollShadow>
    </div>
  );
}
