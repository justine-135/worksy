"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { QUERY_KEYS } from "@/constant/queryKeys";

export default function useInvalidateRecents() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PROJECTS(),
      }),
    [queryClient],
  );
}
