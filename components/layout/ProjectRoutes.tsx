"use client";

import { Button } from "@heroui/react/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiFolder } from "react-icons/fi";
import { MdOutlineMailOutline } from "react-icons/md";

import { PATHS } from "./project/TabRoutesNav";

interface ProjectRoutesProps {
  collapsed?: boolean;
}

export default function ProjectRoutes({
  collapsed = false,
}: ProjectRoutesProps) {
  const path = usePathname();

  const isProjectRoute = path === PATHS.projects;
  const isInvitesRoute = path.startsWith(PATHS.invites);

  return (
    <div className="space-y-1">
      <Button
        className={`flex flex-col items-start p-0 ${collapsed ? "w-fit" : "w-full"}`}
        variant={isProjectRoute ? "secondary" : "ghost"}
      >
        <Link
          href={PATHS.projects}
          className={collapsed ? "px-2" : "w-full pl-3 pr-18"}
        >
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
        <Link
          href={PATHS.invites}
          className={collapsed ? "px-2" : "w-full pl-3 pr-18"}
        >
          <div className="flex items-center space-x-2">
            <MdOutlineMailOutline size={18} />
            {!collapsed && <span>Invites</span>}
          </div>
        </Link>
      </Button>
    </div>
  );
}
