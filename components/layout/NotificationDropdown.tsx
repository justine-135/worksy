"use client";

import { Badge, Button, Description, Dropdown, Label } from "@heroui/react";
import Link from "next/link";
import { BiBell } from "react-icons/bi";

import { NotificationType } from "@/enum/notifications.enum";
import { useGetNotification } from "@/hooks/notification/useGetNotification";
import useReadNotification from "@/hooks/notification/useReadNotification";
import { NotificationDataDTO } from "@/types/notification.dto";
import { UserResponseDTO } from "@/types/user.dto";
import { notificationTimeAgo } from "@/utils/timeAgo";

import CustomAvatar from "../common/custom/CustomAvatar";
import { PROJECT_IMAGE_PLACEHOLDER } from "../projects/ProjectCard";

const NotificationDescription = ({
  item,
  user,
  title,
}: {
  item: NotificationDataDTO;
  user: Omit<UserResponseDTO, "id">;
  title: string;
}) => {
  return (
    <>
      <Description
        className={`text-[0.875rem] ${item.read ? "opacity-60" : "opacity-100"} `}
      >
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
            <Label>
              <span className="font-semibold">{user?.name}</span>{" "}
              <span>{item.title}</span>{" "}
              <span className="font-semibold">{title}</span>
            </Label>
            <span>{notificationTimeAgo(item.createdAt)}</span>
          </div>
        </div>
      </Description>
      {!item.read && (
        <Badge className="static! ml-2 mt-2" color="accent" size="sm" />
      )}
    </>
  );
};

const NotificationItem = ({ item }: { item: NotificationDataDTO }) => {
  const { mutation } = useReadNotification();

  const handleRead = () => {
    if (!item.id) return;
    if (item.read) return;
    mutation.mutate(item.id);
  };

  switch (item.type) {
    case NotificationType.INVITE:
      const { user: userInvite, projectTitle } = item?.data;
      const inviteHref = `/invites`;

      return (
        <Dropdown.Item onClick={handleRead}>
          <Link href={inviteHref} className="flex items-start">
            <NotificationDescription
              user={userInvite}
              item={item}
              title={projectTitle}
            />
          </Link>
        </Dropdown.Item>
      );

    case NotificationType.ASSIGNED:
    case NotificationType.COMMENT:
      const { user, taskId, projectId, name } = item?.data;
      const taskHref = `/projects/${projectId}/board?task=${taskId}`;
      return (
        <Dropdown.Item onClick={handleRead}>
          <Link href={taskHref} className="flex items-start">
            <NotificationDescription user={user} item={item} title={name} />
          </Link>
        </Dropdown.Item>
      );
  }
};

export function NotificationDropdown({
  collapsed,
  collapsedButtonClassName,
}: {
  collapsed: boolean;
  collapsedButtonClassName: string;
}) {
  const { data } = useGetNotification();

  const unreadCount = data?.unreadCount || 0;

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
          {data && data?.data.length > 0 ? (
            data?.data.map((item) => {
              return <NotificationItem key={item.id} item={item} />;
            })
          ) : (
            <Dropdown.Item>No notification</Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
