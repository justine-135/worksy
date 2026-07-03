import { Permissions } from "@/enum/permissions.enum";

interface IPermissionDetails {
  name: string;
  permission: {
    name: string;
    key: Permissions;
    content: string;
  }[];
}

export const PERMISSIONS: IPermissionDetails[] = [
  {
    name: "Dashboard",
    permission: [
      {
        name: "Dashboard View",
        key: Permissions.DashboardView,
        content: "Allows viewing the project dashboard.",
      },
    ],
  },
  {
    name: "Board",
    permission: [
      {
        name: "Board View",
        key: Permissions.BoardView,
        content: "Allows viewing boards within the project.",
      },
      {
        name: "Board Create",
        key: Permissions.BoardCreate,
        content: "Allows creating new boards in the project.",
      },
      {
        name: "Board Edit",
        key: Permissions.BoardEdit,
        content: "Allows editing existing boards in the project.",
      },
      {
        name: "Board Status Edit",
        key: Permissions.BoardStatusEdit,
        content: "Allows changing the status of boards in the project.",
      },
      {
        name: "Board Delete",
        key: Permissions.BoardDelete,
        content: "Allows deleting boards from the project.",
      },
    ],
  },
  {
    name: "Task",
    permission: [
      {
        name: "Task View",
        key: Permissions.TaskView,
        content: "Allows viewing tasks within the project.",
      },
      {
        name: "Task Create",
        key: Permissions.TaskCreate,
        content: "Allows creating new tasks in the project.",
      },

      {
        name: "Task Edit",
        key: Permissions.TaskEdit,
        content: "Allows editing existing tasks in the project.",
      },

      {
        name: "Task Delete",
        key: Permissions.TaskDelete,
        content: "Allows deleting tasks from the project.",
      },
    ],
  },
  {
    name: "Member",
    permission: [
      {
        name: "Member View",
        key: Permissions.MemberView,
        content: "Allows viewing project members.",
      },
      {
        name: "Member Invite",
        key: Permissions.MemberInvite,
        content: "Allows inviting new members to the project.",
      },
      {
        name: "Member Edit",
        key: Permissions.MemberEdit,
        content: "Allows editing member roles and permissions in the project.",
      },
      {
        name: "Member Delete",
        key: Permissions.MemberDelete,
        content: "Allows removing members from the project.",
      },
    ],
  },
  {
    name: "Settings",
    permission: [
      {
        name: "Project Settings View",
        key: Permissions.SettingsProjectView,
        content:
          "Allows viewing and changing the project settings (name, description, default priority, and deletion).",
      },
    ],
  },
];
