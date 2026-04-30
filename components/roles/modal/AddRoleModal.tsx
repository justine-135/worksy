"use client";

import { Button } from "@heroui/react/button";

import CustomButton from "@/components/button/CustomButton";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@heroui/react/toast";
import { Form } from "@heroui/react/form";
import { useSessionStore } from "@/store/session.store";
import {
  Checkbox,
  CheckboxGroup,
  Description,
  Drawer,
  Input,
  Label,
  Separator,
  TextField,
} from "@heroui/react";
import { PERMISSIONS } from "@/constant/permissions";
import {
  addRoleSchema,
  CreateRoleInput,
} from "@/lib/validations/addRole.schema";
import useAddRoleMutation from "@/hooks/role/useAddRoleMutation";

const AddRoleButton = ({ onClick }: { onClick: () => void }) => {
  return <Button onClick={onClick}>Add Role</Button>;
};

export default function AddRoleModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const projectId = useSessionStore((s) => s.projectId);

  const { mutation } = useAddRoleMutation({ projectId });

  const handleOpenChange = () => {
    setIsOpen(!isOpen);
  };

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<CreateRoleInput>({
      resolver: zodResolver(addRoleSchema),
    });

  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPermissions = watch("permissions") || [];

  const onSubmit = (data: CreateRoleInput) => {
    console.log(data);
    mutation.mutate(
      {
        ...data,
        projectId,
      },
      {
        onSuccess: () => {
          reset();
          setIsOpen(false);
          toast("Role added successfully");
        },
        onError: () => {
          reset();
          setIsOpen(false);
          toast.danger("Failed to add role");
        },
      },
    );
  };

  const onError = (errors: FieldErrors<CreateRoleInput>) => {
    const firstError = errors.name?.message || errors.permissions?.message;

    if (firstError) {
      toast.danger(firstError);
    }
  };

  return (
    <div>
      <Drawer>
        <AddRoleButton onClick={handleOpenChange} />
        <Drawer.Backdrop isOpen={isOpen} onOpenChange={setIsOpen}>
          <Drawer.Content placement="right">
            <Drawer.Dialog>
              <Form onSubmit={handleSubmit(onSubmit, onError)}>
                <Drawer.Header>
                  <Drawer.Heading>Add Role</Drawer.Heading>
                  <TextField>
                    <Label>Name</Label>
                    <Input
                      {...register("name")}
                      placeholder="Enter role name... e.g: Developer"
                    />
                  </TextField>
                </Drawer.Header>
                <Drawer.Body className="max-h-[75vh] pt-6">
                  <div className="flex flex-col space-y-8">
                    {PERMISSIONS.map((permission) => (
                      <div
                        key={permission.name}
                        className="flex flex-col gap-2"
                      >
                        {permission.name}
                        <Separator />
                        <CheckboxGroup
                          name="permissions"
                          value={selectedPermissions}
                          onChange={(values) => {
                            console.log(values);
                            setValue("permissions", values);
                          }}
                        >
                          {permission.permission.map((key) => (
                            <div
                              key={key.name}
                              className="flex items-center gap-1"
                            >
                              <Checkbox value={key.key}>
                                <Checkbox.Control>
                                  <Checkbox.Indicator />
                                </Checkbox.Control>
                                <Checkbox.Content>
                                  <Label>{key.name}</Label>
                                  <Description>{key.content}</Description>
                                </Checkbox.Content>
                              </Checkbox>
                            </div>
                          ))}
                        </CheckboxGroup>
                      </div>
                    ))}
                  </div>
                </Drawer.Body>
                <Drawer.Footer>
                  <CustomButton
                    title="Submit"
                    isPending={mutation.isPending}
                    loadingTitle="Submitting"
                    type="submit"
                  />
                </Drawer.Footer>
              </Form>
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </div>
  );
}
