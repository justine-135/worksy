"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { CgBoard } from "react-icons/cg";
import { FiHome, FiSettings } from "react-icons/fi";
import { GoPeople } from "react-icons/go";
import { MdOutlinePersonOutline } from "react-icons/md";

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

export const ROUTES = [
  {
    icon: FiHome,
    name: "Dashboard",
    path: PATHS.dashboard,
    permission: Permissions.DashboardView,
  },
  {
    icon: CgBoard,
    name: "Board",
    path: PATHS.board,
    permission: Permissions.BoardView,
  },
  {
    icon: MdOutlinePersonOutline,
    name: "Members",
    path: PATHS.members,
    permission: Permissions.MemberView,
  },
  {
    icon: GoPeople,
    name: "Roles and Permissions",
    path: PATHS.roles,
    permission: Permissions.RolesView,
  },
  {
    icon: FiSettings,
    name: "Settings",
    path: PATHS.settings,
    permission: Permissions.SettingsProjectView,
  },
];

export default function TabRoutesNav() {
  const params = useParams();
  const pathname = usePathname();
  const { hasPermission } = usePermission();

  const projectId = params?.id;
  const projectBase = `${PATHS.projects}/${projectId}`;

  const visibleRoutes = ROUTES.filter(
    (route) => !route.permission || hasPermission(route.permission),
  );

  return (
    <nav className="TabRoutesNav border-b border-border px-4 bg-background">
      <div className="flex gap-6">
        {visibleRoutes.map((route) => {
          const Icon = route.icon;

          const href = `${projectBase}${route.path}`;

          // Match the tab's own path and any of its subroutes (e.g. Settings
          // stays active on /settings/appearance) without cross-matching
          // sibling tabs (the trailing "/" prevents /board matching /boardX).
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <div key={route.name}>
              <div
                className={`flex flex-col items-start w-full pb-1 pt-4 ${isActive ? "border-b-2 border-primary opacity-100" : "opacity-40"}`}
              >
                <Link href={href} className="w-full ">
                  <div className="flex items-center space-x-1">
                    <Icon size={16} className="-translate-y-px" />
                    <span className="text-sm font-medium">{route.name}</span>
                  </div>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
