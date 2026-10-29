"use client";

import { useCallback, useState } from "react";

import type { ActiveFilter } from "@/components/common/table-search/types";
import { useSessionStore } from "@/store/session.store";

import MembersSearch from "./MembersSearch";
import { MembersTable } from "./MembersTable";
import InviteMemberModal from "./modal/InviteMemberModal";

export default function MembersDetail() {
  const projectId = useSessionStore((s) => s.projectId);
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [roleId, setRoleId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<string | undefined>(undefined);

  const handleFilterChange = useCallback((filters: ActiveFilter[]) => {
    setSearch(filters.find((f) => f.type === "name")?.value ?? undefined);
    setRoleId(filters.find((f) => f.type === "role")?.value ?? undefined);
    setStatus(filters.find((f) => f.type === "status")?.value ?? undefined);
  }, []);

  return (
    <div className="flex flex-col space-y-6 overflow-hidden">
      <div className="flex items-center justify-between">
        <MembersSearch projectId={projectId} onFilterChange={handleFilterChange} />
        <InviteMemberModal />
      </div>
      <MembersTable search={search} roleId={roleId} status={status} />
    </div>
  );
}
