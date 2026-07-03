import { z } from "zod";

import { ETaskPriority } from "@/enum/taskPriority.enum";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  assignees: z.array(z.string()).optional(),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  // Constrain to the canonical priorities instead of a free-form string.
  // Optional here (the Add Task modal supplies it via a controlled Select and
  // defaults to the project's configured priority).
  priority: z.enum(ETaskPriority).optional(),
  parentId: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
