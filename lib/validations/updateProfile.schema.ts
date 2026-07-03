import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be at most 60 characters"),
  // Blob URL set after an avatar upload; null clears the avatar.
  image: z.string().url("Invalid image url").nullable().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
