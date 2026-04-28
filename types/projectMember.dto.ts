export interface CreateProjectMemberDTO {
  userId: string;
  projectId: string;
}

export interface ProjectMemberResponseDTO {
  id: string;
  roleId?: string | null;
  createdAt: Date;
  updatedAt: Date;
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
  role?: string | null;
  image: string | null;
  createdAt: string;
  updatedAt: string;
}
