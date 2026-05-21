"use client";

import { useGetProjects } from "@/hooks/project/useGetProjects";
import { useSessionStore } from "@/store/session.store";
import { Button } from "@heroui/react/button";
import Link from "next/link";
import { Skeleton } from "@heroui/react/skeleton";
import { useParams } from "next/navigation";
import { PATHS } from "./TabRoutesNav";
import SidebarUserSurface from "./SidebarUserSurface";
const SkeletonItem = () => (
  <Skeleton className="h-9 w-40 rounded-full ml-3 pr-18" />
);

const SkeletonComponent = () => {
  return (
    <>
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </>
  );
};

export default function SidebarNavigation() {
  const userId = useSessionStore((s) => s.userId);
  const { data, isLoading } = useGetProjects({
    userId,
  });

  const params = useParams();

  return (
    <nav className="SidebarNavigation px-6 space-y-6 pt-4 fixed border-r border-color-border min-h-screen">
      <div className="flex flex-col space-y-2">
        <div>
          <Button
            className="flex flex-col items-start w-full p-0"
            variant="ghost"
          >
            <Link href={PATHS.projects} className="w-full pl-3 pr-18">
              <div className="flex items-center space-x-2">
                <span>New project</span>
              </div>
            </Link>
          </Button>
        </div>
        {isLoading && <SkeletonComponent />}
        {data?.map((route) => {
          const isActive = route.id === params.id;

          return (
            <div key={route.id}>
              <Button
                className={`flex flex-col items-start w-full p-0 ${isActive ? "bg-white shadow-xl/10" : ""}`}
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
      <SidebarUserSurface />
    </nav>
  );
}
