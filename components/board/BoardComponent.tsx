"use client";

import BoardDetail from "./BoardDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function BoardComponent({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <BoardDetail userId={userId} projectId={projectId} />
    </QueryClientProvider>
  );
}

export default BoardComponent;
