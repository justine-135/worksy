import { ColumnDef } from "@/types/table";
import SortableColumnHeader from "../table/SortableColumn";

import { ProjectMemberTableDTO } from "@/types/projectMember.dto";
import { Button } from "@heroui/react/button";
import { CgEye } from "react-icons/cg";
import { BiPencil, BiTrash } from "react-icons/bi";

export default function memberTableColumns() {
  const columns: ColumnDef<ProjectMemberTableDTO>[] = [
    {
      id: "name",
      isRowHeader: true,
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Member
        </SortableColumnHeader>
      ),
      sortable: true,
      cell: (user) => user.name,
    },
    {
      id: "role",
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Role
        </SortableColumnHeader>
      ),
      cell: (user) => user.role,
    },
    {
      id: "email",
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Email
        </SortableColumnHeader>
      ),
      sortable: true,
      cell: (user) => user.email,
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
