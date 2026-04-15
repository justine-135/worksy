"use client";

import { Avatar } from "@heroui/react/avatar";
import { Card } from "@heroui/react/card";
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
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import useDragState, { getColumnId, getTaskId } from "./useDragState";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";
import AddTaskModal from "./AddTaskModal";
import { TaskResponseDTO } from "@/types/task.dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGetTaskBoard } from "@/lib/taskboard/fetchTaskBoard";

const transition = {
  duration: 220,
  easing: "cubic-bezier(0.2, 1, 0.36, 1)",
};

const TaskCardContent = ({
  data,
  dragging = false,
}: {
  data: TaskResponseDTO;
  dragging?: boolean;
}) => {
  const { title, id, assignee } = data;

  return (
    <Card
      className={[
        "w-full min-w-0 gap-2 rounded-xl border border-default-200/80 bg-content1/95",
        "transition-[box-shadow,transform,opacity] duration-200 ease-out will-change-transform",
        dragging
          ? "cursor-grabbing shadow-xl ring-1 ring-primary/20"
          : "cursor-grab active:cursor-grabbing shadow-sm",
      ].join(" ")}
    >
      <Card.Header className="min-w-0">
        <Card.Title className="truncate">{title}</Card.Title>
        <Card.Description>#{id}</Card.Description>
      </Card.Header>

      <Card.Footer className="flex min-w-0 gap-2">
        <Avatar className="size-5 shrink-0">
          <Avatar.Image src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg" />
          <Avatar.Fallback className="text-xs">IH</Avatar.Fallback>
        </Avatar>

        <span className="truncate text-xs text-default-600">
          {!assignee ? "Unassigned" : `Assigned to ${assignee.user.name}`}
        </span>
      </Card.Footer>
    </Card>
  );
};

const TaskCard = ({
  data,
  columnId,
}: {
  data: TaskResponseDTO;
  columnId: string;
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
    opacity: isDragging ? 0.35 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-none"
    >
      <TaskCardContent data={data} dragging={isDragging} />
    </div>
  );
};

const StaticTaskCard = ({ data }: { data: TaskResponseDTO }) => {
  return (
    <div className="touch-none">
      <TaskCardContent data={data} />
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
    <div
      ref={setNodeRef}
      className={[
        "grid min-h-24 place-items-center rounded-lg border border-dashed text-xs transition-colors",
        isOver
          ? "border-primary/40 bg-default-100/70 text-default-700"
          : "border-default-200 text-default-500",
      ].join(" ")}
    >
      Drop a task here
    </div>
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
      {sortable
        ? column.tasks.map((task) => (
            <TaskCard key={task.id} data={task} columnId={column.id} />
          ))
        : column.tasks.map((task) => (
            <StaticTaskCard key={task.id} data={task} />
          ))}

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
}) => {
  return (
    <Card
      ref={setDragHandleRef}
      {...(!dragDisabled ? dragHandleAttributes : {})}
      {...(!dragDisabled ? dragHandleListeners : {})}
      className={[
        "flex h-full min-h-72 min-w-[20rem] max-w-[20rem] flex-col rounded-xl border border-default-200/80 p-1 shadow-sm",
        dragDisabled
          ? "bg-content1/95 cursor-default"
          : "bg-content1/95 cursor-grab active:cursor-grabbing hover:bg-gray-200 active:opacity-70",
        dragging ? "shadow-xl ring-1 ring-primary/20" : "",
      ].join(" ")}
    >
      <div
        className="TaskDetail h-full rounded-lg bg-white p-1 cursor-default"
        onMouseEnter={onTaskDetailEnter}
        onMouseLeave={onTaskDetailLeave}
      >
        <div className="mb-3 flex items-center gap-2">
          <div className="truncate font-semibold">{column.title}</div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-default-100 px-2 py-0 text-xs text-default-600 bg-gray-100">
              {column.tasks.length}
            </div>
          </div>
          <div className="ml-auto">
            <AddTaskModal />
          </div>
        </div>

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
    </Card>
  );
};

const TaskBoard = ({ column }: { column: TaskBoardResponseDTO }) => {
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
    opacity: isDragging ? 0.45 : 1,
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
      />
    </div>
  );
};

export default function BoardDetail({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const queryClient = useQueryClient();
  const taskBoardQueryKey = useMemo(
    () => ["taskBoard", userId, projectId] as const,
    [projectId, userId],
  );

  // Queries
  const { data, isLoading } = useGetTaskBoard({
    userId,
    projectId,
  });

  const invalidateTaskBoards = async () => {
    await queryClient.invalidateQueries({
      queryKey: taskBoardQueryKey,
    });
  };

  const columns: TaskBoardResponseDTO[] = data ?? [];

  const handleColumnsChange = useCallback(
    (nextColumns: TaskBoardResponseDTO[]) => {
      queryClient.setQueryData(taskBoardQueryKey, nextColumns);
    },
    [queryClient, taskBoardQueryKey],
  );

  const saveTaskBoardOrderMutation = useMutation({
    mutationFn: async ({
      orderedTaskBoardIds,
    }: {
      orderedTaskBoardIds: string[];
    }) => {
      const response = await fetch("/api/taskboard", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          userId,
          orderedTaskBoardIds,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save task board order");
      }

      return response.json();
    },
    onSettled: invalidateTaskBoards,
  });

  const saveTaskPositionMutation = useMutation({
    mutationFn: async ({
      taskId,
      taskBoardId,
      orderedTaskIdsByBoard,
    }: {
      taskId: string;
      taskBoardId: string;
      orderedTaskIdsByBoard: Array<{
        taskBoardId: string;
        taskIds: string[];
      }>;
    }) => {
      const response = await fetch("/api/task", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          userId,
          taskId,
          taskBoardId,
          orderedTaskIdsByBoard,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save task position");
      }

      return response.json();
    },
    onSettled: invalidateTaskBoards,
  });

  const {
    activeTask,
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
      saveTaskPositionMutation.mutate({
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

  if (isLoading) return <div>Loading ...</div>;
  return (
    <div className="flex min-h-0 flex-col space-y-6 overflow-hidden">
      <h1 className="font-semibold text-2xl">Board</h1>

      {isMounted ? (
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
            <div className="flex min-h-[calc(100vh-200px)] gap-4 overflow-x-auto overflow-y-hidden px-1 py-4">
              {columns.map((column) => (
                <TaskBoard key={column.id} column={column} />
              ))}
            </div>
          </SortableContext>

          <DragOverlay adjustScale={false}>
            {activeTask ? <TaskCardContent data={activeTask} dragging /> : null}
            {!activeTask && activeColumn ? (
              <div className="w-[20rem]">
                <TaskBoardContent column={activeColumn} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="flex min-h-[calc(100vh-200px)] gap-4 overflow-x-auto overflow-y-hidden px-1 py-4">
          {columns.map((column) => (
            <div key={column.id} className="shrink-0">
              <TaskBoardContent column={column} sortable={false} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
