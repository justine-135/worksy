"use client";

import { useState } from "react";

import { useDebounce } from "@/hooks/common/useDebounce";

import CustomSearchField from "../common/custom/CustomSearchField";
import { MembersTable } from "./MembersTable";
import InviteMemberModal from "./modal/InviteMemberModal";

export default function MembersDetail() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);

  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <CustomSearchField value={search} onChange={setSearch} />
        <InviteMemberModal />
      </div>
      <MembersTable search={debouncedSearch} />
    </div>
  );
}
