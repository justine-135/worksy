import { Card } from "@heroui/react";
import Link from "next/link";
import React from "react";
import { IconType } from "react-icons";
import {
  MdAdd,
  MdArrowForward,
  MdChatBubbleOutline,
  MdGroup,
} from "react-icons/md";

import { EActivityLog } from "@/enum/activityLog.enum";
import { TASK_STATUS_LABELS } from "@/enum/taskStatus.enum";
import { ActivityLogResponseDTO } from "@/types/activityLog.dto";
import { timeAgo } from "@/utils/timeAgo";

import CustomAvatar from "./custom/CustomAvatar";

/** Icon used to denote each activity type (replaces the old colored dot). */
const logIcon = (type: EActivityLog): IconType => {
  switch (type) {
    case EActivityLog.COLUMN_CHANGE:
    case EActivityLog.STATUS_CHANGE:
      return MdArrowForward;
    case EActivityLog.TASK_CREATE:
      return MdAdd;
    case EActivityLog.ASSIGNEE_CHANGE:
      return MdGroup;
    default:
      return MdChatBubbleOutline;
  }
};

/** A gray circle holding the activity-type icon. */
const LogIcon = ({ Icon }: { Icon: IconType }) => (
  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-700">
    <Icon size={16} />
  </span>
);

const Actor = ({ name, image }: { name: string; image?: string | null }) => (
  <CustomAvatar
    avatarProps={{ className: "size-6 shrink-0" }}
    avatarImageProps={{ src: image || "", alt: name }}
    avatarFallbackProps={{ className: "text-[10px]" }}
    fallback={name}
  />
);

const Badge = ({
  title,
  variant = "neutral",
}: {
  title?: string;
  variant?: "neutral" | "success";
}) => (
  <span
    className={
      variant === "success"
        ? "font-medium bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-green-700 text-xs"
        : "font-medium bg-gray-100 border px-1.5 py-0.5 rounded text-gray-700 text-xs"
    }
  >
    {title}
  </span>
);

/**
 * The action sentence. `lead` capitalizes the verb for the actor-less feed
 * (member drawer); otherwise the verb follows the actor's name.
 */
const verbText = (log: ActivityLogResponseDTO, lead: boolean) => {
  switch (log.type) {
    case EActivityLog.COLUMN_CHANGE:
      return (
        <>
          {lead ? "Moved this from " : "moved this from "}
          <Badge title={log.columnChange?.fromBoard?.title} />
          {" to "}
          <Badge title={log.columnChange?.toBoard?.title} variant="success" />
        </>
      );
    case EActivityLog.STATUS_CHANGE:
      return (
        <>
          {lead ? "Changed status from " : "changed status from "}
          <Badge
            title={
              log.statusChange
                ? TASK_STATUS_LABELS[log.statusChange.fromStatus]
                : undefined
            }
          />
          {" to "}
          <Badge
            title={
              log.statusChange
                ? TASK_STATUS_LABELS[log.statusChange.toStatus]
                : undefined
            }
            variant="success"
          />
        </>
      );
    case EActivityLog.TASK_CREATE:
      return lead ? "Created this task" : "created this task";
    case EActivityLog.ASSIGNEE_CHANGE:
      return lead ? "Updated the assignees" : "updated the assignees";
    case EActivityLog.COMMENT:
      return lead ? "Commented" : "commented";
    default:
      return null;
  }
};

/**
 * Optionally wraps a log row in a Link so clicking it deep-links to the related
 * task (the board opens that task's drawer via the `?task=` query param).
 */
const RowLink = ({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) => {
  if (!href) return <>{children}</>;
  return (
    <Link
      href={href}
      className="block rounded-md transition-colors hover:bg-gray-50"
    >
      {children}
    </Link>
  );
};

const LogItem = ({
  log,
  hideActor = false,
  href,
  isFirst = false,
  isLast = false,
}: {
  log: ActivityLogResponseDTO;
  hideActor?: boolean;
  href?: string;
  isFirst?: boolean;
  isLast?: boolean;
}) => {
  const { name, image } = log.actor.user;
  const isComment = log.type === EActivityLog.COMMENT;
  const Icon = logIcon(log.type);

  return (
    <RowLink href={href}>
      <div className="flex items-stretch gap-2 w-full text-sm text-gray-600">
        {!hideActor && (
          <div className="pt-2">
            <Actor name={name} image={image} />
          </div>
        )}

        {/* Icon sitting on a continuous vertical rail. The line spans the full
            row height (so it connects to neighbours regardless of row height)
            and is trimmed to the icon's center on the first/last rows. */}
        <div className="relative flex flex-col items-center self-stretch">
          <div
            className={[
              "absolute w-px bg-gray-200",
              isFirst ? "top-[22px]" : "top-0",
              isLast ? "bottom-[calc(100%-22px)]" : "bottom-0",
            ].join(" ")}
          />
          <div className="relative pt-2">
            <LogIcon Icon={Icon} />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-2">
          <p className="leading-snug pt-1">
            {!hideActor && (
              <span className="font-semibold text-gray-900">{name} </span>
            )}
            {verbText(log, hideActor)}{" "}
            <span className="text-gray-400">{timeAgo(log.createdAt)}</span>
          </p>

          {isComment && (
            <Card className="mt-1.5 p-4 max-w-3xl text-sm border shadow-xs">
              <div
                className="prose prose-sm max-w-none wrap-break-word"
                dangerouslySetInnerHTML={{ __html: log.comment?.value || "" }}
              />
            </Card>
          )}
        </div>
      </div>
    </RowLink>
  );
};

export default function ActivityLog({
  data,
  hideActor = false,
  taskHref,
}: {
  data?: ActivityLogResponseDTO[];
  hideActor?: boolean;
  taskHref?: (log: ActivityLogResponseDTO) => string | undefined;
}) {
  if (!data?.length) return "";

  return (
    <div className="flex flex-col w-full py-4 bg-white">
      {data.map((log, idx) => (
        <div key={idx} className="w-full">
          <LogItem
            log={log}
            hideActor={hideActor}
            href={taskHref?.(log)}
            isFirst={idx === 0}
            isLast={idx === data.length - 1}
          />
        </div>
      ))}
    </div>
  );
}
