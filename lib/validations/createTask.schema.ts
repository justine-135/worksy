import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  assignees: z.array(z.string()).optional(),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
  priority: z.string().optional(),
  parentId: z.string().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
