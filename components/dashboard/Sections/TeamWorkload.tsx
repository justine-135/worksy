import { MdPeople } from "react-icons/md";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { MemberWorkloadDTO } from "@/types/dashboard.dto";

import SectionCard from "./SectionCard";

export default function TeamWorkload({
  members,
}: {
  members: MemberWorkloadDTO[];
}) {
  const maxTotal = Math.max(
    1,
    ...members.map((m) => m.todoCount + m.inProgressCount + m.doneCount),
  );

  return (
    <SectionCard
      title="Team Workload"
      icon={<MdPeople size={18} />}
      iconColor="text-primary"
      count={members.length}
    >
      {members.length === 0 ? (
        <CustomEmpty
          icon={MdPeople}
          title="No assigned tasks"
          message="Assign tasks to team members to see workload distribution."
        />
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const total = m.todoCount + m.inProgressCount + m.doneCount;
            const donePct = (m.doneCount / total) * 100;
            const progressPct = (m.inProgressCount / total) * 100;
            const todoPct = (m.todoCount / total) * 100;
            const barWidth = (total / maxTotal) * 100;

            return (
              <div key={m.memberId} className="flex items-center gap-3">
                <CustomAvatar
                  avatarProps={{ className: "size-7 shrink-0" }}
                  avatarImageProps={{ src: m.image || "", alt: m.name }}
                  avatarFallbackProps={{ className: "text-[10px]" }}
                  fallback={m.name}
                />
                <span className="w-24 shrink-0 truncate text-sm font-medium text-foreground">
                  {m.name.split(" ")[0]}
                </span>
                <div className="flex-1 overflow-hidden rounded-pill bg-surface-muted h-2">
                  <div
                    className="flex h-full overflow-hidden rounded-pill"
                    style={{ width: `${barWidth}%` }}
                  >
                    <div
                      className="h-full bg-stat-completed"
                      style={{ width: `${donePct}%` }}
                    />
                    <div
                      className="h-full bg-stat-progress"
                      style={{ width: `${progressPct}%` }}
                    />
                    <div
                      className="h-full bg-stat-todo"
                      style={{ width: `${todoPct}%` }}
                    />
                  </div>
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">
                  {total}
                </span>
              </div>
            );
          })}

          <div className="mt-1 flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-stat-completed" />
              Done
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-stat-progress" />
              In Progress
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-stat-todo" />
              Todo
            </span>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
