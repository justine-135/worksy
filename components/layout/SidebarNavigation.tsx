"use client";

import { useGetProjects } from "@/hooks/project/useGetProjects";
import { useSessionStore } from "@/store/session.store";
import { Button } from "@heroui/react/button";
import Link from "next/link";
import { Skeleton } from "@heroui/react/skeleton";
import { useParams } from "next/navigation";
import { PATHS } from "./project/TabRoutesNav";
import SidebarUserSurface from "./SidebarUserSurface";
import ProjectRoutes from "./ProjectRoutes";
import { TbColumns2 } from "react-icons/tb";
import { BsBoxFill } from "react-icons/bs";

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
  const userId = useSessionStore((s) => s.userId);
  const { data, isLoading } = useGetProjects({
    userId,
  });

  const params = useParams();

  return (
    <nav className="SidebarNavigation flex flex-col p-4 fixed border-r border-color-border min-h-screen">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <BsBoxFill />
          <TbColumns2 />
        </div>
        <ProjectRoutes />
        {isLoading && <SkeletonComponent />}
        <div className="flex flex-col mt-4 space-y-1">
          {data?.length && (
            <span className="text-sm font-medium text-default-500">
              Projects
            </span>
          )}
          {data?.map((route) => {
            const isActive = route.id === params.id;

            return (
              <div key={route.id}>
                <Button
                  className={`flex flex-col items-start w-53.5 p-0 ${isActive ? "bg-white shadow-xl/10" : ""}`}
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
      </div>
      <SidebarUserSurface />
    </nav>
  );
}
