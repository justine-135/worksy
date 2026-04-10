import { Card } from "@heroui/react/card";
import React from "react";

interface Props {
  title: string;
  content: string;
}

export default function DashboardCard(props: Props) {
  const { title, content } = props;
  return (
    <Card className="w-full min-w-full" variant="default">
      <Card.Header>
        <Card.Title className="text-md text-muted">{title}</Card.Title>
      </Card.Header>
      <Card.Content>
        <p className="text-xl font-bold">{content}</p>
      </Card.Content>
    </Card>
  );
}
