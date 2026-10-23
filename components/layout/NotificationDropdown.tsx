"use client";

import { Badge, Button, Dropdown } from "@heroui/react";
import Link from "next/link";
import { useState } from "react";
import { BiBell } from "react-icons/bi";

import { NotificationType } from "@/enum/notifications.enum";
import { useGetNotification } from "@/hooks/notification/useGetNotification";
import useMarkAllReadNotification from "@/hooks/notification/useMarkAllReadNotification";
import useReadNotification from "@/hooks/notification/useReadNotification";
import { useGetNotificationSettings } from "@/hooks/user/useGetNotificationSettings";
import { NotificationDataDTO } from "@/types/notification.dto";
import { UserResponseDTO } from "@/types/user.dto";
import { notificationTimeAgo } from "@/utils/timeAgo";

import CustomAvatar from "../common/custom/CustomAvatar";
import { PROJECT_IMAGE_PLACEHOLDER } from "../projects/ProjectCard";
import { useProgress } from "../provider/ProgressProvider";

type NotificationTab = "all" | "unread";

const NotificationRow = ({
  item,
  user,
  title,
}: {
  item: NotificationDataDTO;
  user: Omit<UserResponseDTO, "id">;
  title: string;
}) => (
  <div className="flex items-start gap-3 w-full">
    <CustomAvatar
      avatarProps={{ size: "sm" }}
      avatarImageProps={{
        src: user?.image || PROJECT_IMAGE_PLACEHOLDER,
        alt: user?.name || "User",
        className: "pointer-events-none object-cover select-none",
      }}
      avatarFallbackProps={{ className: "text-xs" }}
      fallback={user?.name || ""}
    />
    <div className="flex flex-col flex-1 min-w-0">
      <p
        className={`text-sm leading-snug ${item.read ? "text-muted" : "text-foreground"}`}
      >
        <span className="font-medium">{user?.name}</span>{" "}
        <span>{item.title}</span>{" "}
        <span className="font-medium">{title}</span>
      </p>
      <span className="text-xs text-subtle mt-0.5">
        {notificationTimeAgo(item.createdAt)}
      </span>
    </div>
    {!item.read && (
      <span className="mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full bg-primary" />
    )}
  </div>
);

const NotificationItem = ({ item }: { item: NotificationDataDTO }) => {
  const { mutation } = useReadNotification();
  const { start } = useProgress();

  const handleRead = () => {
    start();
    if (!item.id || item.read) return;
    mutation.mutate(item.id);
  };

  switch (item.type) {
    case NotificationType.INVITE: {
      const { user, projectTitle } = item.data;
      return (
        <Dropdown.Item onClick={handleRead}>
          <Link href="/invites" className="flex w-full">
            <NotificationRow user={user} item={item} title={projectTitle} />
          </Link>
        </Dropdown.Item>
      );
    }
    case NotificationType.ASSIGNED:
    case NotificationType.COMMENT: {
      const { user, taskId, projectId, name } = item.data;
      return (
        <Dropdown.Item onClick={handleRead}>
          <Link
            href={`/projects/${projectId}/board?task=${taskId}`}
            className="flex w-full"
          >
            <NotificationRow user={user} item={item} title={name} />
          </Link>
        </Dropdown.Item>
      );
    }
    default:
      return null;
  }
};

export function NotificationDropdown({
  collapsed,
  collapsedButtonClassName,
}: {
  collapsed: boolean;
  collapsedButtonClassName: string;
}) {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");

  const { data } = useGetNotification();
  const { data: notificationSettings } = useGetNotificationSettings();
  const { mutation: markAllMutation } = useMarkAllReadNotification();

  const unreadCount = data?.unreadCount || 0;
  const notificationsEnabled = notificationSettings?.notificationsEnabled ?? true;

  const allNotifications = data?.data || [];
  const filteredNotifications =
    activeTab === "unread"
      ? allNotifications.filter((n) => !n.read)
      : allNotifications;

  return (
    <Dropdown>
      <Button
        className={`flex flex-col items-start py-0 ${collapsedButtonClassName}`}
        aria-label="Notification"
        variant="ghost"
      >
        <div className="flex items-center space-x-2">
          <Badge.Anchor>
            <BiBell size={18} />
            {notificationsEnabled && unreadCount > 0 && (
              <Badge color="danger" size="sm">
                {unreadCount}
              </Badge>
            )}
          </Badge.Anchor>
          {!collapsed && <span>Notification</span>}
        </div>
      </Button>

      <Dropdown.Popover>
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                markAllMutation.mutate();
              }}
              className="text-xs text-primary hover:opacity-70 transition-opacity"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b border-border px-4">
          {(["all", "unread"] as NotificationTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab);
              }}
              className={`flex items-center gap-1.5 pb-2 pr-2 text-sm border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All" : "Unread"}
              {tab === "unread" && unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-semibold rounded-full bg-primary-soft text-primary">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notification list */}
        <Dropdown.Menu className="max-h-72 overflow-y-auto py-1">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((item) => (
              <NotificationItem key={item.id} item={item} />
            ))
          ) : (
            <Dropdown.Item>
              <span className="text-sm text-muted">
                {activeTab === "unread"
                  ? "You're all caught up"
                  : "No notifications yet"}
              </span>
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
