"use client";

import CustomSearchField from "../fields/CustomSearchField";
import { useSessionStore } from "@/store/session.store";
import { Typography } from "@heroui/react";
import { useGetInvites } from "@/hooks/invite/useGetInvites";
import InvitesList from "./InvitesList";

export default function InviteDetail() {
  const userId = useSessionStore((s) => s.userId);

  const { data, isLoading } = useGetInvites({
    receiverId: userId,
  });

  if (isLoading) return "Loading";

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
            <InvitesList data={data} />
          </div>
        </div>
      </section>
    </div>
  );
}
