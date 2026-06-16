export interface RolesTableDTO {
  id: string;
  name: string;
  createdAt: string;
  permissions: {
    key: string;
  }[];
}

export interface RolesResponseDTO {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  permissions: {
    key: string;
  }[];
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

export interface EditRoleInput extends Omit<CreateRoleInput, "projectId"> {
  roleId: string;
}

export interface EditRoleDTO extends Omit<CreateRoleInput, "projectId"> {
  roleId: string;
}
