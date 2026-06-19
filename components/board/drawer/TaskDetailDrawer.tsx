"use client";

import CustomButton from "@/components/button/CustomButton";
import { useState } from "react";

import { Card, Drawer } from "@heroui/react";
import { useGetTaskDetail } from "@/hooks/task/useGetTaskDetail";
import CustomAvatar from "@/components/avatar/CustomAvatar";
import { timeAgo } from "@/utils/timeAgo";
import { ActivityLog } from "@/enum/activityLog.enum";
import { ActivityLogResponseDTO } from "@/types/activityLog.dto";

const ActivityLogComponent = ({ log }: { log: ActivityLogResponseDTO }) => {
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
        {log.type === ActivityLog.STATUS_CHANGE && (
          <span className="mt-2">{`${name} moved from ${fromBoard?.title} to ${toBoard?.title}`}</span>
        )}
      </div>
    </div>
  );
};

interface TaskDetailDrawerProps {
  id: string;
  title: string;
}

export default function TaskDetailDrawer({ id, title }: TaskDetailDrawerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const { data, isLoading } = useGetTaskDetail({ id, isOpen });

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
  };

  const createdBy = {
    src: data?.createdBy.user.image,
    name: data?.createdBy.user.name || "",
  };

  if (isLoading) return "Loading";

  return (
    <div>
      <Drawer>
        <span
          onClick={handleOpenChange}
          className="hover:bg-transparent hover:underline cursor-pointer"
        >
          {title}
        </span>
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="min-w-175">
              <Drawer.Header>{title}</Drawer.Header>
              <Drawer.Body className="max-h-[75vh] min-h-[85vh] pt-6">
                {/* <TiptapEditor
                  users={data}
                  value={data?.description || ""}
                  onChange={setDescription}
                /> */}
                <div className="flex gap-4">
                  <CustomAvatar
                    avatarProps={{ className: "size-10" }}
                    avatarImageProps={{
                      src: createdBy.src || "",
                      alt: createdBy.name,
                    }}
                    avatarFallbackProps={{ className: "text-xs" }}
                    fallback={createdBy.name}
                  />
                  <div className="flex flex-col w-full">
                    <span>
                      Opened by {createdBy.name} {timeAgo(data?.createdAt)}
                    </span>
                    <Card className="w-full">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: data?.description || "",
                        }}
                      />
                    </Card>
                  </div>
                </div>
                {data?.activityLog.map((log, idx) => {
                  return (
                    <div key={idx}>
                      <ActivityLogComponent log={log} />
                    </div>
                  );
                })}
              </Drawer.Body>
              <Drawer.Footer className="mt-auto">
                <CustomButton
                  title="Submit"
                  loadingTitle="Submitting"
                  type="submit"
                />
              </Drawer.Footer>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
