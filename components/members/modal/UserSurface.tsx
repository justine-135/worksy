import { LuX } from "react-icons/lu";

import CustomAvatar from "@/components/common/custom/CustomAvatar";
import { UserResponseDTO } from "@/types/user.dto";

interface Props {
  member: UserResponseDTO;
  onClear: () => void;
}

export default function UserSurface({ member, onClear }: Props) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
      <CustomAvatar
        avatarProps={{ size: "sm" }}
        avatarImageProps={{
          src: member.image || "",
          alt: member.name || "User",
        }}
        avatarFallbackProps={{ className: "text-xs" }}
        fallback={member.name || ""}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium">{member.name}</span>
        <span className="truncate text-xs text-default-500">{member.email}</span>
      </div>
      <button
        type="button"
        aria-label="Remove selected user"
        className="shrink-0 rounded-md p-0.5 text-default-400 transition-colors hover:bg-default-200 hover:text-default-700"
        onClick={onClear}
      >
        <LuX className="size-3.5" />
      </button>
    </div>
  );
}
