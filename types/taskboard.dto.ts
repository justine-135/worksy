import { TaskResponseDTO } from "./task.dto";

export interface TaskBoardResponseDTO {
  id: string;
  title: string;
  order: number;
  tasks: TaskResponseDTO[];
}

export interface UpdateTaskBoardPositionDTO {
  projectId: string;
  userId: string;
  orderedTaskBoardIds: string[];
}

export interface UserProjectParamsDTO {
  userId: string;
  projectId: string;
}

export interface TaskBoardPositionMutationDTO extends UserProjectParamsDTO {
  invalidateTaskBoards: () => Promise<void>;
}
