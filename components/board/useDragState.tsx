import { TaskResponseDTO } from "@/types/task.dto";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";
import {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from "@dnd-kit/core/dist/types/events";
import { arrayMove } from "@dnd-kit/sortable";
import { useEffect, useRef, useState } from "react";

export const getTaskId = (taskId: string) => `task-${taskId}`;

export const getColumnId = (columnId: string) => `column-${columnId}`;

export default function useDragState({
  columns,
  onColumnsChange,
  onTaskDrop,
  onColumnDrop,
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
}) {
  const [activeTask, setActiveTask] = useState<TaskResponseDTO | null>(null);
  const [activeColumn, setActiveColumn] = useState<TaskBoardResponseDTO | null>(
    null,
  );
  const columnsRef = useRef(columns);

  useEffect(() => {
    columnsRef.current = columns;
  }, [columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const activeData = event.active.data.current;

    if (activeData?.type === "task") {
      setActiveTask(activeData.task as TaskResponseDTO);
      return;
    }

    if (activeData?.type === "column") {
      setActiveColumn(activeData.column as TaskBoardResponseDTO);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
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

        onColumnsChange(
          currentColumns.map((column) =>
            column.id === toColumnId
              ? { ...column, tasks: reorderedTasks }
              : column,
          ),
        );
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
    onColumnsChange(nextColumns);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeData = active.data.current;
    const overData = over?.data.current;

    setActiveTask(null);
    setActiveColumn(null);

    if (!over) {
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
      }
    }

    if (activeData?.type === "task") {
      const currentColumns = columnsRef.current;
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
  };

  const getDropColumnId = (
    overId: string,
    overData?: Record<string, unknown>,
  ) => {
    if (overData?.type === "column" && typeof overData.columnId === "string") {
      return overData.columnId;
    }

    if (overData?.type === "task" && typeof overData.columnId === "string") {
      return overData.columnId;
    }

    if (overId.startsWith("column-")) {
      return overId.replace("column-", "");
    }

    return null;
  };

  const findTaskLocation = (
    columns: TaskBoardResponseDTO[],
    taskId: string,
  ) => {
    for (const column of columns) {
      const index = column.tasks.findIndex((task) => task.id === taskId);

      if (index !== -1) {
        return {
          columnId: column.id,
          index,
        };
      }
    }

    return null;
  };

  const getColumnIndex = (
    columns: TaskBoardResponseDTO[],
    columnId: string,
  ) => {
    return columns.findIndex((column) => column.id === columnId);
  };

  const moveTask = (
    columns: TaskBoardResponseDTO[],
    activeTaskId: string,
    fromColumnId: string,
    toColumnId: string,
    targetIndex?: number,
  ) => {
    const fromColumnIndex = getColumnIndex(columns, fromColumnId);
    const toColumnIndex = getColumnIndex(columns, toColumnId);

    if (fromColumnIndex === -1 || toColumnIndex === -1) {
      return columns;
    }

    const nextColumns = columns.map((column) => ({
      ...column,
      tasks: [...column.tasks],
    }));

    const activeTaskIndex = nextColumns[fromColumnIndex].tasks.findIndex(
      (task) => task.id === activeTaskId,
    );

    if (activeTaskIndex === -1) {
      return columns;
    }

    const [movedTask] = nextColumns[fromColumnIndex].tasks.splice(
      activeTaskIndex,
      1,
    );

    if (!movedTask) {
      return columns;
    }

    const destinationTasks = nextColumns[toColumnIndex].tasks;
    const normalizedTargetIndex =
      typeof targetIndex === "number"
        ? Math.min(Math.max(targetIndex, 0), destinationTasks.length)
        : destinationTasks.length;
    const adjustedTargetIndex =
      fromColumnId === toColumnId && activeTaskIndex < normalizedTargetIndex
        ? normalizedTargetIndex - 1
        : normalizedTargetIndex;

    destinationTasks.splice(adjustedTargetIndex, 0, movedTask);

    return fromColumnId === toColumnId &&
      adjustedTargetIndex === activeTaskIndex
      ? columns
      : nextColumns;
  };

  return {
    columns,
    activeTask,
    activeColumn,
    handleDragStart,
    getTaskId,
    handleDragOver,
    handleDragEnd,
  };
}
