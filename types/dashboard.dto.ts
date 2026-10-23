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
  dueDate?: string | null;
}

export interface DashboardDataResponseDTO {
  id: string;
  title: string;
  status: ETaskStatus;
  tasks: DashboardTaskResponse[];
}

export interface OverdueTaskDTO {
  id: string;
  ticketNumber: number;
  title: string;
  priority?: string | null;
  dueDate: string;
  boardTitle: string;
}

export interface UpcomingTaskDTO {
  id: string;
  ticketNumber: number;
  title: string;
  priority?: string | null;
  dueDate: string;
  boardTitle: string;
}

export interface MemberWorkloadDTO {
  memberId: string;
  name: string;
  image: string | null;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

export interface DashboardFullResponseDTO {
  boards: DashboardDataResponseDTO[];
  overdueTasks: OverdueTaskDTO[];
  upcomingTasks: UpcomingTaskDTO[];
  memberWorkload: MemberWorkloadDTO[];
}
