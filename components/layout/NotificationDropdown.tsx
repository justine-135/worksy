"use client";

import { Badge, Button, Description, Dropdown, Label } from "@heroui/react";
import { BiBell } from "react-icons/bi";

import { NotificationType } from "@/enum/notifications.enum";
import { useGetNotification } from "@/hooks/notification/useGetNotification";
import { NotificationDataDTO } from "@/types/notification.dto";
import { notificationTimeAgo } from "@/utils/timeAgo";

import CustomAvatar from "../common/custom/CustomAvatar";
import { PROJECT_IMAGE_PLACEHOLDER } from "../projects/ProjectCard";

const NotificationItem = ({ item }: { item: NotificationDataDTO }) => {
  if (item.type === NotificationType.INVITE) {
    const { user, projectTitle } = item?.data;

    return (
      <Dropdown.Item>
        <Description className="text-[0.875rem]">
          <div className="flex items-center gap-2">
            <CustomAvatar
              avatarProps={{ size: "md" }}
              avatarImageProps={{
                src: user?.image || PROJECT_IMAGE_PLACEHOLDER,
                alt: user?.name || "User",
                className: "pointer-events-none object-cover select-none",
              }}
              avatarFallbackProps={{ className: "text-xs" }}
              fallback={user?.name || ""}
            />
            <div className="flex flex-col">
              <div>
                <Label>{user?.name}</Label> {item.title}{" "}
                <Label>{projectTitle}</Label>
              </div>
              <span>{notificationTimeAgo(item.createdAt)}</span>
            </div>
          </div>
        </Description>
      </Dropdown.Item>
    );
  }
};

export function NotificationDropdown({ collapsed }: { collapsed: boolean }) {
  const { data } = useGetNotification();

  const unreadCount = data?.unreadCount || 0;

  return (
    <Dropdown>
      <Button
        className={`flex flex-col items-start py-0 ${collapsed ? "w-fit pl-2 pr-2" : "w-full pl-3 "}`}
        aria-label="Notification"
        variant="ghost"
      >
        <div className="flex items-center space-x-2">
          <Badge.Anchor>
            <BiBell size={18} />
            {unreadCount > 0 && (
              <Badge color="danger" size="sm">
                {unreadCount}
              </Badge>
            )}
          </Badge.Anchor>
          {!collapsed && <span>Notification</span>}
        </div>
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu>
          {data?.data.map((item) => {
            return <NotificationItem key={item.id} item={item} />;
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
