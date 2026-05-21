import CustomButton from "@/components/button/CustomButton";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/components/projects/ProjectCard";
import { useGetUser } from "@/hooks/user/useGetUser";
import { useSessionStore } from "@/store/session.store";
import { Avatar } from "@heroui/react/avatar";
import { Surface } from "@heroui/react/surface";
import { signOut } from "next-auth/react";
import { LuLogOut } from "react-icons/lu";

export default function SidebarUserSurface() {
  const userId = useSessionStore((s) => s.userId);

  const { data } = useGetUser({ userId });

  return (
    <Surface
      className="flex items-center space-x-1 p-2 rounded-xl"
      variant="secondary"
    >
      <Avatar size="sm">
        <Avatar.Image
          alt={`${data?.name || "User"} project icon`}
          className="pointer-events-none object-cover select-none"
          src={data?.image || PROJECT_IMAGE_PLACEHOLDER}
        />
        <Avatar.Fallback>B</Avatar.Fallback>
      </Avatar>
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
