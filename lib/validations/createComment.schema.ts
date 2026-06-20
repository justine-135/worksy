import { z } from "zod";

export const createCommentSchema = z.object({
  value: z.string().min(3, "Comment must be at least 5 characters"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
