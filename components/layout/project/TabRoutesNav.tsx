"use client";

import { useParams, usePathname } from "next/navigation";
import { CgBoard } from "react-icons/cg";
import { FiHome, FiSettings } from "react-icons/fi";
import { GoPeople } from "react-icons/go";
import { MdOutlinePersonOutline } from "react-icons/md";

import { CustomLink } from "@/components/common/custom/CustomLink";
import { Permissions } from "@/enum/permissions.enum";
import { usePermission } from "@/hooks/permission/usePermission";

export const PATHS = {
  projects: "/projects",
  dashboard: "/dashboard",
  board: "/board",
  members: "/members",
  roles: "/roles",
  settings: "/settings",
  invites: "/invites",
};

const CORE_ROUTES = [
  { icon: FiHome, name: "Dashboard", path: PATHS.dashboard, permission: Permissions.DashboardView },
  { icon: CgBoard, name: "Board", path: PATHS.board, permission: Permissions.BoardView },
  { icon: MdOutlinePersonOutline, name: "Members", path: PATHS.members, permission: Permissions.MemberView },
  { icon: GoPeople, name: "Roles and Permissions", path: PATHS.roles, permission: Permissions.RolesView },
];

const ADMIN_ROUTES = [
  { icon: FiSettings, name: "Settings", path: PATHS.settings, permission: Permissions.SettingsProjectView },
];

export const ROUTES = [...CORE_ROUTES, ...ADMIN_ROUTES];

type Route = (typeof ROUTES)[number];

export default function TabRoutesNav() {
  const params = useParams();
  const pathname = usePathname();
  const { hasPermission } = usePermission();

  const projectId = params?.id;
  const projectBase = `${PATHS.projects}/${projectId}`;

  const visibleCore = CORE_ROUTES.filter(
    (route) => !route.permission || hasPermission(route.permission),
  );
  const visibleAdmin = ADMIN_ROUTES.filter(
    (route) => !route.permission || hasPermission(route.permission),
  );

  const renderTab = (route: Route) => {
    const Icon = route.icon;
    const href = `${projectBase}${route.path}`;
    const isActive = pathname === href || pathname.startsWith(`${href}/`);

    return (
      <CustomLink key={route.name} href={href}>
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
            isActive
              ? "bg-surface text-primary shadow-sm"
              : "text-muted hover:text-foreground hover:bg-surface/60"
          }`}
        >
          <Icon size={14} className="-translate-y-px" />
          <span>{route.name}</span>
        </div>
      </CustomLink>
    );
  };

  const hasBothGroups = visibleCore.length > 0 && visibleAdmin.length > 0;

  return (
    <nav className="TabRoutesNav border-b border-border px-4 py-3 bg-background">
      <div className="inline-flex items-center bg-surface-muted rounded-xl p-1 gap-0.5">
        {visibleCore.map(renderTab)}
        {hasBothGroups && (
          <div className="w-px h-4 bg-border mx-1" aria-hidden="true" />
        )}
        {visibleAdmin.map(renderTab)}
      </div>
    </nav>
  );
}
