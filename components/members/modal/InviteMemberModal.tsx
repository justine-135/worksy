"use client";

import { Form } from "@heroui/react/form";
import { Modal } from "@heroui/react/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import CustomButton from "@/components/common/custom/CustomButton";
import { Permissions } from "@/enum/permissions.enum";
import useApiMessage from "@/hooks/common/useApiMessage";
import useCreateInvite from "@/hooks/invite/useCreateInvite";
import {
  InviteMemberInput,
  inviteMemberSchema,
} from "@/lib/validations/inviteMember.schema";
import { useSessionStore } from "@/store/session.store";
import { UserResponseDTO } from "@/types/user.dto";

import { UserComboBox } from "./UserComboBox";
import UserSurface from "./UserSurface";

export default function InviteMemberModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [member, setMember] = useState<UserResponseDTO | undefined>(undefined);

  const projectId = useSessionStore((s) => s.projectId);

  const { mutation } = useCreateInvite({ receiverId: member?.id });

  const handleOpenChange = () => {
    if (!isOpen) {
      setMember(undefined);
    }

    setIsOpen(!isOpen);
  };

  const { showSuccess, showError } = useApiMessage();

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
    mutation.mutate(
      {
        ...data,
      },
      {
        onSuccess: (result) => {
          reset();
          setIsOpen(false);
          showSuccess(result);
        },
        onError: (result) => {
          reset();
          setIsOpen(false);
          showError(result);
        },
      },
    );
  };

  return (
    <div>
      <CustomButton
        onClick={handleOpenChange}
        title="Invite member"
        permission={Permissions.MemberInvite}
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
