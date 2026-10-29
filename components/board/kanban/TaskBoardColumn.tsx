"use client";

import { useSortable } from "@dnd-kit/sortable";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from "react";

import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import AddTaskModal from "../modal/AddTaskModal";
import EditTaskBoardModal from "../modal/EditTaskBoardModal";
import { getColumnId, getTaskId } from "../useDragState";
import { TaskList, transition } from "./TaskCard";

/** Matches HeroUI Pro Kanban column indicator dot colors by task status. */
const COLUMN_INDICATOR: Record<string, string> = {
  TODO: "bg-default-400",
  IN_PROGRESS: "bg-warning",
  DONE: "bg-success",
};

const TaskBoardContentBase = ({
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
  boardIsDragging,
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
  boardIsDragging?: boolean;
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
            <TaskList column={column} boardIsDragging={boardIsDragging} />
          </SortableContext>
        ) : (
          <TaskList column={column} sortable={false} />
        )}
      </div>
    </div>
  );
};

export const TaskBoardContent = React.memo(
  TaskBoardContentBase,
  (prev, next) =>
    prev.column.id === next.column.id &&
    prev.column.tasks.length === next.column.tasks.length &&
    prev.column.tasks.every((t, i) => t.id === next.column.tasks[i]?.id) &&
    prev.dragging === next.dragging &&
    prev.dragDisabled === next.dragDisabled &&
    prev.sortable === next.sortable &&
    prev.projectId === next.projectId &&
    prev.boardIsDragging === next.boardIsDragging,
);

TaskBoardContent.displayName = "TaskBoardContent";

export const TaskBoard = ({
  column,
  projectId,
  boardIsDragging,
}: {
  column: TaskBoardResponseDTO;
  projectId?: string | null;
  boardIsDragging?: boolean;
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
        boardIsDragging={boardIsDragging}
      />
    </div>
  );
};
