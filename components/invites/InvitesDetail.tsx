"use client";

import { useGetProjects } from "@/hooks/project/useGetProjects";
import CustomSearchField from "../fields/CustomSearchField";
import { useSessionStore } from "@/store/session.store";
import { Typography } from "@heroui/react";
import EmptyCustom from "../empty/EmptyCustom";

export default function InviteDetail() {
  const userId = useSessionStore((s) => s.userId);

  const { isLoading } = useGetProjects({
    userId,
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

            <div className="flex flex-wrap mr-auto gap-4 max-w-230">
              {/* {data?.map((project) => {
                const { id, title, members, owner, imageUrl } = project;
                return (
                  <ProjectCard
                    key={id}
                    id={id}
                    title={title}
                    memberCount={members.length}
                    owner={owner.name}
                    imageUrl={imageUrl}
                  />
                );
              })} */}
            </div>
            <EmptyCustom title="No Invites Yet" message="" />
          </div>
        </div>
      </section>
    </div>
  );
}
