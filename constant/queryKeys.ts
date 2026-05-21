export const QUERY_KEYS = {
  PROJECT_MEMBERS: (projectId?: string | null) =>
    ["project", "members", projectId] as const,
  ROLES: (projectId: string | null) => ["roles", projectId] as const,
  TASK_BOARDS: (projectId: string | null, userId: string | null) =>
    ["boards", projectId, userId] as const,
  PROJECTS: (userId?: string | null) => ["projects", userId] as const,
  USER: (userId: string | null) => ["user", userId] as const,
  USER_SEARCH: (query: string) => ["user", "search", query] as const,
};
