"use client";

import CustomSearchField from "../common/custom/CustomSearchField";
import { useSessionStore } from "@/store/session.store";
import { Skeleton, Surface, Typography } from "@heroui/react";
import { useGetInvites } from "@/hooks/invite/useGetInvites";
import InvitesList from "./InvitesList";
import { ProjectInviteResponseDTO } from "@/types/projectInvite.dto";
import CustomEmpty from "../common/custom/CustomEmpty";

const SkeletonInviteInformation = () => {
  return (
    <Surface
      variant="transparent"
      className="flex items-center gap-4 p-2 rounded-3xl border border-default-200/80"
    >
      <Skeleton className="relative aspect-square w-14 overflow-hidden rounded-2xl " />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-5">
          <Skeleton>
            <Skeleton className="size-5 " />
          </Skeleton>
          <Skeleton>
            <Skeleton className=" h-4 w-16" />
          </Skeleton>
          <Skeleton>
            <Skeleton className=" h-4 w-24" />
          </Skeleton>
        </div>
      </div>
      <div className="flex ml-auto space-x-2">
        <Skeleton className="relative h-9 w-20 overflow-hidden rounded-2xl " />
        <Skeleton className="relative h-9 w-20 overflow-hidden rounded-2xl " />
      </div>
    </Surface>
  );
};

const InvitesListWrapper = ({
  data,
  isLoading,
}: {
  data: ProjectInviteResponseDTO[] | undefined;
  isLoading: boolean;
}) => {
  return (
    <>
      {Array.from({ length: isLoading ? 3 : 0 }).map((_, index) => (
        <SkeletonInviteInformation key={index} />
      ))}
      <InvitesList data={data} />
      {!data?.length && !isLoading && <CustomEmpty message="No invites yet" />}
    </>
  );
};

export default function InviteDetail() {
  const userId = useSessionStore((s) => s.userId);

  const { data, isLoading } = useGetInvites({
    receiverId: userId,
  });

  return (
    <div className="InvitesDetail flex flex-col space-y-6">
      <section>
        <div className="flex flex-col gap-4 items-center mt-20 w-full">
          <div className="flex flex-col gap-4 w-[53%] max-w-217.25">
            <div className="flex items-center justify-between w-full">
              <Typography.Heading
                level={1}
                className="font-extralight text-2xl"
              >
                Invites
              </Typography.Heading>
              <CustomSearchField />
            </div>
            <InvitesListWrapper data={data} isLoading={isLoading} />
          </div>
        </div>
      </section>
    </div>
  );
}
