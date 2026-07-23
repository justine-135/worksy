"use client";

import { useGetProjectMembers } from "@/hooks/member/useGetProjectMembers";
import { useSessionStore } from "@/store/session.store";
import { ProjectMemberTableDTO } from "@/types/projectMember.dto";

import { CustomTable } from "../common/custom/table/CustomTable";
import usePagination from "../common/custom/table/usePagination";
import memberTableColumns from "./memberTableColumns";

export function MembersTable() {
  const projectId = useSessionStore((s) => s.projectId);
  const { page, setPage } = usePagination();

  const { data, isLoading } = useGetProjectMembers({
    projectId,
    page,
  });
  const { columns } = memberTableColumns(page);

  const transformData = (): ProjectMemberTableDTO[] => {
    if (!data) return [];
    return data.data.map((member) => ({
      id: member.id,
      name: member.user.name,
      email: member.user.email,
      role: {
        name: member?.role?.name,
        id: member?.role?.id,
      },
      user: member.user,
      createdAt: member.createdAt as unknown as string,
      status: member.status,
    }));
  };

  return (
    <CustomTable
      data={transformData() || []}
      columns={columns}
      getRowId={(u) => u.id}
      tableContentProps={{ selectionMode: "none" }}
      isLoading={isLoading}
      count={data?.count}
      setPage={setPage}
      page={page}
    />
  );
}
