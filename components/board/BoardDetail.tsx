"use client";

import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { MdCalendarMonth, MdTableRows, MdTimeline, MdViewKanban } from "react-icons/md";

import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import { useSessionStore } from "@/store/session.store";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import BoardKanbanView from "./BoardKanbanView";
import BoardSkeleton from "./BoardSkeleton";
import BoardCalendarView from "./views/BoardCalendarView";
import BoardListView from "./views/BoardListView";
import BoardTimelineView from "./views/BoardTimelineView";

const VIEWS = [
  { key: "kanban", label: "Kanban", icon: MdViewKanban },
  { key: "list", label: "List", icon: MdTableRows },
  { key: "calendar", label: "Calendar", icon: MdCalendarMonth },
  { key: "timeline", label: "Timeline", icon: MdTimeline },
] as const;

type ViewKey = (typeof VIEWS)[number]["key"];

function BoardDetailInner() {
  const queryClient = useQueryClient();
  const projectId = useSessionStore((s) => s.projectId);

  const { invalidateTaskBoards } = useInvalidateQuery(
    projectId,
    queryClient,
  );

  const { data, isLoading } = useGetTaskBoard({
    projectId: projectId || "",
  });

  const columns: TaskBoardResponseDTO[] = data ?? [];

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeView: ViewKey =
    (searchParams.get("view") as ViewKey | null) ?? "kanban";

  const setView = (key: ViewKey) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", key);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* View switcher strip */}
      <div className="flex w-fit items-center gap-1 rounded-xl border border-default-200 bg-content1 p-1">
        {VIEWS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setView(key)}
            className={[
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              activeView === key
                ? "bg-primary text-white shadow-sm"
                : "text-default-600 hover:bg-default-100",
            ].join(" ")}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Active view */}
      {activeView === "kanban" && (
        <BoardKanbanView
          columns={columns}
          isLoading={isLoading}
          projectId={projectId}
          invalidateTaskBoards={invalidateTaskBoards}
        />
      )}
      {activeView === "list" && (
        <BoardListView columns={columns} isLoading={isLoading} projectId={projectId} />
      )}
      {activeView === "calendar" && (
        <BoardCalendarView columns={columns} isLoading={isLoading} />
      )}
      {activeView === "timeline" && (
        <BoardTimelineView columns={columns} isLoading={isLoading} />
      )}
    </div>
  );
}

export default function BoardDetail() {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <BoardDetailInner />
    </Suspense>
  );
}
