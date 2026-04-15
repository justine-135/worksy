"use client";

import { Toast } from "@heroui/react/toast";
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
      <Toast.Provider />
      <BoardDetail userId={userId} projectId={projectId} />
    </QueryClientProvider>
  );
}

export default BoardComponent;
