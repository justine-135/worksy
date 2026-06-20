import CustomButton from "@/components/common/custom/CustomButton";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/components/projects/ProjectCard";
import { useGetUser } from "@/hooks/user/useGetUser";
import { useSessionStore } from "@/store/session.store";
import { Surface } from "@heroui/react/surface";
import { signOut } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";
import CustomAvatar from "../common/custom/CustomAvatar";

export default function SidebarUserSurface() {
  const userId = useSessionStore((s) => s.userId);

  const { data } = useGetUser({ userId });

  return (
    <Surface
      className="flex items-center space-x-1 p-2 rounded-xl mt-auto"
      variant="secondary"
    >
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
        <span className="text-muted text-xs">{data?.role?.name}</span>
      </div>
      <CustomButton
        className="ml-auto"
        size="sm"
        onClick={() => signOut()}
        variant="outline"
        title={<LuLogOut />}
      />
    </Surface>
  );
}
