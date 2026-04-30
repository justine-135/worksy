import { ColumnDef } from "@/types/table";
import SortableColumnHeader from "../table/SortableColumn";

import { Button } from "@heroui/react/button";
import { CgEye } from "react-icons/cg";
import { BiPencil, BiTrash } from "react-icons/bi";
import { RolesTableDTO } from "@/types/roles.dto";

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
      cell: (user) => user.name,
    },

    {
      id: "createdAt",
      sortable: true,
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Joined at
        </SortableColumnHeader>
      ),
      cell: (user) => <>{user.createdAt}</>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: () => (
        <div className="flex items-center gap-1">
          <Button isIconOnly size="sm" variant="tertiary">
            <CgEye />
          </Button>
          <Button isIconOnly size="sm" variant="tertiary">
            <BiPencil />
          </Button>
          <Button isIconOnly size="sm" variant="danger-soft">
            <BiTrash />
          </Button>
        </div>
      ),
    },
  ];

  return { columns };
}
