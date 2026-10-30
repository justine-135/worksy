import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core/dist/types/events";
import { arrayMove } from "@dnd-kit/sortable";
import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  findTaskLocation,
  getColumnIndex,
  getDropColumnId,
  moveTask,
} from "@/lib/taskboard/dragState.lib";
import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

export const getTaskId = (taskId: string) => `task-${taskId}`;

export const getColumnId = (columnId: string) => `column-${columnId}`;

export default function useDragState({
  columns,
  onColumnsChange,
  onTaskDrop,
  onColumnDrop,
  isDraggingRef,
}: {
  columns: TaskBoardResponseDTO[];
  onColumnsChange: (columns: TaskBoardResponseDTO[]) => void;
  onTaskDrop?: (payload: {
    task: TaskResponseDTO;
    taskBoardId: string;
    position: number;
    columns: TaskBoardResponseDTO[];
  }) => void;
  onColumnDrop?: (payload: {
    taskBoardId: string;
    position: number;
    columns: TaskBoardResponseDTO[];
  }) => void;
  isDraggingRef?: React.RefObject<boolean>;
}) {
  const [activeTask, setActiveTask] = useState<TaskResponseDTO | null>(null);
  const [activeTaskColumnId, setActiveTaskColumnId] = useState<string | null>(null);
  const [activeColumn, setActiveColumn] = useState<TaskBoardResponseDTO | null>(
    null,
  );
  const [dragColumns, setDragColumns] = useState<TaskBoardResponseDTO[] | null>(null);
  const columnsRef = useRef(columns);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const activeData = event.active.data.current;

    setDragColumns(columnsRef.current);
    if (isDraggingRef) isDraggingRef.current = true;

    if (activeData?.type === "task") {
      setActiveTask(activeData.task as TaskResponseDTO);
      setActiveTaskColumnId(activeData.columnId as string);
      return;
    }

    if (activeData?.type === "column") {
      setActiveColumn(activeData.column as TaskBoardResponseDTO);
    }
  }, [isDraggingRef]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "task") {
      return;
    }

    const toColumnId = getDropColumnId(
      String(over.id),
      overData as Record<string, unknown> | undefined,
    );

    if (!toColumnId) {
      return;
    }

    const isBelowOverTask =
      overData?.type === "task" &&
      !!active.rect.current.translated &&
      active.rect.current.translated.top +
        active.rect.current.translated.height / 2 >
        over.rect.top + over.rect.height / 2;

    const currentColumns = columnsRef.current;
    const activeTaskId = activeData.task.id;
    const activeLocation = findTaskLocation(currentColumns, activeTaskId);
    const destinationColumnIndex = getColumnIndex(currentColumns, toColumnId);

    if (!activeLocation || destinationColumnIndex === -1) {
      return;
    }

    if (overData?.type === "task") {
      const overTaskId = overData.task.id;
      const overTaskIndex = currentColumns[
        destinationColumnIndex
      ].tasks.findIndex((task) => task.id === overTaskId);

      if (overTaskIndex === -1) {
        return;
      }

      if (activeLocation.columnId === toColumnId) {
        if (activeLocation.index === overTaskIndex) {
          return;
        }

        const reorderedTasks = arrayMove(
          currentColumns[destinationColumnIndex].tasks,
          activeLocation.index,
          overTaskIndex,
        );

        const nextColumns = currentColumns.map((column) =>
          column.id === toColumnId
            ? { ...column, tasks: reorderedTasks }
            : column,
        );
        columnsRef.current = nextColumns;
        setDragColumns(nextColumns);
        return;
      }
    }

    let targetIndex = currentColumns[destinationColumnIndex].tasks.length;

    if (overData?.type === "task") {
      const overTaskIndex = currentColumns[
        destinationColumnIndex
      ].tasks.findIndex((task) => task.id === overData.task.id);

      if (overTaskIndex !== -1) {
        targetIndex = overTaskIndex + (isBelowOverTask ? 1 : 0);
      }
    }

    const nextColumns = moveTask(
      currentColumns,
      activeTaskId,
      activeLocation.columnId,
      toColumnId,
      targetIndex,
    );

    if (nextColumns === currentColumns) {
      return;
    }

    activeData.columnId = toColumnId;
    columnsRef.current = nextColumns;
    setDragColumns(nextColumns);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current;
    const overData = over?.data.current;

    setActiveTask(null);
    setActiveTaskColumnId(null);
    setActiveColumn(null);

    if (!over) {
      if (isDraggingRef) isDraggingRef.current = false;
      setDragColumns(null);
      return;
    }

    if (activeData?.type === "column") {
      const currentColumns = columnsRef.current;
      const oldIndex = currentColumns.findIndex(
        (column) => getColumnId(column.id) === active.id,
      );
      const targetColumnId = getDropColumnId(
        String(over.id),
        overData as Record<string, unknown> | undefined,
      );
      const newIndex = currentColumns.findIndex(
        (column) => column.id === targetColumnId,
      );

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const nextColumns = arrayMove(currentColumns, oldIndex, newIndex);
        const movedColumn = nextColumns[newIndex];

        onColumnsChange(nextColumns);
        onColumnDrop?.({
          taskBoardId: movedColumn.id,
          position: newIndex,
          columns: nextColumns,
        });
      } else {
        // No reorder — still sync final state to query cache
        onColumnsChange(columnsRef.current);
      }
    }

    if (activeData?.type === "task") {
      const currentColumns = columnsRef.current;
      // Sync final drag state to query cache once
      onColumnsChange(currentColumns);

      const finalColumnId = activeData.columnId;
      const finalColumn = currentColumns.find(
        (column) => column.id === finalColumnId,
      );
      const finalTaskIndex =
        finalColumn?.tasks.findIndex(
          (task) => task.id === activeData.task.id,
        ) ?? -1;

      onTaskDrop?.({
        task: activeData.task,
        taskBoardId: finalColumnId,
        position: finalTaskIndex,
        columns: currentColumns,
      });
    }

    if (isDraggingRef) isDraggingRef.current = false;
    setDragColumns(null);
  }, [isDraggingRef, onColumnsChange, onColumnDrop, onTaskDrop]);

  return {
    columns,
    dragColumns,
    isDragging: dragColumns !== null,
    activeTask,
    activeTaskColumnId,
    activeColumn,
    handleDragStart,
    getTaskId,
    handleDragOver,
    handleDragEnd,
  };
}
