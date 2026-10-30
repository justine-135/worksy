"use client";

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { ScrollShadow } from "@heroui/react/scroll-shadow";
import { useQueryClient } from "@tanstack/react-query";
import React, { useCallback, useMemo, useSyncExternalStore } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useSaveTaskBoardPositionMutation from "@/hooks/taskboard/useSaveTaskBoardPositionMutation";
import useSaveTaskPositionMutation from "@/hooks/taskboard/useSaveTaskPositionMutation";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import BoardSkeleton from "./BoardSkeleton";
import { TaskBoard, TaskBoardContent } from "./kanban/TaskBoardColumn";
import { TaskCardContent } from "./kanban/TaskCard";
import AddTaskBoardModal from "./modal/AddTaskBoardModal";
import useDragState, { getColumnId } from "./useDragState";

const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 8 } } as const;

interface BoardKanbanViewProps {
  columns: TaskBoardResponseDTO[];
  isLoading: boolean;
  projectId: string | null;
  invalidateTaskBoards: () => Promise<void>;
  isDraggingRef?: React.RefObject<boolean>;
}

export default function BoardKanbanView({
  columns,
  isLoading,
  projectId,
  invalidateTaskBoards,
  isDraggingRef,
}: BoardKanbanViewProps) {
  const queryClient = useQueryClient();

  const taskBoardQueryKey = useMemo(
    () => QUERY_KEYS.TASK_BOARDS(projectId),
    [projectId],
  );

  const handleColumnsChange = useCallback(
    (nextColumns: TaskBoardResponseDTO[]) => {
      queryClient.setQueryData(taskBoardQueryKey, nextColumns);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryClient, projectId],
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

  const handleColumnDrop = useCallback(
    ({
      columns: orderedColumns,
    }: {
      taskBoardId: string;
      position: number;
      columns: TaskBoardResponseDTO[];
    }) => {
      saveTaskBoardOrderMutation.mutate({
        orderedTaskBoardIds: orderedColumns.map((column) => column.id),
      });
    },
    [saveTaskBoardOrderMutation],
  );

  const handleTaskDrop = useCallback(
    ({
      task,
      taskBoardId,
      columns: orderedColumns,
    }: {
      task: TaskResponseDTO;
      taskBoardId: string;
      position: number;
      columns: TaskBoardResponseDTO[];
    }) => {
      saveTaskPosition.mutate({
        taskId: task.id,
        taskTitle: task.title,
        taskBoardId,
        orderedTaskIdsByBoard: orderedColumns.map((column) => ({
          taskBoardId: column.id,
          taskIds: column.tasks.map((columnTask) => columnTask.id),
        })),
      });
    },
    [saveTaskPosition],
  );

  const {
    activeTask,
    activeTaskColumnId,
    activeColumn,
    dragColumns,
    isDragging,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDragState({
    columns,
    onColumnsChange: handleColumnsChange,
    isDraggingRef,
    onColumnDrop: handleColumnDrop,
    onTaskDrop: handleTaskDrop,
  });

  const displayColumns = dragColumns ?? columns;

  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const sensors = useSensors(useSensor(PointerSensor, POINTER_SENSOR_OPTIONS));

  const isLoadingView = isLoading;
  const isDragDropView = !isLoading && isMounted;
  const isStaticView = !isLoading && !isMounted;

  return (
    <div className="BoardKanbanView flex min-h-0 flex-col space-y-6 overflow-hidden">
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
              items={displayColumns.map((column) => getColumnId(column.id))}
              strategy={horizontalListSortingStrategy}
            >
              {displayColumns.map((column) => (
                <TaskBoard
                  key={column.id}
                  column={column}
                  projectId={projectId}
                  boardIsDragging={isDragging}
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
                    displayColumns.find((c) => c.id === activeTaskColumnId)?.project
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
