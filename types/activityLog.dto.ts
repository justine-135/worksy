import { EActivityLog } from "@/enum/activityLog.enum";
import { ETaskStatus } from "@/enum/taskStatus.enum";

import { UserResponseDTO } from "./user.dto";

export interface ActivityLogResponseDTO {
  type: EActivityLog;
  actor: {
    user: UserResponseDTO;
  };
  // Present on the member activity feed (used to deep-link a log to its task);
  // omitted by the task drawer timeline, where the task is already known.
  task?: {
    id: string;
    ticketNumber: number;
    title: string;
  } | null;
  // A task moved between board columns (type COLUMN_CHANGE).
  columnChange?: {
    fromBoard?: {
      title: string;
    };
    toBoard?: {
      title: string;
    };
  } | null;
  // A task's status field changed (type STATUS_CHANGE).
  statusChange?: {
    fromStatus: ETaskStatus;
    toStatus: ETaskStatus;
  } | null;
  comment?: {
    value: string;
    createdAt: string;
  };
  createdAt: string;
}

/**
 * Project-wide activity feed entry (dashboard). Unlike ActivityLogResponseDTO
 * (used in the task drawer timeline) this carries the related task's ticket so
 * the feed can render "moved TASK-12 -> Done".
 */
export interface ProjectActivityResponseDTO {
  id: string;
  type: EActivityLog;
  createdAt: string;
  actor: {
    user: {
      name: string | null;
      image: string | null;
    };
  };
  task: {
    ticketNumber: number;
    title: string;
  } | null;
  columnChange: {
    toBoard?: { title: string } | null;
    fromBoard?: { title: string } | null;
  } | null;
  statusChange: {
    fromStatus: ETaskStatus;
    toStatus: ETaskStatus;
  } | null;
}

export interface CommentDTO {
  type: EActivityLog;
  projectId: string;
  userId: string;
  taskId: string;
  value: string;
}

export type CommentPayload = Partial<CommentDTO>;
