"use client";

import { useState } from "react";

import { useDebounce } from "@/hooks/common/useDebounce";

import CustomSearchField from "../common/custom/CustomSearchField";
import AddRoleDrawer from "./drawer/AddRoleDrawer";
import RolesTable from "./RolesTable";

export default function RolesDetails() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <CustomSearchField value={search} onChange={setSearch} />
        <AddRoleDrawer />
      </div>
      <RolesTable search={debouncedSearch} />
    </div>
  );
}
