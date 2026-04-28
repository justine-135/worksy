import { ERoles } from "@/enum/role";

export const RoleLabel = {
  [ERoles.OWNER]: "Project Owner",
  [ERoles.MEMBER]: "Member",
  [ERoles.ADMIN]: "Admin",
};

export const ROLE_PRESETS = {
  OWNER: {
    name: "Owner",
    permissions: [
      "dashboard.view",

      "board.view",
      "board.task.create",
      "board.task.edit",
      "board.task.status.edit",
      "board.task.delete",
      "board.task.board.create",
      "board.task.board.edit",
      "board.task.board.delete",

      "member.view",
      "member.invite",
      "member.edit",
      "member.delete",
    ],
  },

  MEMBER: {
    name: "Member",
    permissions: [
      "dashboard.view",
      "board.view",
      "board.task.create",
      "board.task.edit",
      "board.task.status.edit",
    ],
  },
} as const;
