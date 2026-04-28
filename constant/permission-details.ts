import { Permissions } from "@/enum/permissions.enum";
import { PermissionGroup } from "@/types/permission";

export const PermissionGroups: PermissionGroup[] = [
  {
    title: "Dashboard",
    permissions: [
      {
        title: "View Dashboard",
        value: Permissions.DashboardView,
        detail: "Users can view the dashboard",
      },
    ],
  },
  {
    title: "Board",
    permissions: [
      {
        title: "View Board",
        value: Permissions.BoardView,
        detail: "Users can view the board",
      },
      {
        title: "Create Task",
        value: Permissions.BoardTaskCreate,
        detail: "Users can create tasks",
      },
      {
        title: "Edit Task",
        value: Permissions.BoardTaskEdit,
        detail: "Users can edit tasks",
      },
      {
        title: "Edit Task Status",
        value: Permissions.BoardTaskStatusEdit,
        detail: "Users can change task status",
      },
      {
        title: "Delete Task",
        value: Permissions.BoardTaskDelete,
        detail: "Users can delete tasks",
      },
      {
        title: "Create Board",
        value: Permissions.BoardTaskBoardCreate,
        detail: "Users can create task boards",
      },
      {
        title: "Edit Board",
        value: Permissions.BoardTaskBoardEdit,
        detail: "Users can edit task boards",
      },
      {
        title: "Delete Board",
        value: Permissions.BoardTaskBoardDelete,
        detail: "Users can delete task boards",
      },
    ],
  },
  {
    title: "Members",
    permissions: [
      {
        title: "View Members",
        value: Permissions.MemberView,
        detail: "Users can view project members",
      },
      {
        title: "Invite Member",
        value: Permissions.MemberInvite,
        detail: "Users can invite new members",
      },
      {
        title: "Edit Member",
        value: Permissions.MemberEdit,
        detail: "Users can edit member roles and permissions",
      },
      {
        title: "Remove Member",
        value: Permissions.MemberDelete,
        detail: "Users can remove members from the project",
      },
    ],
  },
];
