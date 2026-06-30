"use client";

import { ReactNode } from "react";
import {
  MdAdd,
  MdArrowForward,
  MdChatBubbleOutline,
  MdInsights,
} from "react-icons/md";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { EActivityLog } from "@/enum/activityLog.enum";
import { TASK_STATUS_LABELS } from "@/enum/taskStatus.enum";
import { useGetActivity } from "@/hooks/activity/useGetActivity";
import { ProjectActivityResponseDTO } from "@/types/activityLog.dto";
import { timeAgo } from "@/utils/timeAgo";

import SectionCard from "./Sections/SectionCard";

function describe(log: ProjectActivityResponseDTO): {
  verb: string;
  extra?: string;
  icon: ReactNode;
  iconColor: string;
} {
  switch (log.type) {
    case EActivityLog.TASK_CREATE:
      return {
        verb: "created",
        icon: <MdAdd size={16} />,
        iconColor: "text-success",
      };
    case EActivityLog.COLUMN_CHANGE:
      return {
        verb: "moved",
        extra: log.columnChange?.toBoard?.title
          ? `→ ${log.columnChange.toBoard.title}`
          : undefined,
        icon: <MdArrowForward size={16} />,
        iconColor: "text-stat-progress",
      };
    case EActivityLog.STATUS_CHANGE:
      return {
        verb: "set",
        extra: log.statusChange
          ? `→ ${TASK_STATUS_LABELS[log.statusChange.toStatus]}`
          : undefined,
        icon: <MdArrowForward size={16} />,
        iconColor: "text-stat-progress",
      };
    default:
      return {
        verb: "commented on",
        icon: <MdChatBubbleOutline size={16} />,
        iconColor: "text-primary",
      };
  }
}

function ActivityRow({ log }: { log: ProjectActivityResponseDTO }) {
  const name = log.actor.user.name ?? "Someone";
  const firstName = name.split(" ")[0];
  const { verb, extra, icon, iconColor } = describe(log);

  return (
    <li className="flex items-center gap-3">
      <CustomAvatar
        avatarProps={{ className: "size-8 shrink-0" }}
        avatarImageProps={{ src: log.actor.user.image || "", alt: name }}
        avatarFallbackProps={{ className: "text-xs" }}
        fallback={name}
      />

      <p className="flex-1 text-sm text-muted">
        <span className="font-semibold text-foreground">{firstName}</span>{" "}
        {verb}{" "}
        {log.task && (
          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-xs font-semibold text-foreground">
            TASK-{log.task.ticketNumber}
          </span>
        )}{" "}
        {extra && <span className="font-medium text-foreground">{extra}</span>}
      </p>

      <span className={iconColor}>{icon}</span>
      <span className="whitespace-nowrap text-xs text-subtle">
        {timeAgo(log.createdAt)}
      </span>
    </li>
  );
}

export default function DashboardActivity({
  projectId,
}: {
  projectId?: string | null;
}) {
  const { data, isLoading } = useGetActivity({ projectId, limit: 8 });

  return (
    <SectionCard title="Activity" icon={<MdInsights size={18} />}>
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-8 shrink-0 animate-pulse rounded-full bg-surface-muted" />
              <div className="h-3 flex-1 animate-pulse rounded bg-surface-muted" />
            </div>
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <ul className="space-y-4">
          {data.map((log) => (
            <ActivityRow key={log.id} log={log} />
          ))}
        </ul>
      ) : (
        <CustomEmpty
          icon={MdInsights}
          title="No activity yet"
          message="Actions on this project will show up here."
        />
      )}
    </SectionCard>
  );
}
