import { z } from "zod";

import { ETaskPriority } from "@/enum/taskPriority.enum";

export const updateProjectSettingsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").optional(),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .nullable()
    .optional(),
  defaultTaskPriority: z.enum(ETaskPriority).optional(),
});

export type UpdateProjectSettingsInput = z.infer<
  typeof updateProjectSettingsSchema
>;
