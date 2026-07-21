import { ProjectsResponseDTO } from "./project.dto";
import { UserResponseDTO } from "./user.dto";

export interface CreateProjectInviteDTO {
  senderId: string;
  receiverId: string;
  projectId: string;
}

export type CreateProjectInvitePayload = Omit<
  CreateProjectInviteDTO,
  "senderId"
>;

export interface ProjectInviteResponseDTO {
  id: string;
  userSender: UserResponseDTO;
  project: Omit<ProjectsResponseDTO, "owner">;
  createdAt: Date;
}
