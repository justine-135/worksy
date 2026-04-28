import { Permissions } from "@/enum/permissions.enum";

export interface PermissionReponseDTO {
  id: string;
  key: string;
}

export type PermissionItem = {
  title: string;
  value: Permissions;
  detail: string;
};

export type PermissionGroup = {
  title: string;
  permissions: PermissionItem[];
};
