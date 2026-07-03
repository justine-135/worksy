"use client";

import { Button, Drawer, Separator } from "@heroui/react";
import { useState } from "react";
import { BiPencil } from "react-icons/bi";

import PermissionGuard from "@/components/common/PermissionGuard";
import { Permissions } from "@/enum/permissions.enum";
import { useApiMessage } from "@/hooks/common/useApiMessage";
import useEditRoleMutation from "@/hooks/role/useEditRoleMutation";
import { CreateRoleInput } from "@/lib/validations/addRole.schema";
import { useSessionStore } from "@/store/session.store";

import RoleForm from "./RoleForm";

interface EditRoleDrawerProps {
  onClose?: () => void;
  role: {
    id: string;
    name: string;
    permissions: {
      key: string;
    }[];
  };
}

export default function EditRoleDrawer({ onClose, role }: EditRoleDrawerProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const projectId = useSessionStore((s) => s.projectId);
  const { mutation } = useEditRoleMutation({ projectId });
  const { showSuccess, showError } = useApiMessage();

  const onSubmit = (data: CreateRoleInput) => {
    mutation.mutate(
      { ...data, roleId: role.id },
      {
        onSuccess: (result) => {
          onClose?.();
          setIsOpen(false);
          showSuccess(result);
        },
        // Keep the drawer open on failure so edits aren't lost.
        onError: (error) => {
          showError(error, "Failed to update role");
        },
      },
    );
  };

  const handleOpen = () => setIsOpen(true);

  return (
    <Drawer>
      <PermissionGuard permission={Permissions.RolesEdit}>
        <Button
          isIconOnly
          size="sm"
          variant="tertiary"
          onClick={handleOpen}
        >
          <BiPencil />
        </Button>
      </PermissionGuard>
      <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content placement="right">
          <Drawer.Dialog className="min-w-125">
            <Drawer.Header>
              <Drawer.Heading>Edit Role: {role.name}</Drawer.Heading>
              <Separator className="my-2" />
            </Drawer.Header>
            <Drawer.Body>
              <RoleForm
                initialValues={{
                  id: role.id,
                  name: role.name,
                  permissions: role.permissions.map(
                    (permission) => permission.key,
                  ),
                }}
                isPending={mutation.isPending}
                onSubmit={onSubmit}
              />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </Drawer>
  );
}
