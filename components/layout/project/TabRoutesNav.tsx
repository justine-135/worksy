"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { CgBoard } from "react-icons/cg";
import { FiHome, FiSettings } from "react-icons/fi";
import { GoPeople } from "react-icons/go";
import { MdOutlinePersonOutline } from "react-icons/md";

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
  },
  {
    icon: CgBoard,
    name: "Board",
    path: PATHS.board,
  },
  {
    icon: MdOutlinePersonOutline,
    name: "Members",
    path: PATHS.members,
  },
  {
    icon: GoPeople,
    name: "Roles and Permissions",
    path: PATHS.roles,
  },
  {
    icon: FiSettings,
    name: "Settings",
    path: PATHS.settings,
  },
];

export default function TabRoutesNav() {
  const params = useParams();
  const pathname = usePathname();

  const projectId = params?.id;
  const projectBase = `${PATHS.projects}/${projectId}`;

  return (
    <nav className="TabRoutesNav border-b border-gray-200 px-4">
      <div className="flex gap-6">
        {ROUTES.map((route) => {
          const Icon = route.icon;

          const href = `${PATHS.projects}/${projectId}/${route.path}`;

          const isActive = pathname === `${projectBase}${route.path}`;

          return (
            <div key={route.name}>
              <div
                className={`flex flex-col items-start w-full py-1 ${isActive ? "border-b-2 border-primary opacity-100" : "opacity-40"}`}
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
