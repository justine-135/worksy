"use client";

import { Button } from "@heroui/react/button";
import { Skeleton } from "@heroui/react/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BsBoxFill } from "react-icons/bs";
import { TbColumns2 } from "react-icons/tb";

import { useGetProjects } from "@/hooks/project/useGetProjects";
import { useSidebarStore } from "@/store/sidebar.store";

import { PATHS } from "./project/TabRoutesNav";
import ProjectRoutes from "./ProjectRoutes";
import SidebarUserSurface from "./SidebarUserSurface";

const SkeletonItem = () => <Skeleton className="h-9 w-53.5 rounded-full" />;

const SkeletonComponent = () => {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </div>
  );
};

export default function SidebarNavigation() {
  const { data, isLoading } = useGetProjects({
    filter: "recent",
  });

  const params = useParams();

  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <nav
      className={`SidebarNavigation bg-surface flex flex-col p-4 fixed border-r border-border min-h-screen transition-[width,min-width] duration-300 ease-in-out ${
        collapsed ? "w-18 min-w-16" : "w-61.5 min-w-61.5"
      }`}
    >
      <div className="flex flex-col">
        <div
          className={`flex items-center mb-4 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && <BsBoxFill />}
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={toggle}
            className="cursor-pointer"
          >
            <TbColumns2 />
          </button>
        </div>
        <ProjectRoutes />
        {!collapsed && isLoading && <SkeletonComponent />}
        {!collapsed && (
          <div className="flex flex-col mt-4 space-y-1">
            {!!data?.length && (
              <span className="text-sm font-medium text-default-500">
                Recents
              </span>
            )}
            {data?.map((route) => {
              const isActive = route.id === params.id;

              return (
                <div key={route.id}>
                  <Button
                    className={`flex flex-col items-start w-53.5 p-0 ${isActive ? "bg-surface shadow-xl/10" : ""}`}
                    variant="ghost"
                  >
                    <Link
                      href={`${PATHS.projects}/${route.id}/${params.section || "dashboard"}`}
                      className="w-full pl-3 pr-23.5"
                    >
                      <div className="flex items-center space-x-2">
                        <span>{route.title}</span>
                      </div>
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <SidebarUserSurface />
    </nav>
  );
}
