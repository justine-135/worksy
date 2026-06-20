import { StatusDTO } from "@/enum/member";

import { UserResponseDTO } from "./user.dto";

export interface CreateProjectMemberDTO {
  userId: string;
  projectId: string;
}

export interface ProjectMemberResponseDTO {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: StatusDTO;
  user: UserResponseDTO;
  role: {
    id: string;
    name: string;
  };
}

export interface ProjectMemberTableDTO {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
  user: UserResponseDTO;
  createdAt: string;
  status: StatusDTO;
}

export interface EditMemberStatusRoleDTO {
  userId: string;
  roleId: string;
  status: StatusDTO;
}
