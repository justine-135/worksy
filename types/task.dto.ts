import { ActivityLogResponseDTO } from "./activityLog.dto";
import { UserResponseDTO } from "./user.dto";

export interface TaskResponseDTO {
  id: string;
  projectId: string;
  taskBoardId: string;
  title: string;
  ticketNumber: number;
  description?: string | null;
  priority?: string | null;
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

export interface UpdateTaskAssigneesDTO {
  projectId: string;
  userId: string;
  taskId: string;
  assignees: string[];
}

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
