import { ETaskStatus } from "@/enum/taskStatus.enum";

import { TaskResponseDTO } from "./task.dto";

export interface TaskBoardResponseDTO {
  id: string;
  title: string;
  status: ETaskStatus;
  order: number;
  tasks: TaskResponseDTO[];
  project: {
    title: string;
  };
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

export interface TaskBoardPositionMutationDTO extends Omit<
  UserProjectParamsDTO,
  "userId"
> {
  invalidateTaskBoards: () => Promise<void>;
}

export interface CreateTaskBoardDTO {
  title: string;
  projectId: string;
}

export interface UpdateTaskBoardDTO {
  projectId: string;
  userId: string;
  taskBoardId: string;
  title: string;
  status: ETaskStatus;
}

export type UpdateTaskBoardPayload = Omit<UpdateTaskBoardDTO, "userId">;

// Which resource a DELETE targets: the column itself, or just its tasks.
export type DeleteTaskBoardTarget = "board" | "tasks";

export interface DeleteTaskBoardDTO {
  projectId: string;
  userId: string;
  taskBoardId: string;
  target: DeleteTaskBoardTarget;
}

export type DeleteTaskBoardPayload = Omit<DeleteTaskBoardDTO, "userId">;
