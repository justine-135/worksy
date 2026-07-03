"use client";

import {
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
  toast,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import CustomButton from "@/components/common/custom/CustomButton";
import SettingsSection from "@/components/settings/SettingsSection";
import { DEFAULT_TASK_PRIORITY, PRIORITY_OPTIONS } from "@/constant/taskPriority";
import { ETaskPriority } from "@/enum/taskPriority.enum";
import { useUpdateProjectSettings } from "@/hooks/project/useUpdateProjectSettings";
import {
  UpdateProjectSettingsInput,
  updateProjectSettingsSchema,
} from "@/lib/validations/updateProjectSettings.schema";
import { ProjectDetailDTO } from "@/types/project.dto";

export default function ProjectCard({
  project,
  isOwner,
}: {
  project: ProjectDetailDTO;
  isOwner: boolean;
}) {
  const { mutateAsync, isPending } = useUpdateProjectSettings(project.id);

  const [priority, setPriority] = useState<ETaskPriority>(
    (project.defaultTaskPriority as ETaskPriority) ?? DEFAULT_TASK_PRIORITY,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProjectSettingsInput>({
    resolver: zodResolver(updateProjectSettingsSchema),
    values: {
      title: project.title,
      description: project.description ?? "",
    },
  });

  const onSubmit = async (data: UpdateProjectSettingsInput) => {
    try {
      await mutateAsync({
        title: data.title,
        description: data.description ?? null,
        defaultTaskPriority: priority,
      });
      toast("Project settings updated");
    } catch (error) {
      toast.danger(
        error instanceof Error ? error.message : "Failed to update project",
      );
    }
  };

  return (
    <SettingsSection
      title="Project"
      description={
        isOwner
          ? "Configure this project and the default priority for new tasks."
          : "Only the project owner can change these settings."
      }
    >
      <Form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <TextField>
          <Label>Project name</Label>
          <Input
            placeholder="Project name"
            disabled={!isOwner}
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-danger">{errors.title.message}</p>
          )}
        </TextField>

        <TextField>
          <Label>Description</Label>
          <TextArea
            placeholder="(Optional)"
            disabled={!isOwner}
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-danger">
              {errors.description.message}
            </p>
          )}
        </TextField>

        <Select
          aria-label="Default task priority"
          value={priority}
          isDisabled={!isOwner}
          onChange={(key) => setPriority(key as ETaskPriority)}
        >
          <Label>Default task priority</Label>
          <Select.Trigger className="flex w-full items-center justify-between rounded-lg border border-border bg-surface p-2">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {PRIORITY_OPTIONS.map((option) => (
                <ListBox.Item
                  id={option.value}
                  key={option.value}
                  textValue={option.label}
                  className="flex items-center justify-between gap-2"
                >
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        {isOwner && (
          <CustomButton
            title="Save project"
            loadingTitle="Saving"
            isPending={isPending}
          />
        )}
      </Form>
    </SettingsSection>
  );
}
