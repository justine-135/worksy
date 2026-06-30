import { EActivityLog } from "@/enum/activityLog.enum";

import { UserResponseDTO } from "./user.dto";

export interface ActivityLogResponseDTO {
  type: EActivityLog;
  actor: {
    user: UserResponseDTO;
  };
  statusChange: {
    fromBoard?: {
      title: string;
    };
    toBoard?: {
      title: string;
    };
  };
  comment?: {
    value: string;
    createdAt: string;
  };
  createdAt: true;
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
  statusChange: {
    toBoard?: { title: string } | null;
    fromBoard?: { title: string } | null;
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
