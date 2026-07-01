import PermissionGate from "@/components/common/PermissionGate";
import { Permissions } from "@/enum/permissions.enum";

import DashboardDetail from "./DashboardDetail";
import DashboardSkeleton from "./DashboardSkeleton";

export default function DashboardComponent() {
  return (
    <PermissionGate
      permission={Permissions.BoardView}
      skeleton={<DashboardSkeleton />}
    >
      <DashboardDetail />
    </PermissionGate>
  );
}
