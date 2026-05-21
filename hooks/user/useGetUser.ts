"use client";

import { QUERY_KEYS } from "@/constant/queryKeys";
import fetchUserById from "@/lib/user/fetchUserByID";
import { UserBasicInfoDTO } from "@/types/user.dto";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useGetUser({ userId }: { userId: string | null }) {
  const { data, error, isLoading } = useQuery<UserBasicInfoDTO>({
    queryKey: QUERY_KEYS.USER(userId),
    queryFn: () =>
      fetchUserById({
        userId,
      }),
    enabled: !!userId,
  });

  const params = useParams();

  const transformData = {
    ...data,
    role: data?.memberships?.find(
      (membership) => membership.projectId === params.id,
    )?.role,
  };

  return { data: transformData, error, isLoading };
}
