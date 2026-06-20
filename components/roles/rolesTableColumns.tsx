import { Chip } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { BiTrash } from "react-icons/bi";

import { RolesTableDTO } from "@/types/roles.dto";
import { ColumnDef } from "@/types/table";
import { timeAgo } from "@/utils/timeAgo";
import { formatPermission } from "@/utils/transform-permissions";

import SortableColumnHeader from "../common/custom/table/SortableColumn";
import EditRoleDrawer from "./drawer/EditRoleDrawer";

export default function rolesTableColumns() {
  const columns: ColumnDef<RolesTableDTO>[] = [
    {
      id: "name",
      isRowHeader: true,
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Role
        </SortableColumnHeader>
      ),
      sortable: true,
      className: "w-40",
      cell: (user) => user.name,
    },
    {
      id: "permissions",
      header: "Permissions",
      className: "w-200",
      cell: (user) => {
        const permissions = user.permissions.map((permission, idx) => (
          <Chip key={idx}>{formatPermission(permission.key)}</Chip>
        ));
        return <div className="flex flex-wrap gap-2">{permissions}</div>;
      },
    },
    {
      id: "createdAt",
      sortable: true,
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Created at
        </SortableColumnHeader>
      ),
      cell: (user) => <>{timeAgo(user.createdAt)}</>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (user) => (
        <div className="flex items-center gap-1">
          <EditRoleDrawer
            role={{
              id: user.id,
              name: user.name,
              permissions: user.permissions,
            }}
          />
          <Button isIconOnly size="sm" variant="danger-soft">
            <BiTrash />
          </Button>
        </div>
      ),
    },
  ];

  return { columns };
}
