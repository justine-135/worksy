import { useGetRoles } from "@/hooks/role/useGetRoles";
import { TableCustom } from "../table/TableCustom";
import rolesTableColumns from "./rolesTableColumns";
import { useSessionStore } from "@/store/session.store";
import { RolesTableDTO } from "@/types/roles.dto";

export default function RolesTable() {
  const projectId = useSessionStore((s) => s.projectId);
  const { columns } = rolesTableColumns();
  const { data, isLoading } = useGetRoles({ projectId });

  return (
    <TableCustom
      data={(data as unknown as RolesTableDTO[]) || []}
      columns={columns}
      getRowId={(u) => u.id}
      isLoading={isLoading}
    />
  );
}
