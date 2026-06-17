"use client";

import CustomButton from "@/components/button/CustomButton";
import { UserComboBox } from "./UserComboBox";
import { UserResponseDTO } from "@/types/user.dto";
import { useEffect, useState } from "react";
import UserSurface from "./UserSurface";
import { Modal } from "@heroui/react/modal";
import { useForm } from "react-hook-form";
import {
  InviteMemberInput,
  inviteMemberSchema,
} from "@/lib/validations/inviteMember.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react/toast";
import { Form } from "@heroui/react/form";
import { useSessionStore } from "@/store/session.store";
import useCreateInvite from "@/hooks/invite/useCreateInvite";
import { Permissions } from "@/enum/permissions.enum";
import { usePermission } from "@/hooks/permission/usePermission";

export default function InviteMemberModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [member, setMember] = useState<UserResponseDTO | undefined>(undefined);

  const { hasPermission, isLoadingPermission } = usePermission();
  const isPermission = hasPermission(Permissions.MemberInvite);

  const projectId = useSessionStore((s) => s.projectId);
  const userId = useSessionStore((s) => s.userId);

  const { mutation } = useCreateInvite({ receiverId: member?.id });

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
      setValue("receiverId", member.id);
    } else {
      setValue("receiverId", "");
    }
  }, [member, setValue]);

  const onSubmit = (data: InviteMemberInput) => {
    if (!userId) {
      toast.danger("User not authenticated");
      return;
    }
    mutation.mutate(
      {
        ...data,
        senderId: userId,
      },
      {
        onSuccess: () => {
          reset();
          setIsOpen(false);
          toast("Invite sent successfully");
        },
        onError: () => {
          reset();
          setIsOpen(false);
          toast.danger("Failed to send invite");
        },
      },
    );
  };

  return (
    <div>
      <CustomButton
        onClick={handleOpenChange}
        title="Invite member"
        hidden={!isPermission}
        isPending={isLoadingPermission}
      />
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
                {errors.receiverId && <p>{errors.receiverId.message}</p>}
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
