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
import { useCallback, useSyncExternalStore } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";
import useSaveTaskBoardPositionMutation from "@/hooks/taskboard/useSaveTaskBoardPositionMutation";
import useSaveTaskPositionMutation from "@/hooks/taskboard/useSaveTaskPositionMutation";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import BoardSkeleton from "./BoardSkeleton";
import { TaskBoard, TaskBoardContent } from "./kanban/TaskBoardColumn";
import { TaskCardContent } from "./kanban/TaskCard";
import AddTaskBoardModal from "./modal/AddTaskBoardModal";
import useDragState, { getColumnId } from "./useDragState";

interface BoardKanbanViewProps {
  columns: TaskBoardResponseDTO[];
  isLoading: boolean;
  projectId: string | null;
  invalidateTaskBoards: () => Promise<void>;
}

export default function BoardKanbanView({
  columns,
  isLoading,
  projectId,
  invalidateTaskBoards,
}: BoardKanbanViewProps) {
  const queryClient = useQueryClient();

  const taskBoardQueryKey = QUERY_KEYS.TASK_BOARDS(projectId);

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
    onColumnDrop: ({ columns: orderedColumns }) => {
      saveTaskBoardOrderMutation.mutate({
        orderedTaskBoardIds: orderedColumns.map((column) => column.id),
      });
    },
    onTaskDrop: ({ task, taskBoardId, columns: orderedColumns }) => {
      saveTaskPosition.mutate({
        taskId: task.id,
        taskBoardId,
        orderedTaskIdsByBoard: orderedColumns.map((column) => ({
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
