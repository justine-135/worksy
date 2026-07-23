"use client";

import { Button } from "@heroui/react/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiFolder } from "react-icons/fi";
import { MdOutlineMailOutline } from "react-icons/md";

import { useSidebarStore } from "@/store/sidebar.store";

import { NotificationDropdown } from "./NotificationDropdown";
import { PATHS } from "./project/TabRoutesNav";

export default function ProjectRoutes() {
  const path = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);

  const isProjectRoute = path === PATHS.projects;
  const isInvitesRoute = path.startsWith(PATHS.invites);

  const collapsedButtonClassName: React.HTMLAttributes<HTMLElement>["className"] =
    collapsed ? "px-[0.8rem]" : "w-full pl-3 pr-18";

  return (
    <div className="space-y-1">
      <Button
        className="flex flex-col items-start p-0 w-full"
        variant={isProjectRoute ? "secondary" : "ghost"}
      >
        <Link href={PATHS.projects} className={collapsedButtonClassName}>
          <div className="flex items-center space-x-2">
            <FiFolder size={18} />
            {!collapsed && <span>Project</span>}
          </div>
        </Link>
      </Button>
      <Button
        className={`flex flex-col items-start p-0 ${collapsed ? "w-fit" : "w-full"}`}
        variant={isInvitesRoute ? "secondary" : "ghost"}
      >
        <Link href={PATHS.invites} className={collapsedButtonClassName}>
          <div className="flex items-center space-x-2">
            <MdOutlineMailOutline size={18} />
            {!collapsed && <span>Invites</span>}
          </div>
        </Link>
      </Button>
      <NotificationDropdown
        collapsed={collapsed}
        collapsedButtonClassName={collapsedButtonClassName}
      />
    </div>
  );
}
