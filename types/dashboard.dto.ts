import { ETaskStatus } from "@/enum/taskStatus.enum";

export interface TaskAssignees {
  projectMember: {
    user: {
      name: string;
      image: string;
    };
  };
}

export interface DashboardTaskResponse {
  id: string;
  status: ETaskStatus;
  assignees: TaskAssignees[];
  priority: string;
  ticketNumber: number;
  title: string;
}

export interface DashboardDataResponseDTO {
  id: string;
  title: string;
  status: ETaskStatus;
  tasks: DashboardTaskResponse[];
}
