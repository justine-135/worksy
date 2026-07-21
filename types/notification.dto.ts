import { NotificationType } from "@/enum/notifications.enum";

import { UserResponseDTO } from "./user.dto";

interface InviteNotificationData {
  projectTitle: string;
  user: Omit<UserResponseDTO, "id">;
}

interface AssignedNotificationData {
  taskId: string;
  projectId: string;
  user: Omit<UserResponseDTO, "id">;
}

interface BaseNotificationDataDTO {
  id: string;
  title: string;
  body?: string;
  read: boolean;
  readAt: string;
  createdAt: string;
}

export type NotificationDataDTO =
  | (BaseNotificationDataDTO & {
      type: NotificationType.INVITE;
      data: InviteNotificationData;
    })
  | (BaseNotificationDataDTO & {
      type: NotificationType.MENTION;
      data: {
        commentId: string;
      };
    })
  | (BaseNotificationDataDTO & {
      type: NotificationType.ASSIGNED;
      data: AssignedNotificationData;
    })
  | (BaseNotificationDataDTO & {
      type: NotificationType.COMMENT;
      data: AssignedNotificationData;
    });

export interface NotificationResponseDTO {
  data: NotificationDataDTO[];
  unreadCount: number;
}

export interface CreateNotificationDTO {
  senderId: string;
  receiverId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}
