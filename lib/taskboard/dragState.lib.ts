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

  const fromColumn = columns[fromColumnIndex];
  const activeTaskIndex = fromColumn.tasks.findIndex(
    (task) => task.id === activeTaskId,
  );

  if (activeTaskIndex === -1) {
    return columns;
  }

  const movedTask = fromColumn.tasks[activeTaskIndex];

  if (!movedTask) {
    return columns;
  }

  const fromTasks = [
    ...fromColumn.tasks.slice(0, activeTaskIndex),
    ...fromColumn.tasks.slice(activeTaskIndex + 1),
  ];

  let toTasks: typeof fromTasks;

  if (fromColumnId === toColumnId) {
    // Same-column reorder: operate on the already-spliced fromTasks array
    const destinationLength = fromTasks.length;
    const normalizedTargetIndex =
      typeof targetIndex === "number"
        ? Math.min(Math.max(targetIndex, 0), destinationLength)
        : destinationLength;
    const adjustedTargetIndex =
      activeTaskIndex < normalizedTargetIndex
        ? normalizedTargetIndex - 1
        : normalizedTargetIndex;

    if (adjustedTargetIndex === activeTaskIndex) {
      return columns;
    }

    toTasks = [
      ...fromTasks.slice(0, adjustedTargetIndex),
      movedTask,
      ...fromTasks.slice(adjustedTargetIndex),
    ];

    return columns.map((col, i) => {
      if (i === fromColumnIndex) return { ...col, tasks: toTasks };
      return col; // stable reference — React.memo comparators skip these
    });
  }

  // Cross-column move
  const destinationColumn = columns[toColumnIndex];
  const normalizedTargetIndex =
    typeof targetIndex === "number"
      ? Math.min(Math.max(targetIndex, 0), destinationColumn.tasks.length)
      : destinationColumn.tasks.length;

  toTasks = [
    ...destinationColumn.tasks.slice(0, normalizedTargetIndex),
    movedTask,
    ...destinationColumn.tasks.slice(normalizedTargetIndex),
  ];

  return columns.map((col, i) => {
    if (i === fromColumnIndex) return { ...col, tasks: fromTasks };
    if (i === toColumnIndex) return { ...col, tasks: toTasks };
    return col; // stable reference — React.memo comparators skip these
  });
};
