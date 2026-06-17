"use client";

import fetchPermissions from "@/lib/permission/fetchPermissions";
import { PermissionResponseDTO } from "@/types/permission";
import { useQuery } from "@tanstack/react-query";

export function useGetPermissions() {
  const { data, error, isLoading } = useQuery<PermissionResponseDTO[]>({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  return { data, error, isLoading };
}
