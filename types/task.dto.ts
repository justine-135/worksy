import { UserResponseDTO } from "./user.dto";
import { ActivityLogResponseDTO } from "./activityLog.dto";

export interface TaskResponseDTO {
  id: string;
  title: string;
  ticketNumber: number;
  description?: string | null;
  priority?: string | null;
  assignees?: {
    projectMember: {
      user: UserResponseDTO;
    };
  }[];
  createdBy: {
    user: UserResponseDTO;
  };
  createdAt: string;
  activityLog: ActivityLogResponseDTO[];
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: string;
  taskBoardId: string;
  assignees?: string[];
  projectId: string;
  userId: string;
}

export type UpdateTaskDTO = Partial<CreateTaskDTO>;

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
