"use client";

import { useState } from "react";
import { MdCircle, MdPerson, MdPriorityHigh, MdTitle } from "react-icons/md";

import TableSearch from "@/components/common/table-search/TableSearch";
import type { AsyncFilterData, FilterDef, FilterOption } from "@/components/common/table-search/types";
import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";

export type { ActiveFilter } from "@/components/common/table-search/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIORITY_OPTIONS: FilterOption[] = [
  { value: "URGENT", label: "Urgent", dot: "bg-danger" },
  { value: "HIGH", label: "High", dot: "bg-warning" },
  { value: "MEDIUM", label: "Medium", dot: "bg-primary" },
  { value: "LOW", label: "Low", dot: "bg-default-400" },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: "TODO", label: "Todo", dot: "bg-primary" },
  { value: "IN_PROGRESS", label: "In Progress", dot: "bg-warning" },
  { value: "DONE", label: "Done", dot: "bg-success" },
];

const filterDefs: FilterDef[] = [
  { type: "title", label: "Title", Icon: MdTitle, kind: "text" },
  { type: "assignee", label: "Assignee", Icon: MdPerson, kind: "async" },
  { type: "priority", label: "Priority", Icon: MdPriorityHigh, kind: "static", options: PRIORITY_OPTIONS },
  { type: "status", label: "Status", Icon: MdCircle, kind: "static", options: STATUS_OPTIONS },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface BoardSearchProps {
  projectId?: string | null;
  onFilterChange: (filters: import("@/components/common/table-search/types").ActiveFilter[]) => void;
}

// ─── BoardSearch ──────────────────────────────────────────────────────────────

export default function BoardSearch({ projectId, onFilterChange }: BoardSearchProps) {
  const [memberSearch, setMemberSearch] = useState("");

  const { data: assigneesData, isLoading: assigneesLoading } = useGetProjectMembers({
    projectId,
    take: 50,
    enabled: !!projectId,
  });

  const filteredMembers = (assigneesData?.data ?? []).filter((m) => {
    if (!memberSearch.trim()) return true;
    return m.user.name.toLowerCase().includes(memberSearch.toLowerCase());
  });

  const assigneeAsyncData: AsyncFilterData = {
    items: filteredMembers.map((m) => ({
      value: m.id,
      label: m.user.name,
      avatar: { src: m.user.image ?? undefined, name: m.user.name },
    })),
    isLoading: assigneesLoading,
    search: memberSearch,
    onSearch: setMemberSearch,
  };

  return (
    <TableSearch
      filterDefs={filterDefs}
      asyncData={{ assignee: assigneeAsyncData }}
      onFilterChange={onFilterChange}
    />
  );
}
