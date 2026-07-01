"use client";

import PermissionGate from "@/components/common/PermissionGate";
import TablePageSkeleton from "@/components/common/skeleton/TablePageSkeleton";
import { Permissions } from "@/enum/permissions.enum";

import RolesDetails from "./RolesDetails";

function RolesComponent() {
  return (
    <PermissionGate
      permission={Permissions.RolesView}
      skeleton={<TablePageSkeleton />}
    >
      <RolesDetails />
    </PermissionGate>
  );
}

export default RolesComponent;
