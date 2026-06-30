"use client";

import { Drawer, Label, Separator } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { format } from "date-fns";
import { useState } from "react";
import { CgEye } from "react-icons/cg";
import { MdHistory } from "react-icons/md";

import ActivityLog from "@/components/common/ActivityLog";
import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { STATUS_LABEL } from "@/constant/member";
import { useGetMemberActivity } from "@/hooks/activity/useGetMemberActivity";
import { useSessionStore } from "@/store/session.store";
import { ProjectMemberTableDTO } from "@/types/projectMember.dto";

const ViewButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button onClick={onClick} isIconOnly size="sm" variant="tertiary">
      <CgEye />
    </Button>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex">
      <span className="w-36">{label}</span>
      <span className="text-sm text-black">{value}</span>
    </div>
  );
};

export default function ViewMemberDrawer({
  member,
}: {
  member: ProjectMemberTableDTO;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const projectId = useSessionStore((s) => s.projectId);

  // Only hit the API once the drawer is actually opened.
  const { data: activity, isLoading } = useGetMemberActivity({
    projectId,
    memberId: member.id,
    enabled: isOpen,
  });

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Drawer>
        <ViewButton onClick={handleOpenChange} />
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="w-160 max-w-[95vw]">
              <Drawer.Header>
                <div className="flex items-center gap-3 px-3 py-2">
                  <CustomAvatar
                    avatarProps={{ size: "sm" }}
                    avatarImageProps={{
                      src: member.user.image || "",
                      alt: member.name,
                    }}
                    fallback={member.name}
                  />
                  <div className="flex flex-col">
                    <Label className="text-lg font-bold">{member.name}</Label>
                  </div>
                </div>
              </Drawer.Header>
              <Drawer.Body className="max-h-[75vh] min-h-[85vh] pt-6">
                <div className="space-y-8">
                  <Separator />
                  <div className="space-y-6">
                    <div>
                      <span className="font-medium text-black">
                        Member details
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Detail label="Email" value={member.email} />
                      <Detail
                        label="Joined"
                        value={format(
                          new Date(member.createdAt),
                          "MMMM d, yyyy",
                        )}
                      />
                      <Detail
                        label="Role"
                        value={member.role.name ?? "Unassigned"}
                      />
                      <Detail
                        label="Status"
                        value={STATUS_LABEL[member.status]}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div>
                      <span className="font-medium text-black">
                        Recent activity
                      </span>
                      <p className="text-muted text-xs">Last 7 days</p>
                    </div>

                    {isLoading ? (
                      <div className="space-y-4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="size-8 shrink-0 animate-pulse rounded-full bg-surface-muted" />
                            <div className="h-3 flex-1 animate-pulse rounded bg-surface-muted" />
                          </div>
                        ))}
                      </div>
                    ) : activity && activity.length > 0 ? (
                      <ActivityLog
                        data={activity}
                        hideActor
                        taskHref={(log) =>
                          log.task
                            ? `/projects/${projectId}/board?task=${log.task.id}`
                            : undefined
                        }
                      />
                    ) : (
                      <CustomEmpty
                        icon={MdHistory}
                        title="No recent activity"
                        message="This member hasn't done anything in the last 7 days."
                      />
                    )}
                  </div>
                </div>
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
