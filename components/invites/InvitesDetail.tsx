"use client";

import { Skeleton, Typography } from "@heroui/react";
import { useState } from "react";

import { useGetInvites } from "@/hooks/invite/useGetInvites";
import { ProjectInviteResponseDTO } from "@/types/projectInvite.dto";

import CustomEmpty from "../common/custom/CustomEmpty";
import CustomSearchField from "../common/custom/CustomSearchField";
import InvitesList from "./InvitesList";

const SkeletonInviteInformation = () => {
  return (
    <div className="flex gap-4 rounded-2xl border border-default-200/40 bg-content1 p-4">
      <Skeleton className="h-18 w-18 shrink-0 rounded-xl" />
      <div className="flex flex-1 items-center gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-36 rounded-lg" />
          <Skeleton className="h-3 w-48 rounded-lg" />
          <Skeleton className="h-3 w-24 rounded-lg" />
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-xl" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

const InvitesListWrapper = ({
  data,
  isLoading,
  emptyMessage = "No invites yet",
}: {
  data: ProjectInviteResponseDTO[] | undefined;
  isLoading: boolean;
  emptyMessage?: string;
}) => {
  return (
    <>
      {Array.from({ length: isLoading ? 3 : 0 }).map((_, index) => (
        <SkeletonInviteInformation key={index} />
      ))}
      <InvitesList data={data} />
      {!data?.length && !isLoading && <CustomEmpty message={emptyMessage} />}
    </>
  );
};

export default function InviteDetail() {
  const { data, isLoading } = useGetInvites();
  const [search, setSearch] = useState("");

  const filtered = search
    ? data?.filter((invite) => {
        const q = search.toLowerCase();
        return (
          invite.project.title.toLowerCase().includes(q) ||
          invite.userSender.name?.toLowerCase().includes(q) ||
          invite.userSender.email.toLowerCase().includes(q)
        );
      })
    : data;

  return (
    <div className="InvitesDetail flex flex-col space-y-6">
      <section>
        <div className="flex flex-col gap-4 items-center mt-16 w-full">
          <div className="flex flex-col gap-4 w-full max-w-3xl px-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Typography.Heading level={1} className="text-xl font-semibold">
                  Invites
                </Typography.Heading>
                {data && data.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-default-100 px-2 py-0.5 text-xs font-medium text-default-600">
                    {data.length}
                  </span>
                )}
              </div>
              <CustomSearchField value={search} onChange={setSearch} />
            </div>
            <InvitesListWrapper
              data={filtered}
              isLoading={isLoading}
              emptyMessage={
                search ? "No invites match your search" : "No invites yet"
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}
