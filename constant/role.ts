import { Permissions } from "@/enum/permissions.enum";
import { ERoles } from "@/enum/role";

export const ROLE_PRESETS = {
  OWNER: {
    name: ERoles.OWNER,
    permissions: [
      Permissions.DashboardView,

      Permissions.BoardView,
      Permissions.BoardCreate,
      Permissions.BoardEdit,
      Permissions.BoardStatusEdit,
      Permissions.BoardDelete,

      Permissions.TaskView,
      Permissions.TaskCreate,
      Permissions.TaskEdit,
      Permissions.TaskDelete,

      Permissions.MemberView,
      Permissions.MemberInvite,
      Permissions.MemberEdit,
      Permissions.MemberDelete,

      Permissions.RolesView,
      Permissions.RolesEdit,
      Permissions.RolesDelete,
      Permissions.RolesCreate,

      Permissions.SettingsProjectView,
    ],
  },

  MEMBER: {
    name: ERoles.MEMBER,
    permissions: [
      Permissions.DashboardView,
      Permissions.BoardView,
      Permissions.BoardStatusEdit,
      Permissions.TaskView,
    ],
  },
} as const;
