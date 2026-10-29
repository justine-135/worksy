import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

export const getDropColumnId = (
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

export const findTaskLocation = (
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

export const getColumnIndex = (
  columns: TaskBoardResponseDTO[],
  columnId: string,
) => {
  return columns.findIndex((column) => column.id === columnId);
};

export const moveTask = (
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

  return fromColumnId === toColumnId && adjustedTargetIndex === activeTaskIndex
    ? columns
    : nextColumns;
};
