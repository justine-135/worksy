"use client";

import { MdLock, MdTitle } from "react-icons/md";

import TableSearch from "@/components/common/table-search/TableSearch";
import type { ActiveFilter, FilterDef, FilterOption } from "@/components/common/table-search/types";
import { Permissions } from "@/enum/permissions.enum";

interface RolesSearchProps {
  onFilterChange: (filters: ActiveFilter[]) => void;
}

const humanizePermission = (value: string): string =>
  value
    .split(".")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");

const PERMISSION_OPTIONS: FilterOption[] = Object.values(Permissions).map((v) => ({
  value: v,
  label: humanizePermission(v),
}));

const filterDefs: FilterDef[] = [
  { type: "name", label: "Name", Icon: MdTitle, kind: "text" },
  { type: "permission", label: "Permission", Icon: MdLock, kind: "static", options: PERMISSION_OPTIONS },
];

export default function RolesSearch({ onFilterChange }: RolesSearchProps) {
  return <TableSearch filterDefs={filterDefs} onFilterChange={onFilterChange} />;
}
