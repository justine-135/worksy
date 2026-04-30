import { z } from "zod";

export const addRoleSchema = z.object({
  name: z.string().min(3, "Role name must be at least 3 characters"),
  permissions: z
    .array(z.string())
    .min(1, "At least one permission must be selected"),
});

export type CreateRoleInput = z.infer<typeof addRoleSchema>;
