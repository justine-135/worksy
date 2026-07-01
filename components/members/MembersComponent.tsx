"use client";

import PermissionGate from "@/components/common/PermissionGate";
import TablePageSkeleton from "@/components/common/skeleton/TablePageSkeleton";
import { Permissions } from "@/enum/permissions.enum";

import MembersDetail from "./MembersDetail";

function MembersComponent() {
  return (
    <PermissionGate
      permission={Permissions.MemberView}
      skeleton={<TablePageSkeleton />}
    >
      <MembersDetail />
    </PermissionGate>
  );
}

export default MembersComponent;
