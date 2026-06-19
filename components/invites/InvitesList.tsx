import { ProjectInviteResponseDTO } from "@/types/projectInvite.dto";
import { Typography } from "@heroui/react/typography";
import { Surface } from "@heroui/react/surface";
import Image from "next/image";
import { PROJECT_IMAGE_PLACEHOLDER } from "../projects/ProjectCard";
import { timeAgo } from "@/utils/timeAgo";
import CustomButton from "../button/CustomButton";
import { MdPerson } from "react-icons/md";
import { GoClock } from "react-icons/go";
import { ProjectsResponseDTO } from "@/types/project.dto";
import useInviteMember from "@/hooks/member/useInviteMember";
import { useSessionStore } from "@/store/session.store";
import { toast } from "@heroui/react";
import CustomAvatar from "../avatar/CustomAvatar";

const InviteInformationTypography = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Typography.Paragraph
      size="sm"
      className="text-muted flex items-center gap-1"
    >
      {children}
    </Typography.Paragraph>
  );
};

const InviteInformation = ({
  project,
  invite,
}: {
  project: Omit<ProjectsResponseDTO, "owner">;
  invite: ProjectInviteResponseDTO;
}) => {
  const userId = useSessionStore((state) => state.userId);
  const { mutation: inviteMemberMutation } = useInviteMember({
    receiverId: userId,
  });
  const membersCount = project.members.length || 0;

  const handleAcceptInvite = () => {
    if (!userId) return;
    inviteMemberMutation.mutate(
      {
        inviteId: invite.id,
      },
      {
        onSuccess: () => {
          toast("Invite accepted");
        },
      },
    );
  };

  return (
    <Surface
      className="flex items-center gap-4 p-2 rounded-3xl"
      variant="secondary"
    >
      <div className="relative aspect-square w-14 overflow-hidden rounded-2xl">
        <Image
          alt={`${project.title} project icon`}
          className="pointer-events-none object-cover select-none"
          fill
          sizes="56px"
          src={project.imageUrl || PROJECT_IMAGE_PLACEHOLDER}
        />
      </div>
      <div>
        <Typography.Paragraph weight="medium">
          {project.title}
        </Typography.Paragraph>
        <div className="flex items-center gap-5">
          <InviteInformationTypography>
            <CustomAvatar
              avatarProps={{ className: "size-5" }}
              avatarImageProps={{
                src: invite.userSender.image || PROJECT_IMAGE_PLACEHOLDER,
                alt: invite.userSender.name,
              }}
              fallback={invite.userSender.name}
            />
            {invite.userSender.name}
          </InviteInformationTypography>
          <InviteInformationTypography>
            <MdPerson />
            {membersCount} {membersCount === 1 ? "member" : "members"}
          </InviteInformationTypography>
          <InviteInformationTypography>
            <GoClock />
            {timeAgo(invite.createdAt)}
          </InviteInformationTypography>
        </div>
      </div>
      <div className="ml-auto flex gap-2">
        <CustomButton
          variant="outline"
          title="Accept"
          onClick={handleAcceptInvite}
          isPending={inviteMemberMutation.isPending}
          loadingTitle="Accepting"
        />
        <CustomButton variant="outline" title="Decline" />
      </div>
    </Surface>
  );
};

interface InvitesListProps {
  data?: ProjectInviteResponseDTO[];
}

export default function InvitesList({ data }: InvitesListProps) {
  return (
    <div className="flex flex-wrap w-full">
      {data?.map((invite) => {
        const { id, project } = invite;
        return (
          <div key={id} className="w-full p-2 space-y-2">
            <InviteInformation project={project} invite={invite} />
          </div>
        );
      })}
    </div>
  );
}
