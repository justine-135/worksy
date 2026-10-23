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

  const { mutation } = useCreateInvite();
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

  const handleOpen = () => {
    setMember(undefined);
    reset();
    setIsOpen(true);
  };

  const handleClose = () => {
    setMember(undefined);
    reset();
    setIsOpen(false);
  };

  useEffect(() => {
    setValue("receiverId", member?.id ?? "");
  }, [member, setValue]);

  const onSubmit = (data: InviteMemberInput) => {
    mutation.mutate(data, {
      onSuccess: (result) => {
        handleClose();
        showSuccess(result);
      },
      onError: (result) => {
        showError(result);
      },
    });
  };

  return (
    <div>
      <CustomButton
        onClick={handleOpen}
        title="Invite member"
        permission={Permissions.MemberInvite}
      />
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Invite member</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="flex flex-col gap-3 p-4">
                {member ? (
                  <UserSurface
                    member={member}
                    onClear={() => setMember(undefined)}
                  />
                ) : (
                  <UserComboBox onSelect={setMember} />
                )}
                {errors.receiverId && (
                  <p className="text-xs text-danger">
                    {errors.receiverId.message}
                  </p>
                )}
                <input hidden {...register("projectId")} value={projectId ?? ""} />
                {errors.projectId && (
                  <p className="text-xs text-danger">
                    {errors.projectId.message}
                  </p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  title="Send invite"
                  isPending={mutation.isPending}
                  loadingTitle="Sending..."
                  type="submit"
                  isDisabled={!member}
                />
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
