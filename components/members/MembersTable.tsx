"use client";

import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { useSessionStore } from "@/store/session.store";

import { CustomTable } from "../common/custom/table/CustomTable";
import memberTableColumns from "./memberTableColumns";

export function MembersTable() {
  const projectId = useSessionStore((s) => s.projectId);
  const { data, isLoading } = useGetProjectMembers({
    projectId,
  });
  const { columns } = memberTableColumns();

  return (
    <CustomTable
      data={data || []}
      columns={columns}
      getRowId={(u) => u.id}
      tableContentProps={{ selectionMode: "none" }}
      isLoading={isLoading}
    />
  );
}
