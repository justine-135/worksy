export enum EActivityLog {
  COLUMN_CHANGE = "COLUMN_CHANGE", // a task moved between board columns
  STATUS_CHANGE = "STATUS_CHANGE", // a task's status field changed
  COMMENT = "COMMENT",
  TASK_CREATE = "TASK_CREATE",
  ASSIGNEE_CHANGE = "ASSIGNEE_CHANGE",
  PARENT_CHANGE = "PARENT_CHANGE", // a task's parent (hierarchy) link changed
}
