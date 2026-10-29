"use client";

import { Dropdown, Label } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import {
  MdCalendarMonth,
  MdSettings,
  MdTableRows,
  MdTimeline,
  MdViewKanban,
} from "react-icons/md";

import { useGetTaskBoard } from "@/hooks/taskboard/useGetTaskBoard";
import useInvalidateQuery from "@/hooks/taskboard/useInvalidateQuery";
import { type BoardFilter } from "@/lib/taskboard/fetchTaskBoard.lib";
import { useSessionStore } from "@/store/session.store";
import { TaskBoardResponseDTO } from "@/types/taskboard.dto";

import BoardKanbanView from "./BoardKanbanView";
import BoardSearch, { type ActiveFilter } from "./BoardSearch";
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

  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);

  const boardFilter = useMemo((): BoardFilter | undefined => {
    if (activeFilters.length === 0) return undefined;
    const f: BoardFilter = {};
    for (const af of activeFilters) {
      if (!af.value) continue;
      if (af.type === "title") f.title = af.value;
      if (af.type === "assignee") f.assigneeId = af.value;
      if (af.type === "priority") f.priority = af.value;
      if (af.type === "status") f.status = af.value;
    }
    return Object.keys(f).length ? f : undefined;
  }, [activeFilters]);

  const { invalidateTaskBoards } = useInvalidateQuery(
    projectId,
    queryClient,
  );

  const { data, isLoading } = useGetTaskBoard({
    projectId: projectId || "",
    filter: boardFilter,
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
      {/* Top row: search + view switcher */}
      <div className="flex items-center gap-3 flex-wrap">
        <BoardSearch projectId={projectId} onFilterChange={setActiveFilters} />
        <Dropdown>
          <Dropdown.Trigger
            aria-label="Change view"
            className="flex items-center justify-center rounded-md p-1 text-default-500 hover:bg-default-100"
          >
            <MdSettings className="size-5" />
          </Dropdown.Trigger>
          <Dropdown.Popover>
            <Dropdown.Menu
              selectedKeys={new Set([activeView])}
              selectionMode="single"
              onSelectionChange={(keys) => {
                const key = Array.from(keys)[0] as ViewKey;
                if (key) setView(key);
              }}
            >
              {VIEWS.map(({ key, label, icon: Icon }) => (
                <Dropdown.Item key={key} id={key} textValue={label}>
                  <Dropdown.ItemIndicator />
                  <Icon className="size-4" />
                  <Label>{label}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
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
