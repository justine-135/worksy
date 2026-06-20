"use client";

import { useForm, useWatch, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@heroui/react/form";
import {
  Checkbox,
  CheckboxGroup,
  Description,
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
import CustomButton from "@/components/common/custom/CustomButton";
import { toast } from "@heroui/react/toast";

interface RoleFormProps {
  initialValues?: { id: string; name: string; permissions: string[] };
  isPending: boolean;
  onSubmit: (data: CreateRoleInput) => void;
}

export default function RoleForm({
  initialValues,
  isPending,
  onSubmit,
}: RoleFormProps) {
  const { handleSubmit, setValue, control } = useForm<CreateRoleInput>({
    resolver: zodResolver(addRoleSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      permissions: initialValues?.permissions ?? [],
    },
  });

  const selectedPermissions =
    useWatch({
      control,
      name: "permissions",
      defaultValue: initialValues?.permissions,
    }) || [];

  const onError = (errors: FieldErrors<CreateRoleInput>) => {
    const firstError = errors.name?.message || errors.permissions?.message;
    if (firstError) {
      queueMicrotask(() => toast.danger(firstError));
    }
  };

  console.log(initialValues?.permissions, selectedPermissions);

  return (
    <Form onSubmit={handleSubmit(onSubmit, onError)}>
      <div className="w-full">
        <Controller
          name="name"
          control={control}
          render={({ field: { value, onChange, onBlur, name } }) => (
            <TextField
              name={name}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              className="mb-4 w-full"
            >
              <Label>Role name</Label>
              <Input placeholder="Enter role name... e.g: Developer" />
            </TextField>
          )}
        />
        <Label className="block mb-2 font-medium">Select permissions</Label>
      </div>

      <div className="max-h-[68vh] w-full overflow-y-auto pt-2 pr-2">
        <div className="flex flex-col space-y-8">
          {PERMISSIONS.map((permission) => (
            <div key={permission.name} className="flex flex-col gap-2">
              <span className="font-semibold text-sm">{permission.name}</span>
              <Separator />
              <CheckboxGroup
                name="permissions"
                value={selectedPermissions}
                onChange={(values) => setValue("permissions", values)}
              >
                {permission.permission.map((key) => (
                  <div key={key.name}>
                    <Checkbox value={key.key}>
                      <div className="flex gap-3">
                        <Checkbox.Control>
                          <Checkbox.Indicator />
                        </Checkbox.Control>
                        <Checkbox.Content className="flex flex-col items-start">
                          <Label>{key.name}</Label>
                          <Description>{key.content}</Description>
                        </Checkbox.Content>
                      </div>
                    </Checkbox>
                  </div>
                ))}
              </CheckboxGroup>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mt-6">
        <CustomButton
          title={initialValues ? "Save Changes" : "Submit"}
          isPending={isPending}
          loadingTitle={initialValues ? "Saving" : "Submitting"}
          type="submit"
          className="w-full"
        />
      </div>
    </Form>
  );
}
