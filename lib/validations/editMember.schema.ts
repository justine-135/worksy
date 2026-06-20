import { z } from "zod";

import { StatusDTO } from "@/enum/member";

export const editMemberSchema = z.object({
  status: z.enum(Object.values(StatusDTO)),
  roleId: z.string().min(3, "Role ID must be at least 3 characters"),
});

export type EditMemberInput = z.infer<typeof editMemberSchema>;
