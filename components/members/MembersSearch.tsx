"use client";

import { useState } from "react";
import { MdCircle, MdPerson, MdShield } from "react-icons/md";

import TableSearch from "@/components/common/table-search/TableSearch";
import type { ActiveFilter, AsyncFilterData, FilterDef, FilterOption } from "@/components/common/table-search/types";
import { useGetRoles } from "@/hooks/role/useGetRoles";

interface MembersSearchProps {
  projectId?: string | null;
  onFilterChange: (filters: ActiveFilter[]) => void;
}

const STATUS_OPTIONS: FilterOption[] = [
  { value: "active", label: "Active", dot: "bg-success" },
  { value: "pending", label: "Pending", dot: "bg-warning" },
  { value: "inactive", label: "Inactive", dot: "bg-default-400" },
];

const filterDefs: FilterDef[] = [
  { type: "name", label: "Name", Icon: MdPerson, kind: "text" },
  { type: "role", label: "Role", Icon: MdShield, kind: "async" },
  { type: "status", label: "Status", Icon: MdCircle, kind: "static", options: STATUS_OPTIONS },
];

export default function MembersSearch({ projectId, onFilterChange }: MembersSearchProps) {
  const [roleSearch, setRoleSearch] = useState("");

  const { data: rolesData, isLoading: rolesLoading } = useGetRoles({
    projectId,
  });

  const filteredRoles = (rolesData?.data ?? []).filter((r) =>
    r.name.toLowerCase().includes(roleSearch.toLowerCase()),
  );

  const roleAsyncData: AsyncFilterData = {
    items: filteredRoles.map((r) => ({ value: r.id, label: r.name })),
    isLoading: rolesLoading,
    search: roleSearch,
    onSearch: setRoleSearch,
  };

  return (
    <TableSearch
      filterDefs={filterDefs}
      asyncData={{ role: roleAsyncData }}
      onFilterChange={onFilterChange}
    />
  );
}
