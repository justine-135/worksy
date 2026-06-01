"use client";

import { Toast } from "@heroui/react/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function ToastLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Toast.Provider />
      {children}
    </QueryClientProvider>
  );
}

export default ToastLayout;
