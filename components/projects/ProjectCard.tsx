import { Card } from "@heroui/react";
import Image from "next/image";

import CustomAvatar from "../common/custom/CustomAvatar";
import { CustomLink } from "../common/custom/CustomLink";

interface Props {
  id: string;
  title: string;
  memberCount: number;
  owner: { name: string; image?: string };
  imageUrl?: string | null;
}

export const PROJECT_IMAGE_PLACEHOLDER =
  "https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg";

export function ProjectCard({
  id,
  title,
  memberCount,
  owner,
  imageUrl,
}: Props) {
  return (
    <CustomLink href={`/projects/${id}/dashboard`}>
      <Card className="h-auto w-51.25 gap-2 hover:cursor-pointer hover:opacity-80">
        <div className="relative aspect-square w-14 overflow-hidden rounded-2xl">
          <Image
            alt={`${title} project icon`}
            className="pointer-events-none object-cover select-none"
            fill
            sizes="56px"
            src={imageUrl || PROJECT_IMAGE_PLACEHOLDER}
          />
        </div>
        <Card.Header>
          <Card.Title>{title}</Card.Title>
          <Card.Description>
            {memberCount} {memberCount > 1 ? "Members" : "Member"}
          </Card.Description>
        </Card.Header>
        <Card.Footer className="flex gap-2">
          <CustomAvatar
            avatarProps={{
              "aria-label": "User's profile picture",
              className: "size-5",
            }}
            avatarImageProps={{
              src: owner?.image || PROJECT_IMAGE_PLACEHOLDER,
              alt: title,
            }}
            fallback={title || ""}
          />

          <span className="text-xs">By {owner?.name}</span>
        </Card.Footer>
      </Card>
    </CustomLink>
  );
}
