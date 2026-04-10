"use client";

import { Avatar, Button } from "@heroui/react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { CgBoard } from "react-icons/cg";
import { FiHome } from "react-icons/fi";
const routes = [
  {
    icon: FiHome,
    name: "Dashboard",
    path: "/",
  },
  {
    icon: CgBoard,
    name: "Board",
    path: "board",
  },
];

export default function SidebarNavigation() {
  const params = useParams();
  const pathname = usePathname();

  const projectId = params?.id;
  const projectBase = `/projects/${projectId}`;

  return (
    <nav className="SidebarNavigation h-screen px-6 space-y-6 border-r-gray-200 border-r pt-8">
      <div className="flex space-x-2">
        <div>
          <Avatar>
            <Avatar.Image
              alt="Blue"
              src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
            />
            <Avatar.Fallback>B</Avatar.Fallback>
          </Avatar>
        </div>
        <div className="flex flex-col ">
          <span className="font-semibold">Justine</span>
          <span className="text-muted text-sm">Owner</span>
        </div>
      </div>

      <div className="space-y-2">
        {routes.map((route) => {
          const Icon = route.icon;

          const href = `/projects/${projectId}/${route.path}`;

          const isActive =
            route.path === "/"
              ? pathname === projectBase || pathname === `${projectBase}/`
              : pathname === `${projectBase}/${route.path}`;

          return (
            <div key={route.name}>
              <Button
                variant={isActive ? "tertiary" : "ghost"}
                className="flex flex-col items-start w-full p-0"
              >
                <Link href={href} className="w-full pl-3 pr-18">
                  <div className="flex items-center space-x-2">
                    <Icon />
                    <span>{route.name}</span>
                  </div>
                </Link>
              </Button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
