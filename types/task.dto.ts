import { ETaskPriority } from "@/enum/taskPriority.enum";
import { ETaskStatus } from "@/enum/taskStatus.enum";

import { ActivityLogResponseDTO } from "./activityLog.dto";
import { UserResponseDTO } from "./user.dto";

export interface TaskResponseDTO {
  id: string;
  projectId: string;
  taskBoardId: string;
  status: ETaskStatus;
  title: string;
  ticketNumber: number;
  description?: string | null;
  priority: ETaskPriority;
  assignees?: {
    projectMember: {
      id: string;
      user: UserResponseDTO;
    };
  }[];
  createdBy: {
    user: UserResponseDTO;
  };
  createdAt: string;
  activityLog: ActivityLogResponseDTO[];
  // Task hierarchy is a DAG: a task can have many `parents` and many `children`
  // (subtasks). Both are flattened from the TaskRelation join.
  parents?: {
    id: string;
    title: string;
    ticketNumber: number;
  }[];
  children?: {
    id: string;
    title: string;
    ticketNumber: number;
    status: ETaskStatus;
  }[];
  currentUser: Omit<UserResponseDTO, "id">;
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: string;
  taskBoardId: string;
  assignees?: string[];
  projectId: string;
  userId: string;
  // Resolved parent task id (Parent -> selected task; Sibling -> selected
  // task's parent). null/undefined for a top-level task.
  parentId?: string | null;
}

export type CreateTaskPayload = Omit<CreateTaskDTO, "userId">;

/** Lightweight task row returned by the relationship search picker. */
export interface TaskSearchResultDTO {
  id: string;
  title: string;
  ticketNumber: number;
}

/**
 * Add or remove one parent -> child edge. The current task is `childId` when
 * adding a parent, or `parentId` when adding a subtask.
 */
export interface UpdateTaskRelationDTO {
  projectId: string;
  userId: string;
  parentId: string;
  childId: string;
  action: "add" | "remove";
}

export type UpdateTaskRelationPayload = Omit<UpdateTaskRelationDTO, "userId">;

export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export interface UpdateTaskAssigneesDTO {
  projectId: string;
  userId: string;
  taskId: string;
  assignees: string[];
}

export type UpdateTaskAssigneesPayload = Omit<UpdateTaskAssigneesDTO, "userId">;

export interface UpdateTaskStatusDTO {
  projectId: string;
  taskId: string;
  userId: string;
  status: ETaskStatus;
}

export type UpdateTaskStatusPayload = Omit<UpdateTaskStatusDTO, "userId">;

export interface UpdateTaskPositionDTO {
  projectId: string;
  userId: string;
  taskId: string;
  taskBoardId: string;
  orderedTaskIdsByBoard: Array<{
    taskBoardId: string;
    taskIds: string[];
  }>;
}
