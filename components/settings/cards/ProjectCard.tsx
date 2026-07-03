"use client";

import {
  Form,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import { Controller } from "react-hook-form";

import CustomButton from "@/components/common/custom/CustomButton";
import FieldError from "@/components/common/FieldError";
import SettingsSection from "@/components/settings/SettingsSection";
import { PRIORITY_OPTIONS } from "@/constant/taskPriority";
import { ETaskPriority } from "@/enum/taskPriority.enum";
import { useProjectSettingsForm } from "@/hooks/project/useProjectSettingsForm";
import { ProjectDetailDTO } from "@/types/project.dto";

export default function ProjectCard({
  project,
  isOwner,
}: {
  project: ProjectDetailDTO;
  isOwner: boolean;
}) {
  const { register, control, errors, submit, isSubmitting } =
    useProjectSettingsForm(project);

  return (
    <SettingsSection
      title="Project"
      description={
        isOwner
          ? "Configure this project and the default priority for new tasks."
          : "Only the project owner can change these settings."
      }
    >
      <Form onSubmit={submit} className="space-y-4">
        <TextField>
          <Label>Project name</Label>
          <Input
            placeholder="Project name"
            disabled={!isOwner}
            {...register("title")}
          />
          <FieldError message={errors.title?.message} />
        </TextField>

        <TextField>
          <Label>Description</Label>
          <TextArea
            placeholder="(Optional)"
            disabled={!isOwner}
            {...register("description")}
          />
          <FieldError message={errors.description?.message} />
        </TextField>

        <Controller
          name="defaultTaskPriority"
          control={control}
          render={({ field: { value, onChange } }) => (
            <Select
              aria-label="Default task priority"
              value={value}
              isDisabled={!isOwner}
              onChange={(key) => onChange(key as ETaskPriority)}
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
          )}
        />

        {isOwner && (
          <CustomButton
            title="Save project"
            loadingTitle="Saving"
            isPending={isSubmitting}
          />
        )}
      </Form>
    </SettingsSection>
  );
}
