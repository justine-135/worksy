import { Permissions } from "@/enum/permissions.enum";
import DashboardDetail from "./DashboardDetail";
import { usePermission } from "@/hooks/permission/usePermission";

export default function DashboardComponent() {
  const { hasPermission } = usePermission();
  const isPermission = hasPermission(Permissions.BoardView);
  if (!isPermission) return "No permission";
  return <DashboardDetail />;
}
