"use client";

import { MdGroup } from "react-icons/md";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { ProjectMemberTableDTO } from "@/types/projectMember.dto";

import SectionCard from "./SectionCard";

export default function MembersOverview({
  members,
}: {
  members: ProjectMemberTableDTO[];
}) {
  return (
    <SectionCard
      title="Members"
      icon={<MdGroup size={18} />}
      count={members.length}
    >
      <div className="flex flex-wrap gap-2">
        {members.map((member) => {
          const label = member.user.name || member.email || "Unknown";
          return (
            <div
              key={member.id}
              className="flex items-center gap-2 rounded-pill border border-border bg-surface-muted/50 py-1 pl-1 pr-3"
            >
              <CustomAvatar
                avatarProps={{ className: "size-6 shrink-0" }}
                avatarImageProps={{
                  src: member.user.image || "",
                  alt: label,
                }}
                avatarFallbackProps={{ className: "text-[10px]" }}
                fallback={label}
              />
              <span className="text-sm font-medium text-foreground">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
