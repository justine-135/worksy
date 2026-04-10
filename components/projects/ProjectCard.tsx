import { Avatar, Card } from "@heroui/react";

export function ProjectCard() {
  return (
    <Card className="w-50 gap-2 hover:cursor-pointer hover:opacity-80">
      <img
        alt="Indie Hackers community"
        className="pointer-events-none aspect-square w-14 rounded-2xl object-cover select-none"
        loading="lazy"
        src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/docs/demo1.jpg"
      />
      <Card.Header>
        <Card.Title>Indie Hackers</Card.Title>
        <Card.Description>148 members</Card.Description>
      </Card.Header>
      <Card.Footer className="flex gap-2">
        <Avatar aria-label="Martha's profile picture" className="size-5">
          <Avatar.Image
            alt="Martha's avatar"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
          />
          <Avatar.Fallback className="text-xs">IH</Avatar.Fallback>
        </Avatar>
        <span className="text-xs">By Martha</span>
      </Card.Footer>
    </Card>
  );
}
