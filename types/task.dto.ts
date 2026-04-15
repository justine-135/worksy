export interface TaskResponseDTO {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  assignee?: {
    user: {
      name: string;
      image: string;
      id: string;
    };
  };
}

export interface CreateTaskDTO {
  title: string;
  description?: string;
  priority: string;
  taskBoardId: string;
  assigneeId: string;
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
