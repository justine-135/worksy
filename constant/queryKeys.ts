import { TProjectFilter } from "@/types/project.dto";

export const QUERY_KEYS = {
  PROJECT_MEMBERS: (projectId?: string | null) =>
    ["project", "members", projectId] as const,
  ROLES: (projectId: string | null) => ["roles", projectId] as const,
  TASK_BOARDS: (projectId?: string | null, userId?: string | null) =>
    ["boards", projectId, userId] as const,
  TASK: (id?: string) => ["task", id] as const,
  TASK_SEARCH: (projectId?: string | null, query?: string) =>
    ["task", "search", projectId, query] as const,
  PROJECTS: (userId?: string | null, filter: TProjectFilter = "all") =>
    ["projects", userId, filter] as const,
  PROJECT: (projectId?: string | null) => ["project", projectId] as const,
  USER: (userId: string | null) => ["user", userId] as const,
  USER_PROFILE: (userId?: string | null) =>
    ["user", "profile", userId] as const,
  USER_SEARCH: (query: string) => ["user", "search", query] as const,
  INVITES: (receiverId?: string | null) => ["invites", receiverId] as const,
  ACTIVITY: (projectId?: string | null, limit?: number) =>
    ["activity", projectId, limit] as const,
  MEMBER_ACTIVITY: (projectId?: string | null, memberId?: string | null) =>
    ["activity", "member", projectId, memberId] as const,
  NOTIFICATION: () => ["notification"] as const,
};
