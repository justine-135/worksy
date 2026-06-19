import CustomAvatar from "@/components/avatar/CustomAvatar";
import { UserResponseDTO } from "@/types/user.dto";
import { Surface } from "@heroui/react";

interface Props {
  member: UserResponseDTO | undefined;
}

export default function UserSurface(props: Props) {
  const { member } = props;

  return (
    <div className="my-2">
      <Surface className="flex space-x-2">
        <CustomAvatar
          avatarProps={{ size: "sm" }}
          avatarImageProps={{
            src:
              member?.image ||
              "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg",
            alt: member?.name,
          }}
          fallback={member?.name || ""}
        />
        <div className="flex flex-col ">
          <span className="font-semibold">{member?.name}</span>
          <span className="text-muted text-sm">{member?.email}</span>
        </div>
      </Surface>
    </div>
  );
}
