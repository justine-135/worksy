import { NotificationType } from "@/enum/notifications.enum";

interface InviteNotificationData {
  projectTitle: string;
  user: {
    image: string;
    name: string;
    email: string;
  };
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
    });

export interface NotificationResponseDTO {
  data: NotificationDataDTO[];
  unreadCount: number;
}

export interface CreateNotificationDTO {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}
