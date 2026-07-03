// Canonical task-priority values. The DB column stays a plain `String?`
// (no Prisma enum migration), but this enum is the single source of truth the
// app validates and renders against.
export enum ETaskPriority {
  URGENT = "urgent",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}
