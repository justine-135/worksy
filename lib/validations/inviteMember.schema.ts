import { z } from "zod";

export const inviteMemberSchema = z.object({
  userId: z.string().min(3, "Search a user to send an invite"),
  projectId: z.string().min(3, "Project ID must be at least 3 characters"),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
