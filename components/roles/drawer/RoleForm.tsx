"use client";

import {
  Checkbox,
  CheckboxGroup,
  Description,
  Input,
  Label,
  TextField,
} from "@heroui/react";
import { Form } from "@heroui/react/form";
import { toast } from "@heroui/react/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import { Controller, FieldErrors, useForm, useWatch } from "react-hook-form";
import {
  MdChecklist,
  MdDashboard,
  MdGroup,
  MdSettings,
  MdViewKanban,
} from "react-icons/md";

import CustomButton from "@/components/common/custom/CustomButton";
import { PERMISSIONS } from "@/constant/permissions";
import {
  addRoleSchema,
  CreateRoleInput,
} from "@/lib/validations/addRole.schema";

const CATEGORY_ICONS: Record<string, ReactNode> = {
  Dashboard: <MdDashboard size={13} />,
  Board: <MdViewKanban size={13} />,
  Task: <MdChecklist size={13} />,
  Member: <MdGroup size={13} />,
  Settings: <MdSettings size={13} />,
};

const totalPermissions = PERMISSIONS.reduce(
  (sum, cat) => sum + cat.permission.length,
  0,
);

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
        <div className="flex items-center justify-between">
          <Label className="font-medium">Permissions</Label>
          <span className="text-xs text-muted">
            {selectedPermissions.length} of {totalPermissions} selected
          </span>
        </div>
      </div>

      <div className="max-h-[68vh] w-full overflow-y-auto pt-2 pr-2">
        <div className="flex flex-col space-y-3">
          {PERMISSIONS.map((permission) => {
            const categoryKeys: string[] = permission.permission.map((p) => p.key);
            const allSelected = categoryKeys.every((k) =>
              selectedPermissions.includes(k),
            );
            const someSelected = categoryKeys.some((k) =>
              selectedPermissions.includes(k),
            );
            const isIndeterminate = someSelected && !allSelected;

            const handleSelectAll = (checked: boolean) => {
              if (checked) {
                setValue(
                  "permissions",
                  Array.from(new Set([...selectedPermissions, ...categoryKeys])),
                );
              } else {
                setValue(
                  "permissions",
                  selectedPermissions.filter((k) => !categoryKeys.includes(k)),
                );
              }
            };

            return (
              <div
                key={permission.name}
                className="rounded-lg border border-border bg-surface-muted p-3 space-y-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted flex items-center gap-1.5">
                    {CATEGORY_ICONS[permission.name]}
                    {permission.name}
                  </span>
                  <Checkbox
                    isSelected={allSelected}
                    isIndeterminate={isIndeterminate}
                    onChange={handleSelectAll}
                    aria-label={`Select all ${permission.name} permissions`}
                  >
                    <div className="flex gap-2 items-center">
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <Label className="text-xs cursor-pointer">
                        Select all
                      </Label>
                    </div>
                  </Checkbox>
                </div>

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
            );
          })}
        </div>
      </div>

      <div className="w-full mt-6">
        <CustomButton
          title={initialValues ? "Save Changes" : "Create role"}
          isPending={isPending}
          loadingTitle={initialValues ? "Saving" : "Creating"}
          type="submit"
          className="w-full"
        />
      </div>
    </Form>
  );
}
