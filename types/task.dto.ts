export interface TaskResponseDTO {
  id: string;
  title: string;
  description?: string;
  priority?: string;
  assignee?: {
    id: string;
    name: string;
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
