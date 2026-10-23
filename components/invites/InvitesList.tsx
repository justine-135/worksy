"use client";

import Image from "next/image";

import useApiMessage from "@/hooks/common/useApiMessage";
import useAcceptInvite from "@/hooks/member/useAcceptInvite";
import useDeclineInvite from "@/hooks/member/useDeclineInvite";
import { useSessionStore } from "@/store/session.store";
import { ProjectsResponseDTO } from "@/types/project.dto";
import { ProjectInviteResponseDTO } from "@/types/projectInvite.dto";
import { timeAgo } from "@/utils/timeAgo";

import CustomAvatar from "../common/custom/CustomAvatar";
import CustomButton from "../common/custom/CustomButton";
import { PROJECT_IMAGE_PLACEHOLDER } from "../projects/ProjectCard";

const InviteInformation = ({
  project,
  invite,
}: {
  project: Omit<ProjectsResponseDTO, "owner">;
  invite: ProjectInviteResponseDTO;
}) => {
  const userId = useSessionStore((state) => state.userId);
  const { mutation: acceptMutation } = useAcceptInvite();
  const { mutation: declineMutation } = useDeclineInvite();
  const { showSuccess } = useApiMessage();

  const membersCount = project.count || 0;
  const isProcessing = acceptMutation.isPending || declineMutation.isPending;

  const handleAccept = () => {
    if (!userId) return;
    acceptMutation.mutate(
      { inviteId: invite.id },
      { onSuccess: (result) => showSuccess(result) },
    );
  };

  const handleDecline = () => {
    if (!userId) return;
    declineMutation.mutate(
      { inviteId: invite.id },
      { onSuccess: (result) => showSuccess(result) },
    );
  };

  return (
    <div className="flex gap-4 rounded-2xl border border-default-200/60 bg-content1 p-4 transition-shadow hover:shadow-sm">
      <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl">
        <Image
          alt={`${project.title} project`}
          className="pointer-events-none select-none object-cover"
          fill
          sizes="72px"
          src={project.imageUrl || PROJECT_IMAGE_PLACEHOLDER}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{project.title}</p>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-default-500">
            <CustomAvatar
              avatarProps={{ className: "size-4" }}
              avatarImageProps={{
                src: invite.userSender.image || PROJECT_IMAGE_PLACEHOLDER,
                alt: invite.userSender.name,
              }}
              fallback={invite.userSender.name}
            />
            <span>
              Invited by{" "}
              <span className="font-medium text-default-700 dark:text-default-300">
                {invite.userSender.name}
              </span>
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-default-400">
            <span>
              {membersCount} {membersCount === 1 ? "member" : "members"}
            </span>
            <span aria-hidden="true">·</span>
            <span>{timeAgo(invite.createdAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <CustomButton
            type="button"
            size="sm"
            variant="outline"
            className="font-normal text-default-500"
            title="Decline"
            loadingTitle="Declining"
            isPending={declineMutation.isPending}
            isDisabled={isProcessing}
            onClick={handleDecline}
          />
          <CustomButton
            type="button"
            size="sm"
            variant="primary"
            title="Accept"
            loadingTitle="Accepting"
            isPending={acceptMutation.isPending}
            isDisabled={isProcessing}
            onClick={handleAccept}
          />
        </div>
      </div>
    </div>
  );
};

interface InvitesListProps {
  data?: ProjectInviteResponseDTO[];
}

export default function InvitesList({ data }: InvitesListProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      {data?.map((invite) => (
        <InviteInformation
          key={invite.id}
          project={invite.project}
          invite={invite}
        />
      ))}
    </div>
  );
}
