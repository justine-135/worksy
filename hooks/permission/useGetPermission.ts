"use client";

import { useQuery } from "@tanstack/react-query";

import fetchPermissions from "@/lib/permission/fetchPermissions";
import { PermissionResponseDTO } from "@/types/permission";

export function useGetPermissions() {
  const { data, error, isLoading } = useQuery<PermissionResponseDTO[]>({
    queryKey: ["permissions"],
    queryFn: fetchPermissions,
  });

  return { data, error, isLoading };
}
