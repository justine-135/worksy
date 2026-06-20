import { Chip } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { BiTrash } from "react-icons/bi";

import { StatusDTO } from "@/enum/member";
import { useSessionStore } from "@/store/session.store";
import { ProjectMemberTableDTO } from "@/types/projectMember.dto";
import { ColumnDef } from "@/types/table";
import { timeAgo } from "@/utils/timeAgo";

import SortableColumnHeader from "../common/custom/table/SortableColumn";
import ViewMemberDrawer from "./drawer/ViewMemberDrawer";
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
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const userId = useSessionStore((state) => state.userId);

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
      cell: (member) => {
        return (
          <>
            {member.name}
            {member.user.id === userId && (
              <span className="text-muted text-xs ml-2">(You)</span>
            )}
          </>
        );
      },
    },
    {
      id: "role",
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Role
        </SortableColumnHeader>
      ),
      cell: (member) => member.role.name ?? "Unassigned",
    },
    {
      id: "email",
      header: ({ sortDirection }) => (
        <SortableColumnHeader sortDirection={sortDirection}>
          Email
        </SortableColumnHeader>
      ),
      sortable: true,
      cell: (member) => (
        <div className="flex flex-col">
          <span>{member.email}</span>
          <span className="text-muted text-xs mt-1">
            Joined {timeAgo(member.createdAt)}
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
      cell: (member) => <StatusChip status={member.status} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (member) => {
        return (
          <div className="flex items-center gap-1">
            <EditMember
              status={member.status}
              role={member.role}
              userId={member.id}
            />
            <ViewMemberDrawer />
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
