import { UserResponseDTO } from "@/types/user.dto";
import { Avatar, Surface } from "@heroui/react";

interface Props {
  member: UserResponseDTO | undefined;
}

export default function UserSurface(props: Props) {
  const { member } = props;

  return (
    <div className="my-2">
      <Surface className="flex space-x-2">
        <Avatar>
          <Avatar.Image
            alt="Blue"
            src={
              member?.image ||
              "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/blue.jpg"
            }
          />
          <Avatar.Fallback>B</Avatar.Fallback>
        </Avatar>
        <div className="flex flex-col ">
          <span className="font-semibold">{member?.name}</span>
          <span className="text-muted text-sm">{member?.email}</span>
        </div>
      </Surface>
    </div>
  );
}
