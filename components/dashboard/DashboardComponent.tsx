import { Permissions } from "@/enum/permissions.enum";
import { usePermission } from "@/hooks/permission/usePermission";

import DashboardDetail from "./DashboardDetail";

export default function DashboardComponent() {
  const { hasPermission } = usePermission();
  const isPermission = hasPermission(Permissions.BoardView);
  if (!isPermission) return "No permission";
  return <DashboardDetail />;
}
