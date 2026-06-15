import { StatusDTO } from "@/enum/member";

export interface CreateProjectMemberDTO {
  userId: string;
  projectId: string;
}

export interface ProjectMemberResponseDTO {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  status: StatusDTO;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
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
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  createdAt: string;
  status: StatusDTO;
}

export interface EditMemberStatusRoleDTO {
  userId: string;
  roleId: string;
  status: StatusDTO;
}
