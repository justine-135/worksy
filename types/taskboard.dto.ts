import { TaskResponseDTO } from "./task.dto";

export interface TaskBoardDTO {
  id: string;
  title: string;
  tasks: TaskResponseDTO[];
}
