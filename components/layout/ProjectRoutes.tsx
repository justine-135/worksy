"use client";

import { Button } from "@heroui/react/button";
import Link from "next/link";
import { PATHS } from "./project/TabRoutesNav";
import { FiFolder } from "react-icons/fi";
import { MdOutlineMailOutline } from "react-icons/md";
import { usePathname } from "next/navigation";

export default function ProjectRoutes() {
  const path = usePathname();

  const isProjectRoute = path === PATHS.projects;
  const isInvitesRoute = path.startsWith(PATHS.invites);

  return (
    <div className="space-y-1">
      <Button
        className="flex flex-col items-start w-full p-0"
        variant={isProjectRoute ? "secondary" : "ghost"}
      >
        <Link href={PATHS.projects} className="w-full pl-3 pr-18">
          <div className="flex items-center space-x-2">
            <FiFolder size={18} />
            <span>Project</span>
          </div>
        </Link>
      </Button>
      <Button
        className="flex flex-col items-start w-full p-0"
        variant={isInvitesRoute ? "secondary" : "ghost"}
      >
        <Link href={PATHS.invites} className="w-full pl-3 pr-18">
          <div className="flex items-center space-x-2">
            <MdOutlineMailOutline size={18} />
            <span>Invites</span>
          </div>
        </Link>
      </Button>
    </div>
  );
}
