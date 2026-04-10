import { Avatar } from "@heroui/react/avatar";
import { Card } from "@heroui/react/card";

const TaskCard = () => {
  return (
    <Card className="w-50 gap-2">
      <Card.Header>
        <Card.Title>Indie Hackers</Card.Title>
        <Card.Description>#9392</Card.Description>
      </Card.Header>
      <Card.Footer className="flex gap-2">
        <Avatar aria-label="Martha's profile picture" className="size-5">
          <Avatar.Image
            alt="Martha's avatar"
            src="https://heroui-assets.nyc3.cdn.digitaloceanspaces.com/avatars/red.jpg"
          />
          <Avatar.Fallback className="text-xs">IH</Avatar.Fallback>
        </Avatar>
        <span className="text-xs">Assigned to Justine</span>
      </Card.Footer>
    </Card>
  );
};

interface ITaskBoardProps {
  title: string;
}

const TaskBoard = (props: ITaskBoardProps) => {
  const { title } = props;
  return (
    <Card className="min-h-72 min-w-60 ">
      <div>
        <span>{title}</span>
      </div>
      <div className="overflow-y-auto max-h-[calc(90vh-150px)] space-y-2">
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
      </div>
    </Card>
  );
};

export default function BoardPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Board</h1>
      </div>
      <section>
        <div className="flex space-x-2 overflow-x-auto max-w-450 min-h-[calc(100vh-200px)] p-4">
          <TaskBoard title="Backlog" />
          <TaskBoard title="Ready" />
          <TaskBoard title="In progress" />
          <TaskBoard title="In review" />
          <TaskBoard title="Done" />
        </div>
      </section>
    </div>
  );
}
