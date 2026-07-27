export enum ETaskPriority {
  URGENT = "urgent",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export const TASK_PRIORITY_LABELS: Record<ETaskPriority, string> = {
  [ETaskPriority.URGENT]: "Urgent",
  [ETaskPriority.HIGH]: "High",
  [ETaskPriority.MEDIUM]: "Medium",
  [ETaskPriority.LOW]: "Low",
};

export const PRIORITY_CHIP: Record<ETaskPriority, string> = {
  [ETaskPriority.URGENT]: "danger",
  [ETaskPriority.HIGH]: "warning",
  [ETaskPriority.MEDIUM]: "accent",
  [ETaskPriority.LOW]: "default",
};
