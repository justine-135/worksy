/**
 * A task's progress status — independent of which board column it sits in.
 * Mirrors the Prisma `TaskStatus` enum (kept as a plain TS enum so the client
 * bundle doesn't have to import the generated Prisma types).
 */
export enum ETaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export const TASK_STATUS_LABELS: Record<ETaskStatus, string> = {
  [ETaskStatus.TODO]: "Todo",
  [ETaskStatus.IN_PROGRESS]: "In Progress",
  [ETaskStatus.DONE]: "Done",
};

/** Ordered list for rendering the status dropdown. */
export const TASK_STATUS_OPTIONS: ETaskStatus[] = [
  ETaskStatus.TODO,
  ETaskStatus.IN_PROGRESS,
  ETaskStatus.DONE,
];
