import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
