"use client";

import { useCallback, useState } from "react";

import type { ActiveFilter } from "@/components/common/table-search/types";

import AddRoleDrawer from "./drawer/AddRoleDrawer";
import RolesSearch from "./RolesSearch";
import RolesTable from "./RolesTable";

export default function RolesDetails() {
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [permission, setPermission] = useState<string | undefined>(undefined);

  const handleFilterChange = useCallback((filters: ActiveFilter[]) => {
    setSearch(filters.find((f) => f.type === "name")?.value ?? undefined);
    setPermission(filters.find((f) => f.type === "permission")?.value ?? undefined);
  }, []);

  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <RolesSearch onFilterChange={handleFilterChange} />
        <AddRoleDrawer />
      </div>
      <RolesTable search={search} permission={permission} />
    </div>
  );
}
