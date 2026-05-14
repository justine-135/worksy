import { ColumnDef } from "@/types/table";
import SortableColumnHeader from "../table/SortableColumn";

import { ProjectMemberTableDTO } from "@/types/projectMember.dto";
import { Button } from "@heroui/react/button";
import { BiTrash } from "react-icons/bi";
import { Chip } from "@heroui/react";
import { StatusDTO } from "@/enum/member";
import ViewMemberDrawer from "./drawer/ViewMemberDrawer";
import { timeAgo } from "@/utils/timeAgo";
import EditMember from "./modal/EditMember";

const StatusChip = ({ status }: { status: StatusDTO }) => {
  if (status === StatusDTO.active) {
    return (
      <Chip color="success">
        <Chip.Label>Active</Chip.Label>
      </Chip>
    );
  }
  if (status === StatusDTO.inactive) {
    return (
      <Chip color="danger">
        <Chip.Label>Inactive</Chip.Label>
      </Chip>
    );
  }
  return (
    <Chip color="warning">
      <Chip.Label>Pending</Chip.Label>
    </Chip>
  );
};

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
      cell: (user) => user.role.name ?? "Unassigned",
    },
    {
      id: "email",
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Email
        </SortableColumnHeader>
      ),
      sortable: true,
      cell: (user) => (
        <div className="flex flex-col">
          <span>{user.email}</span>
          <span className="text-muted text-xs mt-1">
            Joined {timeAgo(user.createdAt)}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Status
        </SortableColumnHeader>
      ),
      sortable: true,
      cell: (user) => <StatusChip status={user.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (user) => {
        return (
          <div className="flex items-center gap-1">
            <EditMember
              status={user.status}
              role={user.role}
              userId={user.id}
            />
            <ViewMemberDrawer userId={user.id} />
            <Button isIconOnly size="sm" variant="danger-soft">
              <BiTrash />
            </Button>
          </div>
        );
      },
    },
  ];

  return { columns };
}
