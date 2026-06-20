import { EActivityLog } from "@/enum/activityLog.enum";
import { ActivityLogResponseDTO } from "@/types/activityLog.dto";
import React from "react";
import CustomAvatar from "./custom/CustomAvatar";

const LogItem = ({ log }: { log: ActivityLogResponseDTO }) => {
  const { name, image } = log.actor.user;
  const { fromBoard, toBoard } = log.statusChange;
  return (
    <div className="flex gap-4">
      <CustomAvatar
        avatarProps={{ className: "size-10" }}
        avatarImageProps={{
          src: image || "",
          alt: name,
        }}
        avatarFallbackProps={{ className: "text-xs" }}
        fallback={name}
      />
      <div className="flex flex-col w-full">
        {log.type === EActivityLog.STATUS_CHANGE && (
          <span className="mt-2">{`${name} moved from ${fromBoard?.title} to ${toBoard?.title}`}</span>
        )}
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
    <>
      {data?.map((log, idx) => {
        return (
          <div key={idx}>
            <LogItem log={log} />
          </div>
        );
      })}
    </>
  );
}
