import {
  Avatar,
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarProps,
} from "@heroui/react/avatar";

interface CustomAvatarProps {
  avatarProps?: AvatarProps;
  avatarImageProps: AvatarImageProps;
  avatarFallbackProps?: AvatarFallbackProps;
  fallback: string;
}

export default function CustomAvatar({
  avatarProps,
  avatarImageProps,
  avatarFallbackProps,
  fallback,
}: CustomAvatarProps) {
  return (
    <Avatar {...avatarProps}>
      <Avatar.Image {...avatarImageProps} />
      <Avatar.Fallback className="text-xs" {...avatarFallbackProps}>
        {fallback
          .split(" ")
          .map((n) => n[0])
          .join("")}
      </Avatar.Fallback>
    </Avatar>
  );
}
