import { Card } from "@heroui/react";
import React from "react";

import { EActivityLog } from "@/enum/activityLog.enum";
import { ActivityLogResponseDTO } from "@/types/activityLog.dto";
import { timeAgo } from "@/utils/timeAgo";

import CustomAvatar from "./custom/CustomAvatar";

const LogItem = ({ log }: { log: ActivityLogResponseDTO }) => {
  const { name, image } = log.actor.user;

  if (log.type === EActivityLog.STATUS_CHANGE) {
    const { fromBoard, toBoard } = log.statusChange;
    return (
      <div className="relative flex items-center min-h-11 py-2 pl-24 w-full">
        <div className="absolute left-18.75 top-1/2 -translate-y-1/2 z-10 size-3 rounded-full border-2 border-white bg-red-500 shadow-sm" />

        {/* CONTENT ROW */}
        <div className="flex items-center gap-2 w-full text-sm text-gray-600">
          <CustomAvatar
            avatarProps={{ className: "size-5 shrink-0" }}
            avatarImageProps={{
              src: image || "",
              alt: name,
            }}
            avatarFallbackProps={{ className: "text-[10px]" }}
            fallback={name}
          />
          <p className="leading-none">
            <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
              {name}
            </span>
            {" moved this from "}
            <span className="font-medium bg-gray-100 border px-1.5 py-0.5 rounded text-gray-700 text-xs">
              {fromBoard?.title}
            </span>
            {" to "}
            <span className="font-medium bg-green-50 border border-green-200 px-1.5 py-0.5 rounded text-green-700 text-xs">
              {toBoard?.title}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (log.type === EActivityLog.TASK_CREATE) {
    return (
      <div className="relative flex items-center min-h-11 py-2 pl-24 w-full">
        <div className="absolute left-18.75 top-1/2 -translate-y-1/2 z-10 size-3 rounded-full border-2 border-white bg-blue-500 shadow-sm" />

        <div className="flex items-center gap-2 w-full text-sm text-gray-600">
          <CustomAvatar
            avatarProps={{ className: "size-5 shrink-0" }}
            avatarImageProps={{
              src: image || "",
              alt: name,
            }}
            avatarFallbackProps={{ className: "text-[10px]" }}
            fallback={name}
          />
          <p className="leading-none">
            <span className="font-semibold text-gray-900 hover:underline cursor-pointer">
              {name}
            </span>
            {" created this task"}
          </p>
        </div>
      </div>
    );
  }

  // COMMENT WORKFLOW
  return (
    <div className="relative flex items-start gap-4 py-3 pl-14 w-full">
      <div className="absolute left-2 top-3 z-10">
        <CustomAvatar
          avatarProps={{
            className: "size-8 ring-4 ring-white border shadow-sm",
          }}
          avatarImageProps={{
            src: image || "",
            alt: name,
          }}
          avatarFallbackProps={{ className: "text-xs" }}
          fallback={name}
        />
      </div>

      <div className="flex flex-col w-full bg-white">
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="text-sm font-semibold text-gray-900 hover:underline cursor-pointer">
            {name}
          </span>
          <span>commented {timeAgo(log.comment?.createdAt)}</span>
        </div>

        <Card className="p-4 max-w-3xl text-sm border shadow-xs">
          <div
            className="prose prose-sm max-w-none wrap-break-word"
            dangerouslySetInnerHTML={{
              __html: log.comment?.value || "",
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default function ActivityLog({
  data,
}: {
  data?: ActivityLogResponseDTO[];
}) {
  return (
    <div className="relative flex flex-col w-full py-4 bg-white">
      {/* Separator */}
      {data?.length ? (
        <>
          <div className="absolute left-20 top-0 bottom-0 w-0.5 bg-gray-200" />
          <div className="flex flex-col w-full">
            {data?.map((log, idx) => (
              <div key={idx} className="w-full">
                <LogItem log={log} />
              </div>
            ))}
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
}
