"use client";

import ProjectsDetail from "./ProjectsDetail";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toast } from "@heroui/react";

const queryClient = new QueryClient();

export default function ProjectsComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast.Provider />
      <ProjectsDetail />
    </QueryClientProvider>
  );
}
