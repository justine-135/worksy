import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
