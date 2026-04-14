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
