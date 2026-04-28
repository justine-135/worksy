"use client";

import { Button } from "@heroui/react/button";

import CustomButton from "@/components/button/CustomButton";
import { UserComboBox } from "./UserComboBox";
import { UserResponseDTO } from "@/types/user.dto";
import { useEffect, useState } from "react";
import UserSurface from "./UserSurface";
import { Modal } from "@heroui/react/modal";
import useInviteMember from "@/hooks/member/useInviteMember";
import { useForm } from "react-hook-form";
import {
  InviteMemberInput,
  inviteMemberSchema,
} from "@/lib/validations/inviteMember.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react/toast";
import { Form } from "@heroui/react/form";
import { useSessionStore } from "@/store/session.store";

const InviteMemberButton = ({ onClick }: { onClick: () => void }) => {
  return <Button onClick={onClick}>Invite Member</Button>;
};

export default function InviteMemberDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [member, setMember] = useState<UserResponseDTO | undefined>(undefined);
  const projectId = useSessionStore((s) => s.projectId);

  const { mutation } = useInviteMember({ invalidateMembers: async () => {} });

  const handleOpenChange = () => {
    if (!isOpen) {
      setMember(undefined);
    }

    setIsOpen(!isOpen);
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
  });

  useEffect(() => {
    if (member) {
      setValue("userId", member.id);
    } else {
      setValue("userId", "");
    }
  }, [member, setValue]);

  const onSubmit = (data: InviteMemberInput) => {
    mutation.mutate(
      {
        ...data,
      },
      {
        onSuccess: () => {
          reset();
          setIsOpen(false);
          toast("Member invited successfully");
        },
        onError: () => {
          reset();
          setIsOpen(false);
          toast.danger("Failed to invite member");
        },
      },
    );
  };

  return (
    <div>
      <InviteMemberButton onClick={handleOpenChange} />
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Invite Member</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="p-2">
                <UserComboBox setMember={setMember} />
                {member && <UserSurface member={member} />}
                <input
                  hidden
                  {...register("projectId")}
                  value={projectId as string}
                />
                {errors.projectId && <p>{errors.projectId.message}</p>}
                {errors.userId && <p>{errors.userId.message}</p>}
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  title="Send Invite"
                  isPending={mutation.isPending}
                  loadingTitle="Sending Invite"
                  type="submit"
                />
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
