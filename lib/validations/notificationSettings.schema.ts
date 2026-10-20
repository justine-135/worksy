import { z } from "zod";

export const notificationSettingsSchema = z.object({
  notificationsEnabled: z.boolean(),
});

export type NotificationSettingsInput = z.infer<
  typeof notificationSettingsSchema
>;
