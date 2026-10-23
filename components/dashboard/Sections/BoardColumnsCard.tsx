import { MdViewColumn } from "react-icons/md";

import CustomEmpty from "@/components/common/custom/CustomEmpty";
import { ETaskStatus } from "@/enum/taskStatus.enum";
import { DashboardDataResponseDTO } from "@/types/dashboard.dto";

import SectionCard from "./SectionCard";

function getStatusCounts(tasks: DashboardDataResponseDTO["tasks"]) {
  return {
    done: tasks.filter((t) => t.status === ETaskStatus.DONE).length,
    inProgress: tasks.filter((t) => t.status === ETaskStatus.IN_PROGRESS).length,
    todo: tasks.filter((t) => t.status === ETaskStatus.TODO).length,
  };
}

export default function BoardColumnsCard({
  boards,
}: {
  boards: DashboardDataResponseDTO[];
}) {
  return (
    <SectionCard
      title="Board Columns"
      icon={<MdViewColumn size={18} />}
      count={boards.length}
    >
      {boards.length === 0 ? (
        <CustomEmpty
          icon={MdViewColumn}
          title="No boards yet"
          message="Create a board to start organizing tasks."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => {
            const total = board.tasks.length;
            const counts = getStatusCounts(board.tasks);
            return (
              <div
                key={board.id}
                className="rounded-xl border border-border bg-surface-muted/50 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate font-medium text-foreground">
                    {board.title}
                  </span>
                  <span className="shrink-0 rounded-pill bg-surface px-2 py-0.5 text-xs font-semibold text-muted">
                    {total}
                  </span>
                </div>

                <div className="mt-3 flex h-1.5 w-full overflow-hidden rounded-pill bg-surface">
                  {total > 0 ? (
                    <>
                      <div
                        className="h-full bg-stat-completed"
                        style={{ width: `${(counts.done / total) * 100}%` }}
                      />
                      <div
                        className="h-full bg-stat-progress"
                        style={{
                          width: `${(counts.inProgress / total) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-stat-todo"
                        style={{ width: `${(counts.todo / total) * 100}%` }}
                      />
                    </>
                  ) : (
                    <div className="h-full w-full rounded-pill bg-surface-muted" />
                  )}
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  {counts.done > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-stat-completed" />
                      {counts.done}
                    </span>
                  )}
                  {counts.inProgress > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-stat-progress" />
                      {counts.inProgress}
                    </span>
                  )}
                  {counts.todo > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-stat-todo" />
                      {counts.todo}
                    </span>
                  )}
                  {total === 0 && <span className="text-subtle">Empty</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
