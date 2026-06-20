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

export interface CommentDTO {
  type: EActivityLog;
  projectId: string;
  userId: string;
  taskId: string;
  value: string;
}

export type CommentPayload = Partial<CommentDTO>;
