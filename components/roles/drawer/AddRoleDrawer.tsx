"use client";

import { Drawer, Separator } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { useState } from "react";

import PermissionGuard from "@/components/common/PermissionGuard";
import { Permissions } from "@/enum/permissions.enum";
import { useApiMessage } from "@/hooks/common/useApiMessage";
import useAddRoleMutation from "@/hooks/role/useAddRoleMutation";
import { CreateRoleInput } from "@/lib/validations/addRole.schema";
import { useSessionStore } from "@/store/session.store";

import RoleForm from "./RoleForm";

export default function AddRoleDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const projectId = useSessionStore((s) => s.projectId);
  const { mutation } = useAddRoleMutation({ projectId });
  const { showSuccess, showError } = useApiMessage();

  const handleOpenChange = () => setIsOpen(!isOpen);

  const onSubmit = (data: CreateRoleInput) => {
    mutation.mutate(
      { ...data, projectId },
      {
        // showSuccess/showError already defer the toast internally, so the
        // manual queueMicrotask wrapper is no longer needed.
        onSuccess: (result) => {
          setIsOpen(false);
          showSuccess(result);
        },
        onError: (error) => {
          setIsOpen(false);
          showError(error, "Failed to add role");
        },
      },
    );
  };

  return (
    <div>
      <Drawer>
        <PermissionGuard permission={Permissions.RolesCreate}>
          <Button onClick={handleOpenChange}>Add Role</Button>
        </PermissionGuard>
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog className="min-w-125">
              <Drawer.Header>
                <Drawer.Heading>Add Role</Drawer.Heading>
                <Separator className="my-2" />
              </Drawer.Header>
              <Drawer.Body>
                <RoleForm isPending={mutation.isPending} onSubmit={onSubmit} />
              </Drawer.Body>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
