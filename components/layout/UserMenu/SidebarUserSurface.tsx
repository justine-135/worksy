"use client";

import { Surface } from "@heroui/react/surface";

import { PROJECT_IMAGE_PLACEHOLDER } from "@/components/projects/ProjectCard";
import { useGetUser } from "@/hooks/user/useGetUser";
import { useSidebarStore } from "@/store/sidebar.store";

import CustomAvatar from "../../common/custom/CustomAvatar";
import UserMenuDropDown from "./UserMenuDropDown";

export default function SidebarUserSurface() {
  const { data } = useGetUser();
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <Surface
      className={`flex items-center space-x-1 rounded-xl mt-auto ${!collapsed && "p-2"}`}
      variant={`${collapsed ? "transparent" : "secondary"}`}
    >
      {!collapsed && (
        <>
          <CustomAvatar
            avatarProps={{ size: "sm" }}
            avatarImageProps={{
              src: data?.image || PROJECT_IMAGE_PLACEHOLDER,
              alt: data?.name || "User",
              className: "pointer-events-none object-cover select-none",
            }}
            avatarFallbackProps={{ className: "text-xs" }}
            fallback={data?.name || ""}
          />
          <div className="flex flex-col">
            <span className="font-semibold text-xs">{data?.name}</span>
          </div>
        </>
      )}

      <UserMenuDropDown />
    </Surface>
  );
}
