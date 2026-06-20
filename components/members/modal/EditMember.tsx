"use client";

import { Button } from "@heroui/react/button";

import CustomButton from "@/components/common/custom/CustomButton";

import { Modal } from "@heroui/react/modal";
import { Controller, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react/toast";
import { Form } from "@heroui/react/form";
import { useSessionStore } from "@/store/session.store";
import { BiPencil } from "react-icons/bi";
import { ComboBox, Input, Label, ListBox, Select } from "@heroui/react";
import { StatusDTO } from "@/enum/member";
import { STATUS_LABEL } from "@/constant/member";
import {
  EditMemberInput,
  editMemberSchema,
} from "@/lib/validations/editMember.schema";
import { Key, useState } from "react";
import { ProjectMemberTableDTO } from "@/types/projectMember.dto";
import { useGetRoles } from "@/hooks/role/useGetRoles";
import { RolesResponseDTO } from "@/types/roles.dto";
import useUpdateMemberStatusRole from "@/hooks/member/useUpdateMemberStatusRole";

const EditMemberButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Button onClick={onClick} isIconOnly size="sm" variant="tertiary">
      <BiPencil />
    </Button>
  );
};

const SelectStatusDropdown = ({
  defaultValue,
  onChange,
}: {
  defaultValue: StatusDTO;
  onChange: () => void;
}) => {
  return (
    <Select
      className="flex! flex-row! items-center gap-2"
      onChange={onChange}
      value={defaultValue}
    >
      <Label className="w-20 text-muted">Status</Label>

      <Select.Trigger className="flex flex-1 items-center justify-between rounded-lg border p-2 bg-surface w-18">
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>

      <Select.Popover>
        <ListBox>
          {Object.values(StatusDTO).map((status) => (
            <ListBox.Item key={status} id={status} textValue={status}>
              {STATUS_LABEL[status]}
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
};

interface RoleComboBoxProps {
  onChange: (role: Key | null) => void;
  role: ProjectMemberTableDTO["role"];
}

function RoleComboBox({ onChange, role }: RoleComboBoxProps) {
  const projectId = useSessionStore((s) => s.projectId);

  const { data: roles } = useGetRoles({ projectId });

  return (
    <ComboBox
      aria-label="search for roles"
      menuTrigger="focus"
      className="flex! flex-row! items-center gap-2"
      defaultItems={roles || []}
      defaultInputValue={role.name}
      isRequired={true}
      onChange={(e) => onChange(e)}
    >
      <Label className="w-20 text-muted">Role</Label>

      <ComboBox.InputGroup className="w-74">
        <Input placeholder="Search for roles..." />
      </ComboBox.InputGroup>

      <ComboBox.Popover>
        <ListBox>
          {(item: RolesResponseDTO) => (
            <ListBox.Item key={item.id} id={item.id} textValue={item.name}>
              {item.name}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
    </ComboBox>
  );
}

interface EditMemberProps {
  status: StatusDTO;
  role: ProjectMemberTableDTO["role"];
  userId: string;
}

export default function EditMember(props: EditMemberProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const projectId = useSessionStore((s) => s.projectId);

  const { mutation } = useUpdateMemberStatusRole({ projectId });

  const handleOpenChange = () => {
    if (!isOpen) reset();
    setIsOpen(!isOpen);
  };

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditMemberInput>({
    resolver: zodResolver(editMemberSchema),
    values: {
      status: props.status,
      roleId: props.role.id,
    },
  });

  const onSubmit = (data: EditMemberInput) => {
    mutation.mutate(
      {
        ...data,
        userId: props.userId,
      },
      {
        onSuccess: () => {
          reset();
          setIsOpen(false);
          toast("Member updated successfully");
        },
        onError: () => {
          reset();
          setIsOpen(false);
          toast.danger("Failed to update member");
        },
      },
    );
  };

  return (
    <div>
      <EditMemberButton onClick={handleOpenChange} />
      <Modal.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Edit Member</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Modal.Body className="p-2 space-y-2">
                <Controller
                  name="status"
                  control={control}
                  render={({ field: { value, onChange } }) => {
                    console.log(value, props.status);
                    return (
                      <SelectStatusDropdown
                        defaultValue={value}
                        onChange={onChange}
                      />
                    );
                  }}
                />
                {errors.status && (
                  <p className="error-text mt-1 text-danger text-sm">
                    {errors.status.message}
                  </p>
                )}
                <Controller
                  name="roleId"
                  control={control}
                  render={({ field: { onChange } }) => (
                    <RoleComboBox role={props.role} onChange={onChange} />
                  )}
                />
                {errors.roleId && (
                  <p className="error-text mt-1 text-danger text-sm">
                    {errors.roleId.message}
                  </p>
                )}
              </Modal.Body>
              <Modal.Footer>
                <CustomButton
                  title="Update Member"
                  isPending={mutation.isPending}
                  loadingTitle="Updating Member"
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
