"use client";

import { Drawer, Separator } from "@heroui/react";
import { Button } from "@heroui/react/button";
import { toast } from "@heroui/react/toast";
import { useState } from "react";

import useAddRoleMutation from "@/hooks/role/useAddRoleMutation";
import { CreateRoleInput } from "@/lib/validations/addRole.schema";
import { useSessionStore } from "@/store/session.store";

import RoleForm from "./RoleForm";

export default function AddRoleDrawer() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const projectId = useSessionStore((s) => s.projectId);
  const { mutation } = useAddRoleMutation({ projectId });

  const handleOpenChange = () => setIsOpen(!isOpen);

  const onSubmit = (data: CreateRoleInput) => {
    mutation.mutate(
      { ...data, projectId },
      {
        onSuccess: () => {
          setIsOpen(false);
          queueMicrotask(() => toast("Role added successfully"));
        },
        onError: () => {
          setIsOpen(false);
          queueMicrotask(() => toast.danger("Failed to add role"));
        },
      },
    );
  };

  return (
    <div>
      <Drawer>
        <Button onClick={handleOpenChange}>Add Role</Button>
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
