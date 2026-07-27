import { MdViewColumn } from "react-icons/md";

import { DashboardDataResponseDTO } from "@/types/dashboard.dto";

import SectionCard from "./SectionCard";

export default function BoardColumnsCard({
  boards,
}: {
  boards: DashboardDataResponseDTO[];
}) {
  const maxTasks = Math.max(1, ...boards.map((b) => b.tasks.length));

  return (
    <SectionCard
      title="Board Columns"
      icon={<MdViewColumn size={18} />}
      count={boards.length}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <div
            key={board.id}
            className="rounded-xl border border-border bg-surface-muted/50 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate font-medium text-foreground">
                {board.title}
              </span>
              <span className="shrink-0 rounded-pill bg-surface px-2 py-0.5 text-xs font-semibold text-muted">
                {board.tasks.length}
              </span>
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-pill bg-surface">
              <div
                className="h-full rounded-pill bg-primary transition-[width] duration-500"
                style={{ width: `${(board.tasks.length / maxTasks) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
