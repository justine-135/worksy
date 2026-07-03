import { ETaskPriority } from "@/enum/taskPriority.enum";

// Shared, ordered list (highest → lowest) used by the priority <Select> in the
// Add Task modal, the project default-priority picker, and PriorityBadge. Keep
// this the only place that maps a priority value to its label/badge classes.
export const PRIORITY_OPTIONS: {
  value: ETaskPriority;
  label: string;
  badgeClassName: string;
}[] = [
  {
    value: ETaskPriority.URGENT,
    label: "Urgent",
    badgeClassName: "bg-danger-soft text-danger",
  },
  {
    value: ETaskPriority.HIGH,
    label: "High",
    badgeClassName: "bg-danger-soft text-danger",
  },
  {
    value: ETaskPriority.MEDIUM,
    label: "Medium",
    badgeClassName: "bg-warning-soft text-warning",
  },
  {
    value: ETaskPriority.LOW,
    label: "Low",
    badgeClassName: "bg-success-soft text-success",
  },
];

export const DEFAULT_TASK_PRIORITY = ETaskPriority.MEDIUM;

// Fast value → option lookup (e.g. for PriorityBadge).
export const PRIORITY_CONFIG = Object.fromEntries(
  PRIORITY_OPTIONS.map((option) => [option.value, option]),
) as Record<ETaskPriority, (typeof PRIORITY_OPTIONS)[number]>;
