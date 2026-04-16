"use client";

import { Toast } from "@heroui/react/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MembersDetail from "./MembersDetail";

const queryClient = new QueryClient();

function MembersComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast.Provider />
      <MembersDetail />
    </QueryClientProvider>
  );
}

export default MembersComponent;
