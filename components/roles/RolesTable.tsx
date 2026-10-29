import { useEffect } from "react";

import { useGetRoles } from "@/hooks/role/useGetRoles";
import { useSessionStore } from "@/store/session.store";
import { RolesTableDTO } from "@/types/roles.dto";

import { CustomTable } from "../common/custom/table/CustomTable";
import usePagination from "../common/custom/table/usePagination";
import rolesTableColumns from "./rolesTableColumns";

export default function RolesTable({
  search,
  permission,
}: {
  search?: string;
  permission?: string;
}) {
  const projectId = useSessionStore((s) => s.projectId);
  const { columns } = rolesTableColumns();
  const { page, setPage } = usePagination();

  useEffect(() => {
    setPage(0);
  }, [search, permission, setPage]);

  const { data, isLoading } = useGetRoles({ projectId, page, search, permission });

  useEffect(() => {
    if (!isLoading && data?.data?.length === 0 && page > 0) {
      setPage(0);
    }
  }, [data, isLoading, page, setPage]);

  const transformData = (): RolesTableDTO[] => {
    if (!data) return [];
    return data.data.map((role) => ({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt as unknown as string,
      permissions: role.permissions.map((permission) => permission),
    }));
  };

  return (
    <CustomTable
      data={transformData() || []}
      columns={columns}
      getRowId={(u) => u.id}
      isLoading={isLoading}
      count={data?.count}
      setPage={setPage}
      page={page}
    />
  );
}
