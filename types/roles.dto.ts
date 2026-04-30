export interface RolesTableDTO {
  id: string;
  name: string;
  createdAt: string;
}

export interface RolesResponseDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddRoleDTO {
  name: string;
  projectId: string;
  permissions: string[];
}

export interface CreateRoleInput {
  name: string;
  permissions: string[];
  projectId: string | null;
}
