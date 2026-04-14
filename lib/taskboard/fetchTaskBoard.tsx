"use client";

import { useQuery } from "@tanstack/react-query";

export function useGetTaskBoard({
  userId,
  projectId,
}: {
  userId: string;
  projectId: string;
}) {
  const { data, error, isLoading } = useQuery({
    queryKey: ["taskBoard", userId, projectId],
    queryFn: async () => {
      const res = await fetch(
        `/api/taskboard?project_id=${projectId}&user_id=${userId}`,
      );
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  return { data, error, isLoading };
}
