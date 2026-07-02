import { z } from "zod";

import { ETaskStatus } from "@/enum/taskStatus.enum";

export const editTaskBoardSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  status: z.enum(Object.values(ETaskStatus)),
});

export type EditTaskBoardInput = z.infer<typeof editTaskBoardSchema>;
