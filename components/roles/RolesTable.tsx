import { useGetRoles } from "@/hooks/role/useGetRoles";
import { useSessionStore } from "@/store/session.store";
import { RolesTableDTO } from "@/types/roles.dto";

import { CustomTable } from "../common/custom/table/CustomTable";
import rolesTableColumns from "./rolesTableColumns";

export default function RolesTable() {
  const projectId = useSessionStore((s) => s.projectId);
  const { columns } = rolesTableColumns();
  const { data, isLoading } = useGetRoles({ projectId });

  return (
    <CustomTable
      data={(data as unknown as RolesTableDTO[]) || []}
      columns={columns}
      getRowId={(u) => u.id}
      isLoading={isLoading}
    />
  );
}
